/**
 * CDP event handlers — processes every event from Chrome DevTools Protocol.
 */

import type { CDPClient } from "../cdp-client";
import { TRACKER_SCRIPT, CONSOLE_CAPTURE_SCRIPT } from "../action-tracker";
import { buildReport, type UserAction, type ConsoleError, type NetworkRequest, type CDPException, type ErrorReport } from "../report-builder";
import type { MonitorState } from "./types";
import { handleRequestWillBeSent, handleResponseReceived, handleLoadingFailed } from "./api-logger";
import { cdp, state, autoNotify } from "./state";

// ── Utility ──────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
	return s.length > max ? s.substring(0, max) + "..." : s;
}

function truncateUrl(url: string, max = 100): string {
	if (!url) return "";
	return url.length > max ? url.substring(0, max) + "..." : url;
}

function formatStackTrace(stackTrace: { callFrames?: Array<{ functionName?: string; url?: string; lineNumber?: number; columnNumber?: number }> }): string {
	if (!stackTrace?.callFrames) return "";
	return stackTrace.callFrames
		.slice(0, 8)
		.map(f => `    at ${f.functionName || "<anonymous>"} (${f.url || ""}:${f.lineNumber ?? ""}:${f.columnNumber ?? ""})`)
		.join("\n");
}

function formatNetworkDetails(nr: NetworkRequest): string {
	let details = `${nr.method} ${truncateUrl(nr.url)}`;
	if (nr.status) details += ` → ${nr.status} ${nr.statusText || ""}`;
	if (nr.queryString) details += `\n  Query: ${truncate(nr.queryString, 300)}`;
	if (nr.postData) details += `\n  Body: ${truncate(nr.postData, 500)}`;
	if (nr.contentType) details += `\n  Content-Type: ${nr.contentType}`;
	if (nr.responseBody) details += `\n  Response: ${truncate(nr.responseBody, 500)}`;
	return details;
}

function getRecentNetworkRequests(): NetworkRequest[] {
	const cutoff = Date.now() - 60_000; // last 60 seconds
	return Array.from(state.networkRequests.values())
		.filter(r => (r.timing?.start ?? 0) > cutoff)
		.slice(-30);
}

// ── Setup ────────────────────────────────────────────────────────────

export function setupEventHandlers(): void {
	if (!cdp) return;

	cdp.onEvent((method, params) => {
		handleCDPEvent(method, params).catch(() => {
			// Swallow async handler errors
		});
	});
}

// ── Main event handler ──────────────────────────────────────────────

