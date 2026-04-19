/**
 * Connection management — connect, launch, reconnect, cleanup.
 */

import { CDPClient, type CDPTarget } from "../cdp-client";
import { TRACKER_SCRIPT, CONSOLE_CAPTURE_SCRIPT } from "../action-tracker";
import { state, cdp, setCDP } from "./state";
import { setupEventHandlers } from "./handlers";

// ── Connect to Chrome ────────────────────────────────────────────────

export async function doConnectQuiet(customPort: number): Promise<void> {
	// Clean up existing connection
	doCleanup();

	const newCdp = new CDPClient({ port: customPort });
	setCDP(newCdp);
	state.port = customPort;
	await newCdp.connect();

	// Choose the first page target
	const targets = await newCdp.listTargets();
	if (targets.length === 0) throw new Error("No page targets found");
	const target = targets[0];

	// Connect to the specific target
	await newCdp.connect(target);
	state.target = target;
	state.connected = true;

	// Enable CDP domains (MUST be done BEFORE adding bindings)
	await newCdp.enableDomains();

	// Set up event listeners BEFORE anything else
	setupEventHandlers();

	// Add bindings BEFORE scripts (so scripts can use them immediately)
	await newCdp.addBinding("__piAction");
	await newCdp.addBinding("__piConsole");

	// Register scripts to run on every new document load
	await newCdp.addScriptToEvaluateOnNewDocument(TRACKER_SCRIPT);
	await newCdp.addScriptToEvaluateOnNewDocument(CONSOLE_CAPTURE_SCRIPT);

	// Reload the page so scripts + bindings are activated together
	try {
		await newCdp.send("Page.reload");
		await new Promise(r => setTimeout(r, 2000));
	} catch {
		try {
			await newCdp.evaluate(TRACKER_SCRIPT);
			await newCdp.evaluate(CONSOLE_CAPTURE_SCRIPT);
		} catch { /* page not ready */ }
	}

	state.monitoring = true;
}

// ── Launch Chrome ────────────────────────────────────────────────────

export async function launchChrome(port: number, url: string, ctx: any): Promise<void> {
	// Find the Chrome binary
	const chromePaths = [
		"google-chrome-stable",
		"google-chrome",
		"chromium-browser",
		"chromium",
	];

	let chromeBin = "";
	for (const bin of chromePaths) {
		try {
			const result = await import("node:child_process").then(cp => cp.execSync(`which ${bin}`, { timeout: 3000 }));
			if (result.toString().trim()) {
				chromeBin = result.toString().trim();
				break;
			}
		} catch { /* not found */ }
	}

	if (!chromeBin) {
		const absPaths = [
			"/usr/bin/google-chrome-stable",
			"/usr/bin/google-chrome",
			"/usr/bin/chromium-browser",
			"/usr/bin/chromium",
			"/opt/google/chrome/chrome",
		];
		const fs = await import("node:fs");
		for (const p of absPaths) {
			if (fs.existsSync(p)) { chromeBin = p; break; }
		}
	}

	if (!chromeBin) {
		throw new Error("Chrome not found. Install google-chrome-stable or chromium.");
	}

	const dataDir = "/tmp/chrome-debug-profile";

	// Check if Chrome is already running WITHOUT debug port
	try {
		const cp = await import("node:child_process");
		const result = cp.execSync("pgrep -f chrome", { timeout: 3000 });
		// Chrome is running — check if it has debug port
		try {
			const debugCheck = cp.execSync("pgrep -f remote-debugging-port", { timeout: 3000 });
			// Already has debug port, just need to connect
			return;
		} catch { /* no debug port */ }
		// Chrome running without debug port — launch separate instance
		if (ctx?.hasUI) ctx.ui.notify("Chrome is running but without debug port. Launching separate instance...", "warning");
	} catch { /* pgrep not available or Chrome not running */ }

	// Launch Chrome with debugging port
	if (ctx?.hasUI) ctx.ui.notify(`Launching Chrome: ${chromeBin} --remote-debugging-port=${port}`, "info");

	const { spawn } = await import("node:child_process");
	const chromeProc = spawn(chromeBin, [
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${dataDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		url,
	], {
		detached: true,
		stdio: "ignore",
	});
	chromeProc.unref();
}

// ── Wait for Chrome to be ready ─────────────────────────────────────

export async function waitForChrome(port: number, timeoutMs: number): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const resp = await fetch(`http://127.0.0.1:${port}/json/version`);
			if (resp.ok) return;
		} catch { /* Not ready yet */ }
		await new Promise(r => setTimeout(r, 500));
	}
	throw new Error(`Chrome did not start within ${timeoutMs / 1000}s on port ${port}`);
}

// ── Cleanup ──────────────────────────────────────────────────────────

export function doCleanup(): void {
	if (cdp) {
		cdp.close();
		setCDP(null);
	}
	state.connected = false;
	state.monitoring = false;
}