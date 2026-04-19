/**
 * Slash commands — /chrome-connect, /chrome-status, /chrome-reports
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { state } from "./state";
import { doConnectQuiet, launchChrome, waitForChrome } from "./connection";
import type { ErrorReport } from "../report-builder";

export function registerCommands(pi: ExtensionAPI): void {
	const port = parseInt(process.env.CHROME_DEBUG_PORT || "9222", 10);

	pi.registerCommand("chrome-connect", {
		description: "Connect to Chrome (auto-launches with debug port if not running)",
		handler: async (args, ctx) => {
			const customPort = args ? parseInt(args, 10) : port;
			if (isNaN(customPort)) {
				ctx.ui.notify("Invalid port number", "error");
				return;
			}
			try {
				await doConnectQuiet(customPort);
			} catch {
				// Chrome not reachable — try to launch it
				try {
					ctx.ui.notify("🔌 Chrome not detected. Launching with debug port...", "info");
					await launchChrome(customPort, "http://localhost:5173", ctx);
					await waitForChrome(customPort, 15000);
					await doConnectQuiet(customPort);
					ctx.ui.notify(`✅ Chrome launched & connected on port ${customPort}`, "success");
				} catch (err: any) {
					ctx.ui.notify(`❌ Could not start Chrome: ${err.message}`, "error");
				}
				return;
			}
			ctx.ui.notify(`✅ Connected to Chrome on port ${customPort}`, "success");
			ctx.ui.setStatus("chrome-debug", `👁 Monitoring (${customPort})`);
		},
	});

	pi.registerCommand("chrome-status", {
		description: "Show current Chrome debug monitoring status",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify(`Chrome Debug: ${state.connected ? "connected" : "disconnected"}`, "info");
				return;
			}
			const status = state.connected
				? `✅ Connected to: ${state.target?.title || "unknown"} (${state.target?.url || ""})`
				: "❌ Not connected. Use /chrome-connect to start monitoring.";
			ctx.ui.notify(status, state.connected ? "info" : "warning");

			if (state.connected) {
				ctx.ui.notify(
					`📊 ${state.actions.length} actions | ${state.totalErrors} errors | ${state.totalNetworkErrors} network errors | ${state.apiLog.length} API calls | ${state.reports.length} reports`,
					"info",
				);
				ctx.ui.setStatus("chrome-debug", `👁 Monitoring: ${state.totalErrors} errors, ${state.reports.length} reports`);
			}
		},
	});

	pi.registerCommand("chrome-reports", {
		description: "List all captured Chrome error reports",
		handler: async (_args, ctx) => {
			if (state.reports.length === 0) {
				ctx.ui.notify("No error reports captured yet", "info");
				return;
			}
			const lines = state.reports.map((r, i) =>
				`[${i + 1}] ${r.errorType} — ${r.summary.substring(0, 80)}`
			);
			pi.sendMessage({
				customType: "chrome-debug-reports",
				content: `**${state.reports.length} Chrome Error Reports:**\n\n${lines.join("\n")}`,
				display: true,
				details: { reports: state.reports.map(r => r.id) },
			});
		},
	});
}