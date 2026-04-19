/**
 * Report builder — compiles error context, user action trail,
 * network context, and request/response payloads into an RCA report.
 */

// ── Data types ───────────────────────────────────────────────────────

export interface UserAction {
	type: string;
	ts: number;
	url: string;
	[key: string]: unknown;
}

export interface ConsoleError {
	level: "error" | "warn";
	text: string;
	url?: string;
	line?: number;
	column?: number;
	stack?: string;
	ts: number;
}

export interface NetworkRequest {
	requestId: string;
	url: string;
	method: string;
	status?: number;
	statusText?: string;
	mimeType?: string;
	failed?: boolean;
	errorText?: string;
	timing?: {
		start: number;
		end?: number;
	};
	resourceType?: string;
	/** Request headers */
	headers?: Record<string, string>;
	/** Request query string (the ? part of the URL) */
	queryString?: string;
	/** POST/PUT/PATCH body */
	postData?: string;
	/** Content-Type of the request body */
	contentType?: string;
	/** Response body (truncated) */
	responseBody?: string;
	/** Response headers */
	responseHeaders?: Record<string, string>;
}

export interface CDPException {
	text: string;
	description?: string;
	url?: string;
	line?: number;
	column?: number;
	ts: number;
}

export interface ErrorReport {
	id: string;
	timestamp: number;
	errorType: "console_error" | "console_warn" | "exception" | "network_error" | "network_failure";
	summary: string;
	details: string;
	actionTrail: UserAction[];
	networkContext: NetworkRequest[];
	url: string;
	rca: string;
	stepsToRecreate: string[];
}

// ── Build report ─────────────────────────────────────────────────────

let reportCounter = 0;

export function buildReport(params: {
	errorType: ErrorReport["errorType"];
	summary: string;
	details: string;
	actions: UserAction[];
	networkRequests: NetworkRequest[];
	url: string;
	exception?: CDPException;
	consoleError?: ConsoleError;
	networkFailure?: NetworkRequest;
}): ErrorReport {
	const {
		errorType, summary, details, actions, networkRequests, url,
		exception, consoleError, networkFailure,
	} = params;

	reportCounter++;
	const id = `RPT-${Date.now()}-${reportCounter}`;
	const timestamp = Date.now();

	// Get the relevant action window (last 20 actions before the error)
	const actionTrail = actions.slice(-20);

	// Get relevant network context (requests within last 30s before the error)
	const cutoff = timestamp - 30_000;
	const networkContext = networkRequests
		.filter(r => (r.timing?.start ?? 0) > cutoff)
		.slice(-15);

	// Build RCA
	const rca = buildRCA(errorType, summary, details, actionTrail, networkContext, exception, consoleError, networkFailure);

	// Build steps to recreate
	const stepsToRecreate = buildSteps(actionTrail, url);

	return {
		id,
		timestamp,
		errorType,
		summary,
		details,
		actionTrail,
		networkContext,
		url,
		rca,
		stepsToRecreate,
	};
}

