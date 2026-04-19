/**
 * API Logger — captures full request/response details for every
 * backend API call, including headers, query params, request body,
 * and JSON response body.
 */

import type { MonitorState, ApiLogEntry } from "./types";

// ── Constants ────────────────────────────────────────────────────────

/** Maximum API log entries to keep in memory */
const MAX_API_LOG_ENTRIES = 500;

/** Paths that start with these prefixes are considered API calls (not static assets) */
const API_PATH_PREFIXES = ["/api/", "/v1/", "/v2/", "/graphql", "/rest/"];

/** Response body max length to store */
const MAX_RESPONSE_BODY_LENGTH = 5000;

// ── Request tracking ─────────────────────────────────────────────────

/** Track pending requests so we can match responses */
const pendingRequests = new Map<string, {
	id: string;
	method: string;
	url: string;
	requestBody?: string;
	contentType?: string;
	queryString?: string;
	headers?: Record<string, string>;
	resourceType?: string;
	startTime: number;
}>();

let logIdCounter = 0;

// ── Should log? ──────────────────────────────────────────────────────

function isApiRequest(url: string, resourceType?: string): boolean {
	// Only care about XHR/Fetch requests (not images, scripts, styles, etc.)
	if (resourceType && resourceType !== "Fetch" && resourceType !== "XHR") {
		return false;
	}
	// Filter out static assets
	if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)(\?|$)/)) {
		return false;
	}
	// Filter out Vite dev server requests
	if (url.includes("/@vite/") || url.includes("/node_modules/") || url.includes("/src/")) {
		return false;
	}
	if (url.includes("/@react-refresh") || url.includes("/@fs/")) {
		return false;
	}
	// Include API calls
	for (const prefix of API_PATH_PREFIXES) {
		if (url.includes(prefix)) return true;
	}
	// Include same-origin requests that look like API calls
	try {
		const parsed = new URL(url);
		if (parsed.pathname.includes("/api/") || parsed.pathname.includes("/v1/")) {
			return true;
		}
	} catch { /* not a valid URL */ }

	return false;
}

// ── Filter headers ───────────────────────────────────────────────────

function filterHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
	if (!headers) return undefined;
	const important = ["content-type", "authorization", "accept", "origin", "referer",
		"x-requested-with", "cache-control", "cookie", "host"];
	const filtered: Record<string, string> = {};
	for (const [k, v] of Object.entries(headers)) {
		const lower = k.toLowerCase();
		if (important.some(h => lower.includes(h)) || lower.startsWith("x-")) {
			// Mask auth tokens
			if (lower === "authorization" && v.length > 15) {
				filtered[k] = v.substring(0, 10) + "...(redacted)";
			} else {
				filtered[k] = v;
			}
		}
	}
	return Object.keys(filtered).length > 0 ? filtered : undefined;
}

// ── Event handlers ──────────────────────────────────────────────────

export function handleRequestWillBeSent(params: Record<string, unknown>, state: MonitorState): void {
	const req = params.request as Record<string, unknown>;
	const requestId = params.requestId as string;
	const url = (req.url as string) || "";
	const resourceType = params.type as string | undefined;

	if (!isApiRequest(url, resourceType)) return;

	const qIdx = url.indexOf("?");
	pendingRequests.set(requestId, {
		id: `api-${Date.now()}-${++logIdCounter}`,
		method: (req.method as string) || "GET",
		url,
		requestBody: req.postData ? String(req.postData).substring(0, 10000) : undefined,
		contentType: (req.headers?.["Content-Type"] || req.headers?.["content-type"]) as string | undefined,
		queryString: qIdx >= 0 ? url.substring(qIdx + 1) : undefined,
		headers: filterHeaders(req.headers as Record<string, string> | undefined),
		resourceType,
		startTime: Date.now(),
	});
}

