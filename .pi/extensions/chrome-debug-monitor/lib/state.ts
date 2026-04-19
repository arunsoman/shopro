/**
 * Shared state for the Chrome Debug Monitor extension.
 */

import type { MonitorState } from "./types";

export let cdp: import("../cdp-client").CDPClient | null = null;
export let state: MonitorState = createFreshState();
export let autoNotify = true;

export function setCDP(client: import("../cdp-client").CDPClient | null): void {
	cdp = client;
}

export function createFreshState(): MonitorState {
	return {
		connected: false,
		target: null,
		port: 9222,
		actions: [],
		consoleErrors: [],
		exceptions: [],
		networkRequests: new Map(),
		networkErrors: [],
		networkFailures: [],
		reports: [],
		totalErrors: 0,
		totalNetworkErrors: 0,
		monitoring: false,
		apiLog: [],
	};
}

export function resetState(): void {
	state = createFreshState();
}