function buildRCA(
	errorType: ErrorReport["errorType"],
	summary: string,
	details: string,
	actions: UserAction[],
	networkContext: NetworkRequest[],
	exception?: CDPException,
	consoleError?: ConsoleError,
	networkFailure?: NetworkRequest,
): string {
	const parts: string[] = [];
	parts.push(`## Root Cause Analysis`);
	parts.push("");

	// Error classification
	parts.push(`**Error Type:** ${errorType.replace(/_/g, " ").toUpperCase()}`);
	parts.push(`**Summary:** ${summary}`);
	parts.push("");

	// Exception info
	if (exception) {
		parts.push(`### Exception Details`);
		parts.push(`\`${exception.text}\``);
		if (exception.description) {
			parts.push("```");
			parts.push(exception.description);
			parts.push("```");
		}
		if (exception.url) {
			parts.push(`Source: ${exception.url}:${exception.line ?? ""}:${exception.column ?? ""}`);
		}
		parts.push("");
	}

	// Console error info
	if (consoleError) {
		parts.push(`### Console ${consoleError.level.toUpperCase()}`);
		parts.push(`\`${consoleError.text}\``);
		if (consoleError.stack) {
			parts.push("```");
			parts.push(consoleError.stack);
			parts.push("```");
		}
		if (consoleError.url) {
			parts.push(`Source: ${consoleError.url}:${consoleError.line ?? ""}:${consoleError.column ?? ""}`);
		}
		parts.push("");
	}

	// Network failure info
	if (networkFailure) {
		parts.push(`### Network Request Details`);
		parts.push(`\`${networkFailure.method} ${truncateUrl(networkFailure.url, 120)}\``);
		if (networkFailure.status) {
			parts.push(`**Status:** ${networkFailure.status} ${networkFailure.statusText || ""}`);
		}
		if (networkFailure.errorText) {
			parts.push(`**Error:** ${networkFailure.errorText}`);
		}
		if (networkFailure.resourceType) {
			parts.push(`**Resource Type:** ${networkFailure.resourceType}`);
		}
		// Query string
		if (networkFailure.queryString) {
			parts.push(`**Query Params:** \`${networkFailure.queryString}\``);
		}
		// POST data
		if (networkFailure.postData) {
			parts.push(`**Request Body:**`);
			parts.push("```json");
			parts.push(formatBody(networkFailure.postData, networkFailure.contentType));
			parts.push("```");
		}
		// Request headers
		if (networkFailure.headers && Object.keys(networkFailure.headers).length > 0) {
			const importantHeaders = filterImportantHeaders(networkFailure.headers);
			if (Object.keys(importantHeaders).length > 0) {
				parts.push(`**Request Headers:**`);
				for (const [k, v] of Object.entries(importantHeaders)) {
					parts.push(`- \`${k}: ${v}\``);
				}
			}
		}
		// Response body
		if (networkFailure.responseBody) {
			parts.push(`**Response Body:**`);
			parts.push("```");
			parts.push(truncate(networkFailure.responseBody, 500));
			parts.push("```");
		}
		parts.push("");
	}

	// Context: What was the user doing?
	parts.push(`### User Activity Context`);
	if (actions.length === 0) {
		parts.push("No user actions recorded before this error.");
	} else {
		parts.push("The following user actions preceded this error:");
		for (const a of actions.slice(-8)) {
			const time = new Date(a.ts).toISOString().substr(11, 12);
			parts.push(`- [${time}] ${describeAction(a)}`);
		}
	}
	parts.push("");

	// Network context
	if (networkContext.length > 0) {
		parts.push(`### Network Context (${networkContext.length} requests nearby)`);
		for (const r of networkContext.slice(-5)) {
			const status = r.failed ? "❌ FAILED" : (r.status ? `${r.status}` : "pending");
			let line = `- ${r.method} ${truncateUrl(r.url, 80)} → ${status}`;
			if (r.postData) {
				line += ` [body: ${truncate(r.postData, 60)}]`;
			}
			if (r.queryString) {
				line += ` [query: ${truncate(r.queryString, 60)}]`;
			}
			parts.push(line);
		}
		parts.push("");
	}

	// Likely root causes
	parts.push(`### Likely Root Causes`);
	const causes = inferRootCauses(errorType, exception, consoleError, networkFailure, actions, networkContext);
	for (const cause of causes) {
		parts.push(`1. ${cause}`);
	}

	return parts.join("\n");
}

function buildSteps(actions: UserAction[], url: string): string[] {
	const steps: string[] = [];
	steps.push(`1. Navigate to \`${url}\``);

	if (actions.length === 0) {
		steps.push("2. Error occurred without user interaction (may be a page-load or auto-triggered issue)");
		return steps;
	}

	// Group rapid actions (within 1s of each other) and skip duplicates
	let lastTs = 0;
	let stepIdx = 2;

	for (const action of actions) {
		// Skip scroll actions (too noisy)
		if (action.type === "scroll") continue;
		// Skip actions that are too close together (within 300ms)
		if (action.ts - lastTs < 300) continue;

		steps.push(`${stepIdx}. ${describeAction(action)}`);
		lastTs = action.ts;
		stepIdx++;

		// Cap at 12 steps
		if (stepIdx > 13) {
			steps.push(`${stepIdx}. ... (additional actions truncated)`);
			break;
		}
	}

	return steps;
}

function describeAction(a: UserAction): string {
	switch (a.type) {
		case "click":
			return `Click on ${a.element || "unknown element"} at (${a.x}, ${a.y})`;
		case "dblclick":
			return `Double-click on ${a.element || "unknown element"}`;
		case "input":
			return `Type into ${a.element || a.path || "input field"} (${a.inputType || "text"}): "${a.value || ""}"`;
		case "select":
			return `Select "${a.value || ""}" in ${a.element || "dropdown"}`;
		case "keydown":
			return `Press ${a.key} on ${a.element || "element"}`;
		case "scroll":
			return `Scroll to (${a.scrollX}, ${a.scrollY})`;
		case "navigation":
			return `Navigate (${a.navType}) to ${a.to || a.url || "page"}`;
		case "formSubmit":
			return `Submit form ${a.method || "GET"} → ${a.action || a.url || "url"}`;
		default:
			return `${a.type}: ${JSON.stringify(a).substring(0, 120)}`;
	}
}