export function handleResponseReceived(params: Record<string, unknown>, state: MonitorState): void {
	const requestId = params.requestId as string;
	const resp = params.response as Record<string, unknown>;
	const pending = pendingRequests.get(requestId);
	if (!pending) return;

	const entry: ApiLogEntry = {
		id: pending.id,
		timestamp: pending.startTime,
		method: pending.method,
		url: pending.url,
		path: new URL(pending.url).pathname,
		queryString: pending.queryString,
		requestHeaders: pending.headers,
		requestBody: pending.requestBody,
		contentType: pending.contentType,
		status: resp.status as number,
		statusText: resp.statusText as string,
		responseHeaders: filterHeaders(resp.headers as Record<string, string> | undefined),
		responseMimeType: resp.mimeType as string | undefined,
		duration: Date.now() - pending.startTime,
		isError: (resp.status as number) >= 400,
		resourceType: pending.resourceType,
	};

	state.apiLog.push(entry);

	// Keep bounded
	if (state.apiLog.length > MAX_API_LOG_ENTRIES) {
		state.apiLog.splice(0, state.apiLog.length - MAX_API_LOG_ENTRIES);
	}

	pendingRequests.delete(requestId);
}

export function handleLoadingFailed(params: Record<string, unknown>, state: MonitorState): void {
	const requestId = params.requestId as string;
	const pending = pendingRequests.get(requestId);
	if (!pending) return;

	const entry: ApiLogEntry = {
		id: pending.id,
		timestamp: pending.startTime,
		method: pending.method,
		url: pending.url,
		path: new URL(pending.url).pathname,
		queryString: pending.queryString,
		requestHeaders: pending.headers,
		requestBody: pending.requestBody,
		contentType: pending.contentType,
		duration: Date.now() - pending.startTime,
		isError: true,
		errorText: params.errorText as string,
		resourceType: pending.resourceType,
	};

	state.apiLog.push(entry);

	if (state.apiLog.length > MAX_API_LOG_ENTRIES) {
		state.apiLog.splice(0, state.apiLog.length - MAX_API_LOG_ENTRIES);
	}

	pendingRequests.delete(requestId);
}

/** Attach a response body to a previously logged entry */
export function attachResponseBody(requestId: string, body: string, state: MonitorState): void {
	const pending = pendingRequests.get(requestId);
	if (pending) {
		// Entry hasn't been logged yet — store on pending
		pending.requestBody = pending.requestBody; // keep it as-is
		return;
	}

	// Find the matching entry in the API log
	const entry = state.apiLog.find(e => e.id.endsWith(requestId) || e.url.includes(requestId));
	if (entry && !entry.responseBody) {
		entry.responseBody = body.substring(0, MAX_RESPONSE_BODY_LENGTH);
	}
}

// ── Query helpers ────────────────────────────────────────────────────

/** Get API log entries, optionally filtered */
export function getApiLog(state: MonitorState, options?: {
	filter?: "errors" | "all" | "post" | "get";
	path?: string;
	count?: number;
}): ApiLogEntry[] {
	let entries = [...state.apiLog];

	if (options?.filter === "errors") {
		entries = entries.filter(e => e.isError);
	} else if (options?.filter === "post") {
		entries = entries.filter(e => e.method === "POST" || e.method === "PUT" || e.method === "PATCH");
	} else if (options?.filter === "get") {
		entries = entries.filter(e => e.method === "GET");
	}

	if (options?.path) {
		const pathFilter = options.path;
		entries = entries.filter(e => e.path?.includes(pathFilter));
	}

	const count = options?.count || 50;
	return entries.slice(-count);
}

/** Format an API log entry for display */
export function formatApiEntry(entry: ApiLogEntry): string {
	const lines: string[] = [];
	const ts = new Date(entry.timestamp).toISOString().substr(11, 12);
	const statusIcon = entry.isError ? "❌" : entry.status ? "✓" : "⚠️";

	lines.push(`${statusIcon} [${ts}] ${entry.method} ${entry.path || entry.url}`);
	if (entry.queryString) {
		lines.push(`  query: ${entry.queryString.substring(0, 200)}`);
	}
	if (entry.status) {
		lines.push(`  status: ${entry.status} ${entry.statusText || ""}`);
	}
	if (entry.requestBody) {
		lines.push(`  request body: ${entry.requestBody.substring(0, 300)}`);
	}
	if (entry.responseBody) {
		lines.push(`  response body: ${entry.responseBody.substring(0, 300)}`);
	}
	if (entry.contentType) {
		lines.push(`  content-type: ${entry.contentType}`);
	}
	if (entry.duration !== undefined) {
		lines.push(`  duration: ${entry.duration}ms`);
	}
	if (entry.errorText) {
		lines.push(`  error: ${entry.errorText}`);
	}

	return lines.join("\n");
}
