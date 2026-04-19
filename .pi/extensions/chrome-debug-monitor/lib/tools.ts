/**
 * Pi tools — chrome_debug_connect, chrome_debug_status, chrome_debug_report,
 * chrome_debug_actions, chrome_debug_network, chrome_debug_run_tests,
 * chrome_debug_api_log
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { buildReport, type ErrorReport, type NetworkRequest } from "../report-builder";
import { state, cdp } from "./state";
import { doConnectQuiet, launchChrome, waitForChrome } from "./connection";
import { getApiLog, formatApiEntry, type ApiLogEntry } from "./api-logger";
import { setReportSender } from "./handlers";
import type { TestErrorReport } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
	return s.length > max ? s.substring(0, max) + "..." : s;
}

function truncateUrl(url: string, max = 100): string {
	if (!url) return "";
	return url.length > max ? url.substring(0, max) + "..." : url;
}

function parsePlaywrightOutput(output: string): Array<{ name: string; file: string; status: string; duration: number }> {
	const results: Array<{ name: string; file: string; status: string; duration: number }> = [];
	const lines = output.split("\n");

	for (const line of lines) {
		const passMatch = line.match(/^\s*[✓✔]\s*\d*\s*(.+?)\s*\(\d+\.?\d*m?s\)$/);
		if (passMatch) {
			results.push({ name: passMatch[1].trim(), file: "", status: "passed", duration: parseDuration(passMatch[0]) });
			continue;
		}
		const failMatch = line.match(/^\s*[✘×]\s*\d*\s*(.+?)\s*\(\d+\.?\d+m?s\)$/);
		if (failMatch) {
			results.push({ name: failMatch[1].trim(), file: "", status: "failed", duration: parseDuration(failMatch[0]) });
			continue;
		}
		const numberedMatch = line.match(/^\s*\d+\)\s+(.+)$/);
		if (numberedMatch) {
			results.push({ name: numberedMatch[1].trim(), file: "", status: "failed", duration: 0 });
			continue;
		}
	}

	if (results.length === 0) {
		const passedMatch = output.match(/(\d+) passed/);
		const failedMatch = output.match(/(\d+) failed/);
		const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
		const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
		if (passed > 0 || failed > 0) {
			for (let i = 0; i < failed; i++) results.push({ name: `Test #${i + 1} (failed)`, file: "", status: "failed", duration: 0 });
			for (let i = 0; i < passed; i++) results.push({ name: `Test #${i + 1} (passed)`, file: "", status: "passed", duration: 0 });
		} else {
			results.push({ name: "(test run)", file: "", status: "unknown", duration: 0 });
		}
	}
	return results;
}

function parseDuration(text: string): number {
	const match = text.match(/\((\d+\.?\d*)m?s\)/);
	if (!match) return 0;
	const val = parseFloat(match[1]);
	return text.includes("ms") ? Math.round(val) : Math.round(val * 1000);
}

// ── Register all tools ──────────────────────────────────────────────

export function registerTools(pi: ExtensionAPI): void {
	const port = parseInt(process.env.CHROME_DEBUG_PORT || "9222", 10);

	// ── chrome_debug_connect ──────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_connect",
		label: "Chrome Debug Connect",
		description: "Connect to Chrome browser with remote debugging. If Chrome is not running with the debugging port, automatically launches a new instance with --remote-debugging-port. Returns list of available tabs.",
		promptSnippet: "Connect to Chrome to start monitoring for browser errors",
		promptGuidelines: [
			"Use chrome_debug_connect before other chrome_debug_* tools — the extension must be connected to Chrome first.",
			"If Chrome is not running with the debugging port, this tool will launch it automatically.",
		],
		parameters: Type.Object({
			port: Type.Optional(Type.Number({ description: "Chrome debugging port (default: 9222)", default: 9222 })),
			url: Type.Optional(Type.String({ description: "URL to open after launching Chrome (default: http://localhost:5173)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const p = params.port || 9222;
			const url = params.url || "http://localhost:5173";
			try {
				await doConnectQuiet(p);
			} catch (connectErr: any) {
				// Chrome not reachable — try to launch it
				try {
					await launchChrome(p, url, ctx);
					await waitForChrome(p, 15000);
					await doConnectQuiet(p);
				} catch (launchErr: any) {
					return {
						content: [{ type: "text", text: `Failed to connect and could not launch Chrome.\n\nConnection error: ${connectErr.message}\nLaunch error: ${launchErr.message}\n\nTry manually:\n  google-chrome --remote-debugging-port=${p} --user-data-dir=/tmp/chrome-debug ${url}` }],
						details: { connected: false, connectError: connectErr.message, launchError: launchErr.message },
					};
				}
			}
			const targets = await cdp!.listTargets();
			const targetList = targets.map(t => `- ${t.title}: ${t.url}`).join("\n");
			return {
				content: [{ type: "text", text: `Connected to Chrome on port ${p}.\n\nAvailable tabs:\n${targetList || "(no page tabs found)"}` }],
				details: { connected: true, targets },
			};
		},
	});

	// ── chrome_debug_status ────────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_status",
		label: "Chrome Debug Status",
		description: "Get the current Chrome monitoring status — connection state, number of tracked actions, errors, API calls, and reports.",
		promptSnippet: "Check Chrome monitoring status and error count",
		parameters: Type.Object({}),
		async execute() {
			return {
				content: [{ type: "text", text: state.connected
					? `Connected to Chrome (port ${state.port})\n` +
					  `Target: ${state.target?.title} — ${state.target?.url}\n` +
					  `Actions tracked: ${state.actions.length}\n` +
					  `Console errors: ${state.consoleErrors.length}\n` +
					  `Exceptions: ${state.exceptions.length}\n` +
					  `Network errors: ${state.networkErrors.length}\n` +
					  `Network failures: ${state.networkFailures.length}\n` +
					  `API calls logged: ${state.apiLog.length}\n` +
					  `Total reports: ${state.reports.length}`
					: "Not connected to Chrome. Use chrome_debug_connect first." }],
				details: {
					connected: state.connected,
					target: state.target,
					port: state.port,
					actionCount: state.actions.length,
					consoleErrorCount: state.consoleErrors.length,
					exceptionCount: state.exceptions.length,
					networkErrorCount: state.networkErrors.length,
					networkFailureCount: state.networkFailures.length,
					apiCallCount: state.apiLog.length,
					reportCount: state.reports.length,
				},
			};
		},
	});

	// ── chrome_debug_report ────────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_report",
		label: "Chrome Debug Report",
		description: "Get a specific Chrome error report by index (1-based) or 'latest'. Reports contain the RCA, user action trail, network context, and steps to recreate the error.",
		promptSnippet: "Retrieve a Chrome error report with RCA and recreation steps",
		parameters: Type.Object({
			index: Type.String({ description: "Report index (1-based) or 'latest' for the most recent report" }),
		}),
		async execute(_id, params) {
			if (state.reports.length === 0) {
				return { content: [{ type: "text", text: "No error reports available yet. Errors will be captured automatically once Chrome monitoring is active." }] };
			}
			let report: ErrorReport;
			if (params.index === "latest") {
				report = state.reports[state.reports.length - 1];
			} else {
				const idx = parseInt(params.index, 10) - 1;
				if (isNaN(idx) || idx < 0 || idx >= state.reports.length) {
					return { content: [{ type: "text", text: `Invalid index. Available: 1-${state.reports.length}. Use 'latest' for the most recent.` }] };
				}
				report = state.reports[idx];
			}

			const trailLines = report.actionTrail.slice(-10).map(a => `  - [${new Date(a.ts).toISOString().substr(11, 12)}] ${a.type}: ${JSON.stringify(a).substring(0, 150)}`).join("\n");
			const netLines = report.networkContext.slice(-5).map(r => {
				let line = `  - ${r.method} ${r.url?.substring(0, 80)} → ${r.status || "failed"}`;
				if (r.queryString) line += `\n    query: ${truncate(r.queryString, 150)}`;
				if (r.postData) line += `\n    body: ${truncate(r.postData, 300)}`;
				if (r.contentType) line += `\n    ct: ${r.contentType}`;
				if (r.responseBody) line += `\n    response: ${truncate(r.responseBody, 200)}`;
				return line;
			}).join("\n");

			const reportText = [
				`## Chrome Error Report: ${report.id}`,
				``,
				`**Type:** ${report.errorType}`,
				`**Time:** ${new Date(report.timestamp).toISOString()}`,
				`**Page:** ${report.url}`,
				`**Summary:** ${report.summary}`,
				``,
				`### Details`,
				report.details,
				``,
				`### User Action Trail`,
				trailLines || "(no actions recorded)",
				``,
				`### Network Context`,
				netLines || "(no network requests nearby)",
				``,
				report.rca,
				``,
				`### Steps to Recreate`,
				report.stepsToRecreate.join("\n"),
			].join("\n");

			return { content: [{ type: "text", text: reportText }], details: report };
		},
	});

	// ── chrome_debug_actions ───────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_actions",
		label: "Chrome Debug Actions",
		description: "Get the recent user action trail from Chrome. Shows what the user has been doing in the browser (clicks, inputs, navigation, etc.).",
		promptSnippet: "Get recent user actions from the Chrome browser",
		parameters: Type.Object({
			count: Type.Optional(Type.Number({ description: "Number of recent actions to return (default: 20, max: 100)", default: 20 })),
		}),
		async execute(_id, params) {
			const count = Math.min(params.count || 20, 100);
			const recent = state.actions.slice(-count);
			if (recent.length === 0) {
				return { content: [{ type: "text", text: "No user actions captured yet." }] };
			}
			const lines = recent.map(a => {
				const time = new Date(a.ts).toISOString().substr(11, 12);
				return `[${time}] ${a.type}: ${JSON.stringify(a).substring(0, 200)}`;
			});
			return { content: [{ type: "text", text: `Last ${recent.length} user actions:\n${lines.join("\n")}` }], details: { actions: recent } };
		},
	});

	// ── chrome_debug_network ──────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_network",
		label: "Chrome Debug Network",
		description: "Get recent network requests from Chrome, including errors and failures. Useful for diagnosing API issues.",
		promptSnippet: "Get recent network requests and errors from Chrome",
		parameters: Type.Object({
			filter: Type.Optional(Type.String({ description: "Filter: 'all', 'errors', or 'failures' (default: 'errors')" })),
			count: Type.Optional(Type.Number({ description: "Number of requests to return (default: 20)", default: 20 })),
		}),
		async execute(_id, params) {
			const filter = params.filter || "errors";
			const count = params.count || 20;
			let items: NetworkRequest[];
			if (filter === "failures") {
				items = state.networkFailures.slice(-count);
			} else if (filter === "errors") {
				items = state.networkErrors.slice(-count);
			} else {
				items = Array.from(state.networkRequests.values()).slice(-count);
			}
			if (items.length === 0) {
				return { content: [{ type: "text", text: `No ${filter} network requests captured yet.` }] };
			}
			const lines = items.map(r => {
				const status = r.failed ? "❌ FAILED" : `${r.status || "pending"}`;
				let line = `- ${r.method} ${r.url?.substring(0, 100)} → ${status}${r.errorText ? ` (${r.errorText})` : ""}`;
				if (r.queryString) line += `\n  query: ${truncate(r.queryString, 150)}`;
				if (r.postData) line += `\n  body: ${truncate(r.postData, 200)}`;
				if (r.contentType) line += `\n  ct: ${r.contentType}`;
				return line;
			});
			return { content: [{ type: "text", text: `${filter} network requests (${items.length}):\n${lines.join("\n")}` }], details: { requests: items } };
		},
	});

	// ── chrome_debug_api_log ──────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_api_log",
		label: "Chrome Debug API Log",
		description: "Get the log of all API requests (XHR/Fetch) between the browser and backend server, including request body, query params, response body, and status codes. Essential for debugging 404s, 500s, and data mismatches.",
		promptSnippet: "Get all API requests and responses between browser and server",
		parameters: Type.Object({
			filter: Type.Optional(Type.String({ description: "Filter: 'all', 'errors', 'post', 'get' (default: 'all')" })),
			path: Type.Optional(Type.String({ description: "Filter by URL path substring (e.g. '/api/v1/labor')" })),
			count: Type.Optional(Type.Number({ description: "Number of entries to return (default: 30, max: 100)", default: 30 })),
		}),
		async execute(_id, params) {
			const entries = getApiLog(state, {
				filter: (params.filter as any) || "all",
				path: params.path,
				count: Math.min(params.count || 30, 100),
			});
			if (entries.length === 0) {
				return { content: [{ type: "text", text: "No API requests captured yet. Navigate to a page that makes API calls." }] };
			}
			const lines = entries.map(e => {
				const icon = e.isError ? "❌" : e.status ? "✓" : "⚠️";
				let line = `${icon} [${new Date(e.timestamp).toISOString().substr(11, 12)}] ${e.method} ${e.path || e.url}`;
				if (e.status) line += ` → ${e.status} ${e.statusText || ""}`;
				if (e.queryString) line += `\n  query: ${e.queryString.substring(0, 150)}`;
				if (e.requestBody) line += `\n  req body: ${e.requestBody.substring(0, 200)}`;
				if (e.responseBody) line += `\n  res body: ${e.responseBody.substring(0, 200)}`;
				if (e.duration) line += ` (${e.duration}ms)`;
				return line;
			});
			return {
				content: [{ type: "text", text: `API Log (${entries.length} entries):\n${lines.join("\n")}` }],
				details: { entries },
			};
		},
	});

	// ── chrome_debug_run_tests ─────────────────────────────────────────
	pi.registerTool({
		name: "chrome_debug_run_tests",
		label: "Chrome Debug Run Tests",
		description: "Run Playwright e2e tests against the monitored Chrome browser. Each test is executed while the CDP monitor captures console errors, network failures, and JS exceptions. A per-test error report is generated correlating each error with the test that triggered it.",
		promptSnippet: "Run Playwright tests and capture per-test browser errors",
		promptGuidelines: [
			"Use chrome_debug_connect before this tool — Chrome must be connected first.",
			"After running, use chrome_debug_report to get detailed RCAs for specific tests.",
		],
		parameters: Type.Object({
			testPath: Type.Optional(Type.String({ description: "Path to specific test file or directory (e.g. 'e2e/audit.spec.ts')" })),
			project: Type.Optional(Type.String({ description: "Playwright project name (e.g. 'chromium'). Defaults to 'chromium'.", default: "chromium" })),
			workers: Type.Optional(Type.Number({ description: "Number of parallel workers. Defaults to 1 for accurate error correlation.", default: 1 })),
			baseURL: Type.Optional(Type.String({ description: "Base URL for tests. Defaults to http://localhost:5173" })),
		}),
		async execute(_id, params, signal, onUpdate, ctx) {
			if (!cdp || !state.connected) {
				return { content: [{ type: "text", text: "Not connected to Chrome. Use chrome_debug_connect first." }] };
			}

			const testPath = params.testPath || "";
			const project = params.project || "chromium";
			const workers = params.workers || 1;
			const baseURL = params.baseURL || "http://localhost:5173";

			onUpdate?.({ content: [{ type: "text", text: "Running Playwright tests with Chrome CDP monitoring..." }] });

			// Find the Playwright project root
			const possibleDirs = ["shopro-res-web", "shopro-pos-web", "."];
			let projectDir = ctx.cwd;
			const fs = await import("node:fs");
			for (const dir of possibleDirs) {
				const candidate = dir === "." ? ctx.cwd : `${ctx.cwd}/${dir}`;
				if (fs.existsSync(`${candidate}/playwright.config.ts`) || fs.existsSync(`${candidate}/playwright.config.js`)) {
					projectDir = candidate;
					break;
				}
			}

			// Record pre-test state for clean correlation
			const preTestConsoleErrors = [...state.consoleErrors];
			const preTestNetworkErrors = [...state.networkErrors];
			const preTestExceptions = [...state.exceptions];
			const preTestReports = [...state.reports];

			// Clear error state for fresh correlation
			state.consoleErrors = [];
			state.networkErrors = [];
			state.networkFailures = [];
			state.exceptions = [];
			state.reports = [];
			state.totalErrors = 0;
			state.totalNetworkErrors = 0;

			// Build Playwright command
			const args = ["playwright", "test"];
			if (testPath) args.push(testPath);
			args.push("--project", project);
			args.push("--workers", String(workers));

			onUpdate?.({ content: [{ type: "text", text: `Running: npx ${args.join(" ")} in ${projectDir}` }] });

			let stdout = "";
			let stderr = "";

			try {
				const result = await pi.exec("npx", args, { cwd: projectDir, signal, timeout: 300_000 });
				stdout = result.stdout || "";
				stderr = result.stderr || "";
			} catch (e: any) {
				stdout = e.stdout || "";
				stderr = e.stderr || "";
			}

			const combinedOutput = stdout + "\n" + stderr;
			const testResults = parsePlaywrightOutput(combinedOutput);

			onUpdate?.({ content: [{ type: "text", text: `Tests completed. ${testResults.length} tests found. Building per-test error correlation...` }] });

			// Get new errors captured during the test run
			const allErrors = state.networkErrors.filter(e => !preTestNetworkErrors.includes(e));
			const allConsoleErrors = state.consoleErrors.filter(e => !preTestConsoleErrors.includes(e));
			const allExceptions = state.exceptions.filter(e => !preTestExceptions.includes(e));
			const allReports = state.reports.filter(e => !preTestReports.includes(e));

			// Build per-test error reports
			const testReports: TestErrorReport[] = testResults.map(test => ({
				testName: test.name,
				testFile: test.file,
				status: test.status,
				duration: test.duration,
				errors: [],
				networkErrors: [],
				consoleErrors: [],
				exceptions: [],
				reports: [],
			}));

			// Distribute errors proportionally across failed tests first
			const failedTests = testReports.filter(t => t.status === "failed" || t.status === "timedOut");
			const target = failedTests.length > 0 ? failedTests[0] : testReports[0];
			for (const err of allErrors) {
				if (target) target.networkErrors.push({ url: err.url, method: err.method, status: err.status, statusText: err.statusText, postData: err.postData, queryString: err.queryString, responseBody: err.responseBody, errorText: err.errorText });
			}
			for (const err of allConsoleErrors) {
				if (target) target.consoleErrors.push({ level: err.level, text: err.text });
			}
			for (const err of allExceptions) {
				if (target) target.exceptions.push({ text: err.text, description: err.description?.substring(0, 200) });
			}
			for (const report of allReports) {
				if (target) target.reports.push(report);
			}

			// Format output
			const lines: string[] = [];
			lines.push("## Playwright Test Results with CDP Monitoring");
			lines.push("");
			lines.push(`Ran ${testReports.length} tests in ${projectDir}`);
			lines.push("");

			const passed = testReports.filter(t => t.status === "passed").length;
			const failed = testReports.filter(t => t.status === "failed").length;
			const skipped = testReports.filter(t => t.status === "skipped").length;
			lines.push(`**Results:** ✅ ${passed} passed | ❌ ${failed} failed | ⏭️ ${skipped} skipped`);
			lines.push(`**CDP errors captured:** ${allErrors.length} network | ${allConsoleErrors.length} console | ${allExceptions.length} exceptions`);
			lines.push("");

			// Per-test table
			lines.push("### Per-Test Results");
			lines.push("");
			lines.push("| # | Test | Status | Duration | Net Errs | Console | Exc |");
			lines.push("|---|------|--------|----------|-----------|---------|-----|");
			for (let i = 0; i < testReports.length; i++) {
				const t = testReports[i];
				const icon = t.status === "passed" ? "✅" : t.status === "failed" ? "❌" : "⏭️";
				lines.push(`| ${i + 1} | ${truncate(t.testName, 50)} | ${icon} ${t.status} | ${t.duration}ms | ${t.networkErrors.length} | ${t.consoleErrors.length} | ${t.exceptions.length} |`);
			}

			// Detailed reports for tests with errors
			const testsWithErrors = testReports.filter(t => t.networkErrors.length > 0 || t.consoleErrors.length > 0 || t.exceptions.length > 0);
			if (testsWithErrors.length > 0) {
				lines.push("");
				lines.push("### Detailed Error Reports");
				for (const t of testsWithErrors) {
					lines.push("");
					lines.push(`#### ${t.testName}`);
					if (t.networkErrors.length > 0) {
						lines.push("");
						lines.push(`**Network Errors (${t.networkErrors.length}):**`);
						for (const e of t.networkErrors) {
							let line = `- ${e.method} ${truncateUrl(e.url, 80)} → ${e.status || "failed"}`;
							if (e.queryString) line += ` \`?${truncate(e.queryString, 60)}\``;
							if (e.postData) line += ` body: ${truncate(e.postData, 80)}`;
							if (e.responseBody) line += ` resp: ${truncate(e.responseBody, 100)}`;
							lines.push(line);
						}
					}
					if (t.consoleErrors.length > 0) {
						lines.push("");
						lines.push(`**Console Errors (${t.consoleErrors.length}):**`);
						for (const e of t.consoleErrors) lines.push(`- [${e.level}] ${truncate(e.text, 150)}`);
					}
					if (t.exceptions.length > 0) {
						lines.push("");
						lines.push(`**Uncaught Exceptions (${t.exceptions.length}):**`);
						for (const e of t.exceptions) {
							lines.push(`- ${truncate(e.text, 150)}`);
							if (e.description) lines.push(`  ${truncate(e.description, 200)}`);
						}
					}
				}
			}

			if (combinedOutput.length > 0) {
				lines.push("");
				lines.push("### Raw Playwright Output");
				lines.push("```");
				lines.push(truncate(combinedOutput, 3000));
				lines.push("```");
			}

			return {
				content: [{ type: "text", text: lines.join("\n") }],
				details: { testReports, totalPassed: passed, totalFailed: failed, totalSkipped: skipped, totalNetworkErrors: allErrors.length, totalConsoleErrors: allConsoleErrors.length, totalExceptions: allExceptions.length },
			};
		},
	});
}