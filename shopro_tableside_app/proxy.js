#!/usr/bin/env node
/**
 * Shopro Tableside Smart Proxy
 *
 * Architecture:
 *   Mobile Browser → :3002 (this proxy)
 *       /api/*  → localhost:8080  (Spring Boot)
 *       /img/*  → fetch → sharp transcode → LRU cache (in-memory)
 *       /*      → localhost:8081  (Flutter web dev server)
 *
 * Features:
 *  - WebSocket pass-through for Flutter hot-reload
 *  - Image transcoding via sharp (max 600px wide, WebP 65% quality)
 *  - In-memory LRU image cache (50 MB max)
 *  - Single-origin serving → zero CORS issues
 */

'use strict';

const http = require('http');
const https = require('https');
const { createHash } = require('crypto');
let sharp;
try { sharp = require('sharp'); } catch (_) { sharp = null; }

// ─── Config ────────────────────────────────────────────────────────────────
const PROXY_PORT = 3002;
const BACKEND_PORT = 8080;
const FLUTTER_PORT = 8081;
const IMG_MAX_W = 600;
const IMG_QUALITY = 65;
const CACHE_MAX_MB = 50;

// ─── Simple LRU image cache ─────────────────────────────────────────────────
const imgCache = new Map();
let cacheBytes = 0;

function cacheSet(key, buf, mime) {
    if (imgCache.has(key)) return;
    if (cacheBytes + buf.length > CACHE_MAX_MB * 1024 * 1024) {
        // Evict oldest until we have room
        for (const [k, v] of imgCache) {
            imgCache.delete(k);
            cacheBytes -= v.buf.length;
            if (cacheBytes + buf.length <= CACHE_MAX_MB * 1024 * 1024) break;
        }
    }
    imgCache.set(key, { buf, mime });
    cacheBytes += buf.length;
    console.log(`[IMG CACHE] +${(buf.length / 1024).toFixed(1)}kB  total:${(cacheBytes / 1024 / 1024).toFixed(1)}MB  key:${key.slice(0, 60)}`);
}

function cacheGet(key) { return imgCache.get(key) || null; }

// ─── Fetch external image and transcode ─────────────────────────────────────
async function fetchAndTranscode(url) {
    const key = createHash('sha1').update(url).digest('hex');
    const hit = cacheGet(key);
    if (hit) { console.log('[IMG CACHE] HIT', key.slice(0, 10)); return hit; }

    const buf = await new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers: { 'User-Agent': 'Shopro-Proxy/1.0' } }, (res) => {
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });

    if (sharp) {
        const webp = await sharp(buf)
            .resize({ width: IMG_MAX_W, withoutEnlargement: true })
            .webp({ quality: IMG_QUALITY })
            .toBuffer();
        const entry = { buf: webp, mime: 'image/webp' };
        cacheSet(key, webp, 'image/webp');
        return entry;
    }

    const entry = { buf, mime: 'image/jpeg' };
    cacheSet(key, buf, 'image/jpeg');
    return entry;
}

// ─── Generic HTTP proxy ──────────────────────────────────────────────────────
function httpProxy(req, res, targetPort, targetHost = 'localhost') {
    const opts = {
        hostname: targetHost,
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `${targetHost}:${targetPort}` },
    };

    const pReq = http.request(opts, (pRes) => {
        res.writeHead(pRes.statusCode, {
            ...pRes.headers,
            'Access-Control-Allow-Origin': '*',
        });
        pRes.pipe(res, { end: true });
    });

    pReq.on('error', (err) => {
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end(`Proxy error → :${targetPort}\n${err.message}`);
        }
    });

    req.pipe(pReq, { end: true });
}

// ─── Image proxy handler ─────────────────────────────────────────────────────
async function imageProxy(req, res) {
    // /img?url=<encoded-url>
    const rawUrl = new URL(`http://x${req.url}`).searchParams.get('url');
    if (!rawUrl) { res.writeHead(400); res.end('missing url param'); return; }

    console.log('[IMG] requested:', rawUrl.slice(0, 80));
    try {
        const { buf, mime } = await fetchAndTranscode(decodeURIComponent(rawUrl));
        res.writeHead(200, {
            'Content-Type': mime,
            'Content-Length': buf.length,
            'Cache-Control': 'public, max-age=86400',
            'X-Image-Source': 'shopro-proxy',
        });
        res.end(buf);
    } catch (err) {
        console.error('[IMG] error:', err.message);
        res.writeHead(502); res.end(`Image fetch failed: ${err.message}`);
    }
}

// ─── Main server ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
            'Access-Control-Allow-Headers': '*',
        });
        res.end();
        return;
    }

    if (req.url.startsWith('/api/')) {
        process.stdout.write(`[API] ${req.method} ${req.url}\n`);
        httpProxy(req, res, BACKEND_PORT);
    } else if (req.url.startsWith('/img')) {
        imageProxy(req, res);
    } else {
        httpProxy(req, res, FLUTTER_PORT);
    }
});

// ─── WebSocket upgrade (Flutter hot-reload & DART debug) ────────────────────
server.on('upgrade', (req, socket, head) => {
    console.log('[WS] upgrade:', req.url);
    const target = http.request({
        hostname: 'localhost',
        port: FLUTTER_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers,
    });

    target.on('upgrade', (tRes, tSocket) => {
        socket.write(
            `HTTP/1.1 101 Switching Protocols\r\n` +
            Object.entries(tRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
            '\r\n\r\n'
        );
        tSocket.write(head);
        tSocket.pipe(socket);
        socket.pipe(tSocket);
    });

    target.on('error', (err) => {
        console.error('[WS] error:', err.message);
        socket.destroy();
    });

    target.end();
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
    const sharpStatus = sharp ? '✅ sharp (WebP transcode)' : '⚠️  sharp missing (raw pass-through)';
    console.log(`
╔══════════════════════════════════════════════════╗
║       Shopro Tableside Proxy  •  Port ${PROXY_PORT}        ║
╠══════════════════════════════════════════════════╣
║  Flutter UI   → localhost:${FLUTTER_PORT}                   ║
║  Backend API  → localhost:${BACKEND_PORT}                   ║
║  Image cache  → ${sharpStatus.padEnd(32)} ║
╠══════════════════════════════════════════════════╣
║  Open on mobile:                                 ║
║  http://192.168.0.102:${PROXY_PORT}/?tableId=A1           ║
╚══════════════════════════════════════════════════╝
`);
});
