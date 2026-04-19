/**
 * Shared types for the Chrome Debug Monitor extension.
 */

import type { CDPTarget } from "../cdp-client";
import type { UserAction, ConsoleError, NetworkRequest, CDPException, ErrorReport } from "../report-builder";

// ── Monitor State ────────────────────────────────────────────────────

export interface MonitorState {
	connected: boolean;
	target: CDPTarget | null;
	port: number;
	actions: UserAction[];
	consoleErrors: ConsoleError[];
	exceptions: CDPException[];
	networkRequests: Map<string, NetworkRequest>;
	networkErrors: NetworkRequest[];
	networkFailures: NetworkRequest[];
	reports: ErrorReport[];
	totalErrors: number;
	totalNetworkErrors: number;
	monitoring: boolean;
	/** API request/response log */
	apiLog: ApiLogEntry[];
}

// ── API Log Entry ────────────────────────────────────────────────────

export interface ApiLogEntry {
	/** Unique ID */
	id: string;
	/** When the request was sent */
	timestamp: number;
	/** Request method: GET, POST, PUT, DELETE, etc. */
	method: string;
	/** Full URL */
	url: string;
	/** URL path only (no query string) */
	path: string;
	/** Query string (the ? part) */
	queryString?: string;
	/** Request headers (filtered) */
	requestHeaders?: Record<string, string>;
	/** Request body (for POST/PUT/PATCH) */
	requestBody?: string;
	/** Content-Type of the request */
	contentType?: string;
	/** HTTP response status code */
	status?: number;
	/** HTTP response status text */
	statusText?: string;
	/** Response headers */
	responseHeaders?: Record<string, string>;
	/** Response body (truncated) */
	responseBody?: string;
	/** Response MIME type */
	responseMimeType?: string;
	/** Time taken in ms */
	duration?: number;
	/** Whether this request resulted in an error */
	isError?: boolean;
	/** Error text if request failed */
	errorText?: string;
	/** Resource type (XHR, Fetch, Document, etc.) */
	resourceType?: string;
}

// ── Test Error Report ────────────────────────────────────────────────

export interface TestErrorReport {
	testName: string;
	testFile: string;
	status: string; // "passed" | "failed" | "skipped" | "timedOut"
	duration: number;
	errors: string[];
	networkErrors: Array<{
		url: string;
		method: string;
		status?: number;
		statusText?: string;
		postData?: string;
		queryString?: string;
		responseBody?: string;
		errorText?: string;
	}>;
	consoleErrors: Array<{ level: string; text: string }>;
	exceptions: Array<{ text: string; description?: string }>;
	reports?: ErrorReport[];
}

export interface ParsedTestResult {
	name: string;
	file: string;
	status: string;
	duration: number;
}