/**
 * Chrome Debug Monitor — Pi Extension
 *
 * Monitors Chrome for console errors, network failures, and tracks user
 * actions via the Chrome DevTools Protocol (CDP). When an error is
 * detected, it automatically generates an RCA report (including the user
 * action trail and network context) and delivers it to the Pi agent.
 *
 * Prerequisites:
 *   Launch Chrome with remote debugging enabled:
 *     google-chrome --remote-debugging-port=9222
 *
 *   Or use an existing Chrome profile:
 *     google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
 *
 * Features:
 *   - Auto-detects errors (JS exceptions, console.error, 4xx/5xx, network failures)
 *   - Tracks every user interaction (clicks, inputs, navigation, form submits)
 *   - Logs all API requests/responses between browser and backend
 *   - Builds RCA reports with steps to recreate
 *   - Sends reports to the Pi agent in real-time
 *   - Auto-launches Chrome if not running with debug port
 *   - Agent can query current state with `chrome_debug_status` tool
 *   - Agent can retrieve specific reports with `chrome_debug_report` tool
 *   - Agent can view API logs with `chrome_debug_api_log` tool
 *   - Agent can run Playwright tests with `chrome_debug_run_tests` tool
 *
 * Commands:
 *   /chrome-connect   — Connect to Chrome (or launch it with debug port)
 *   /chrome-status    — Show current monitoring status
 *   /chrome-reports    — List all captured error reports
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { state, resetState, cdp, setCDP } from "./lib/state";
import type { ErrorReport } from "./report-builder";
import { registerCommands } from "./lib/commands";
import { registerTools } from "./lib/tools";
import { doConnectQuiet, launchChrome, waitForChrome, doCleanup } from "./lib/connection";
import { handleCDPEvent, setReportSender } from "./lib/handlers";

export default function (pi: ExtensionAPI) {
	const port = parseInt(process.env.CHROME_DEBUG_PORT || "9222", 10);
	state.port = port;

	// ── Register commands and tools ───────────────────────────────────

	registerCommands(pi);
	registerTools(pi);

	// ── Report sender — bridges handlers to pi.sendMessage ───────────

	setReportSender((report: ErrorReport) => {
		if (!state.autoNotify) return;

		pi.events.emit("chrome:report", report);

		pi.sendMessage(
			{
				customType: "chrome-debug-report",
				content: formatReportSummary(report),
				display: true,
				details: report,
			},
			{ triggerTurn: true },
		);
	});

	// ── Message renderer for chrome-debug reports ────────────────────

	pi.registerMessageRenderer("chrome-debug-report", (message, options, theme) => {
		const expanded = options.expanded;
		let text = theme.fg("error", "🔴 ") + theme.fg("accent", "Chrome Error: ");
		text += theme.fg("muted", (message.content || "").substring(0, 100));

		if (expanded && message.details) {
			const r = message.details as ErrorReport;
			if (r.actionTrail) {
				text += "\n" + theme.fg("dim", `  ${r.actionTrail.length} user actions before error`);
			}
		}

		return { render(width: number) { return [text]; }, invalidate() {} };
	});

	// ── Session lifecycle ─────────────────────────────────────────────

	pi.on("session_start", async (_event, ctx) => {
		// Restore state from session entries
		resetState();
		state.port = port;

		const entries = ctx.sessionManager.getBranch();
		for (const entry of entries) {
			if (entry.type !== "message") continue;
			const msg = entry.message;
			if (msg.role !== "toolResult") continue;
			if (msg.toolName === "chrome_debug_status" && msg.details) {
				const d = msg.details as Record<string, unknown>;
				if (d.connected) state.connected = true;
				if (d.port) state.port = d.port as number;
			}
		}

		// Try auto-connect (with auto-launch if Chrome not running)
		try {
			await doConnectQuiet(port);
			if (ctx.hasUI) {
				ctx.ui.notify(`👁 Chrome Debug Monitor connected (port ${port})`, "info");
				ctx.ui.setStatus("chrome-debug", `👁 Monitoring (${port})`);
			}
		} catch {
			// Chrome not reachable — try to launch it
			try {
				await launchChrome(port, "http://localhost:5173", ctx);
				await waitForChrome(port, 10000);
				await doConnectQuiet(port);
				if (ctx.hasUI) {
					ctx.ui.notify(`👁 Chrome launched & connected (port ${port})`, "success");
					ctx.ui.setStatus("chrome-debug", `👁 Monitoring (${port})`);
				}
			} catch {
				if (ctx.hasUI) {
					ctx.ui.setStatus("chrome-debug", `👁 Not connected (click /chrome-connect)`);
				}
			}
		}
	});

	pi.on("session_shutdown", async () => {
		doCleanup();
	});

	// ── Helpers ───────────────────────────────────────────────────────

	function formatReportSummary(report: ErrorReport): string {
		const lines: string[] = [];
		lines.push(`🔴 **Chrome Error Detected** [${report.errorType}]`);
		lines.push(`**Summary:** ${report.summary}`);
		lines.push(`**Page:** ${report.url}`);
		lines.push(`**Time:** ${new Date(report.timestamp).toISOString()}`);

		if (report.actionTrail.length > 0) {
			lines.push("");
			lines.push(`**User was doing:**`);
			for (const a of report.actionTrail.slice(-5)) {
				const time = new Date(a.ts).toISOString().substr(11, 12);
				lines.push(`  - [${time}] ${a.type}: ${JSON.stringify(a).substring(0, 120)}`);
			}
		}

		lines.push("");
		lines.push(`**Steps to recreate:**`);
		for (const step of report.stepsToRecreate) {
			lines.push(`  ${step}`);
		}

		lines.push("");
		lines.push(`Use \`chrome_debug_report\` tool with index "${state.reports.length}" or "latest" for the full RCA.`);

		return lines.join("\n");
	}

	function truncate(s: string, max: number): string {
		return s.length > max ? s.substring(0, max) + "..." : s;
	}

	function truncateUrl(url: string, max = 100): string {
		if (!url) return "";
		return url.length > max ? url.substring(0, max) + "..." : url;
	}
}