export async function handleCDPEvent(method: string, params: Record<string, unknown>): Promise<void> {
	switch (method) {
		// ── Console API called ─────────────────────────────────────
		case "Runtime.consoleAPICalled": {
			const level = params.type as string;
			if (level !== "error" && level !== "warning") return;

			const args = params.args as Array<{ type: string; value?: string; description?: string }>;
			const text = args
				.map(a => a.value ?? a.description ?? `[${a.type}]`)
				.join(" ")
				.substring(0, 500);

			const ce: ConsoleError = {
				level: level === "error" ? "error" : "warn",
				text,
				ts: Date.now(),
			};

			if (level === "error") {
				state.consoleErrors.push(ce);
				state.totalErrors++;

				const report = buildReport({
					errorType: "console_error",
					summary: truncate(text, 120),
					details: text,
					actions: [...state.actions],
					networkRequests: getRecentNetworkRequests(),
					url: state.target?.url || "",
					consoleError: ce,
				});
				report.id = `${report.id}-CON`;
				state.reports.push(report);
				sendReportToAgent(report);
			} else {
				if (text.toLowerCase().includes("deprecated") || text.toLowerCase().includes("failed")) {
					state.consoleErrors.push(ce);
				}
			}
			break;
		}

		// ── Uncaught exception ──────────────────────────────────────
		case "Runtime.exceptionThrown": {
			const detail = params.exceptionDetails as Record<string, unknown> | undefined;
			const excObj = detail?.exception as Record<string, unknown> | undefined;

			const text = (excObj?.description || detail?.text || "Unknown exception") as string;
			const stackTrace = (detail?.stackTrace as any)?.callFrames;
			const exc: CDPException = {
				text: truncate(text, 200),
				description: stackTrace
					? formatStackTrace(detail!.stackTrace as any)
					: truncate(text, 1000),
				url: detail?.url as string | undefined,
				line: detail?.lineNumber as number | undefined,
				column: detail?.columnNumber as number | undefined,
				ts: Date.now(),
			};

			state.exceptions.push(exc);
			state.totalErrors++;

			const report = buildReport({
				errorType: "exception",
				summary: truncate(text, 120),
				details: text,
				actions: [...state.actions],
				networkRequests: getRecentNetworkRequests(),
				url: state.target?.url || "",
				exception: exc,
			});
			report.id = `${report.id}-EXC`;
			state.reports.push(report);
			sendReportToAgent(report);
			break;
		}

		// ── Network request sent ──────────────────────────────────
		case "Network.requestWillBeSent": {
			const req = params.request as Record<string, unknown>;
			const requestId = params.requestId as string;
			const url = (req.url as string) || "";
			const qIdx = url.indexOf("?");
			const nr: NetworkRequest = {
				requestId,
				url,
				method: (req.method as string) || "GET",
				timing: { start: Date.now() },
				resourceType: params.type as string | undefined,
				headers: req.headers as Record<string, string> | undefined,
				queryString: qIdx >= 0 ? url.substring(qIdx + 1) : undefined,
				postData: req.postData ? String(req.postData) : undefined,
				contentType: (req.headers?.["Content-Type"] || req.headers?.["content-type"]) as string | undefined,
			};
			state.networkRequests.set(requestId, nr);

			// Also log to API logger
			handleRequestWillBeSent(params, state);
			break;
		}

		// ── Network response received ──────────────────────────────
		case "Network.responseReceived": {
			const requestId = params.requestId as string;
			const resp = params.response as Record<string, unknown>;

			const nr = state.networkRequests.get(requestId);
			if (nr) {
				nr.status = resp.status as number;
				nr.statusText = resp.statusText as string;
				nr.mimeType = resp.mimeType as string;
				nr.responseHeaders = resp.headers as Record<string, string>;
				nr.timing!.end = Date.now();

				// For errors, try to fetch the response body
				if (nr.status && nr.status >= 400 && cdp && cdp.connected) {
					try {
						const bodyResult = await cdp.send("Network.getResponseBody", { requestId }) as Record<string, unknown>;
						if (bodyResult && "body" in bodyResult) {
							nr.responseBody = String(bodyResult.body).substring(0, 2000);
						}
					} catch { /* body may not be available yet */ }
				}

				// Check for HTTP errors (4xx, 5xx)
				if (nr.status && nr.status >= 400) {
					nr.failed = true;

					// Deduplicate: skip if same method + URL pattern already reported recently
					const urlBase = nr.url.split("?")[0];
					const isDuplicate = state.networkErrors.some(e =>
						e.method === nr.method && e.url.split("?")[0] === urlBase && e.status === nr.status
						&& (Date.now() - (e.timing?.start ?? 0)) < 5000 // 5s dedup window
					);

					const errRequest = { ...nr };
					state.networkErrors.push(errRequest);
					state.totalNetworkErrors++;
					state.totalErrors++;

					if (!isDuplicate) {
						const report = buildReport({
							errorType: "network_error",
							summary: `${nr.method} ${nr.status} ${nr.statusText || ""} — ${truncateUrl(nr.url)}`,
							details: formatNetworkDetails(nr),
							actions: [...state.actions],
							networkRequests: getRecentNetworkRequests(),
							url: state.target?.url || "",
							networkFailure: errRequest,
						});
						report.id = `${report.id}-NET`;
						state.reports.push(report);

						// Notify for ALL errors (4xx and 5xx)
						sendReportToAgent(report);
					}
				}
			}

			// Also log to API logger
			handleResponseReceived(params, state);
			break;
		}

		// ── Network loading failed ─────────────────────────────────
		case "Network.loadingFailed": {
			const requestId = params.requestId as string;
			const errorText = params.errorText as string;
			const blockedReason = params.blockedReason as string | undefined;

			const nr2 = state.networkRequests.get(requestId);
			if (nr2) {
				nr2.failed = true;
				nr2.errorText = errorText;
				const failRequest = { ...nr2 };
				state.networkFailures.push(failRequest);
				state.totalNetworkErrors++;
				state.totalErrors++;

				const report = buildReport({
					errorType: "network_failure",
					summary: `Network failure: ${errorText} — ${truncateUrl(nr2.url)}`,
					details: `${nr2.method} ${truncateUrl(nr2.url)} → FAILED: ${errorText}${blockedReason ? ` (blocked: ${blockedReason})` : ""}`,
					actions: [...state.actions],
					networkRequests: getRecentNetworkRequests(),
					url: state.target?.url || "",
					networkFailure: failRequest,
				});
				report.id = `${report.id}-FAIL`;
				state.reports.push(report);
				sendReportToAgent(report);
			}

			// Also log to API logger
			handleLoadingFailed(params, state);
			break;
		}

		// ── User action from injected binding ──────────────────────
		case "Runtime.bindingCalled": {
			const name = params.name as string;
			const payload = params.payload as string;

			if (name === "__piAction") {
				try {
					const action = JSON.parse(payload) as UserAction;
					state.actions.push(action);
					if (state.actions.length > 500) {
						state.actions.splice(0, state.actions.length - 500);
					}
				} catch { /* malformed */ }
			}

			if (name === "__piConsole") {
				try {
					const ce = JSON.parse(payload) as ConsoleError;
					state.consoleErrors.push(ce);
					if (ce.level === "error") {
						state.totalErrors++;
					}
				} catch { /* malformed */ }
			}
			break;
		}

		// ── Page navigation ────────────────────────────────────────
		case "Page.frameNavigated": {
			const frame = params.frame as Record<string, unknown>;
			// Re-inject the tracker after navigation
			if (cdp && cdp.connected) {
				setTimeout(async () => {
					try {
						await cdp.evaluate(TRACKER_SCRIPT);
						await cdp.evaluate(CONSOLE_CAPTURE_SCRIPT);
					} catch { /* page not ready */ }
				}, 1000);
			}

			// Record navigation action
			state.actions.push({
				type: "navigation",
				ts: Date.now(),
				url: (frame.url as string) || "",
				navType: "frameNavigated",
				to: (frame.url as string) || "",
			});
			break;
		}
	}
}

// ── Report sender ────────────────────────────────────────────────────

// This will be set by index.ts
let _sendReportFn: ((report: ErrorReport) => void) | null = null;

export function setReportSender(fn: (report: ErrorReport) => void): void {
	_sendReportFn = fn;
}

function sendReportToAgent(report: ErrorReport): void {
	if (!autoNotify || !_sendReportFn) return;
	_sendReportFn(report);
}

// ── Re-exported utilities ────────────────────────────────────────────

export { truncate, truncateUrl, formatNetworkDetails, getRecentNetworkRequests };