function inferRootCauses(
	errorType: ErrorReport["errorType"],
	exception?: CDPException,
	consoleError?: ConsoleError,
	networkFailure?: NetworkRequest,
	_actions?: UserAction[],
	_networkContext?: NetworkRequest[],
): string[] {
	const causes: string[] = [];

	if (errorType === "exception") {
		const msg = (exception?.text || "").toLowerCase();
		const desc = (exception?.description || "").toLowerCase();

		if (msg.includes("typeerror") || desc.includes("cannot read") || desc.includes("is not a function")) {
			causes.push("Null/undefined reference: code is trying to access a property on a null or undefined object. Check if an API response or DOM element is missing.");
		}
		if (msg.includes("referenceerror") || desc.includes("is not defined")) {
			causes.push("Undefined variable: a variable or function is referenced before declaration or outside its scope.");
		}
		if (msg.includes("syntaxerror")) {
			causes.push("Syntax error in JavaScript: check for malformed expressions, missing brackets, or invalid JSON parsing.");
		}
		if (msg.includes("rangeerror")) {
			causes.push("Range error: possible infinite loop or stack overflow from recursion.");
		}
		if (msg.includes("networkerror") || msg.includes("failed to fetch") || desc.includes("cors") || desc.includes("network")) {
			causes.push("Network/CORS error: the browser blocked a request due to CORS policy or network connectivity issues.");
		}
		if (causes.length === 0) {
			causes.push("Uncaught JavaScript exception — review the stack trace for the failing line of code.");
		}
	} else if (errorType === "console_error") {
		causes.push("Console error logged by application code — check the error text and URL for the source.");
	} else if (errorType === "console_warn") {
		causes.push("Console warning — may indicate a deprecation, invalid usage, or suboptimal condition.");
	} else if (errorType === "network_error") {
		const status = networkFailure?.status;
		if (status && status >= 400 && status < 500) {
			causes.push(`Client error (${status}): the request was malformed, unauthorized, or the endpoint doesn't exist. Check the request URL, body, headers, and authentication.`);
		}
		if (status && status >= 500) {
			causes.push(`Server error (${status}): the backend returned a server-side error. Check server logs for the corresponding error.`);
		}
		if (!status || status === 0) {
			causes.push("No response received — possibly a DNS failure, CORS block, or network connectivity issue.");
		}
		// Add specific advice based on request details
		if (networkFailure?.postData) {
			causes.push("This was a POST/PUT/PATCH request — verify the request body matches the backend's expected schema.");
		}
	} else if (errorType === "network_failure") {
		const errText = (networkFailure?.errorText || "").toLowerCase();
		if (errText.includes("cors") || errText.includes("cross-origin")) {
			causes.push("CORS failure: the browser blocked the request because the server did not send proper Access-Control headers.");
		}
		if (errText.includes("net::err") || errText.includes("connection") || errText.includes("timeout")) {
			causes.push("Network connectivity issue: the server may be down, unreachable, or timing out.");
		}
		if (errText.includes("ssl") || errText.includes("certificate")) {
			causes.push("SSL/TLS certificate error: the site certificate is invalid, expired, or self-signed without trust.");
		}
		if (causes.length === 0) {
			causes.push("Network request failed — check both client-side request configuration and server availability.");
		}
	}

	return causes.length > 0 ? causes : ["Unknown error — investigate with browser DevTools."];
}

function formatBody(body: string, contentType?: string): string {
	if (!body) return "";
	// Try to pretty-print JSON
	if (contentType?.includes("json") || body.trim().startsWith("{") || body.trim().startsWith("[")) {
		try {
			return JSON.stringify(JSON.parse(body), null, 2);
		} catch {
			return truncate(body, 1000);
		}
	}
	return truncate(body, 1000);
}

function filterImportantHeaders(headers: Record<string, string>): Record<string, string> {
	const important = [
		"content-type", "authorization", "accept", "origin", "referer",
		"x-requested-with", "cache-control", "cookie",
	];
	const filtered: Record<string, string> = {};
	for (const [k, v] of Object.entries(headers)) {
		const lower = k.toLowerCase();
		if (important.some(h => lower.includes(h)) || lower.startsWith("x-")) {
			// Mask authorization tokens
			if (lower === "authorization" && v.length > 15) {
				filtered[k] = v.substring(0, 10) + "...(redacted)";
			} else {
				filtered[k] = v;
			}
		}
	}
	return filtered;
}

function truncate(s: string, max: number): string {
	if (!s) return s;
	return s.length > max ? s.substring(0, max) + "..." : s;
}

function truncateUrl(url: string, max = 100): string {
	if (!url) return "";
	return url.length > max ? url.substring(0, max) + "..." : url;
}