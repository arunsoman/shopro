/**
 * Chrome DevTools Protocol (CDP) WebSocket client.
 *
 * Uses Node.js built-in WebSocket (v21+). No npm dependencies needed.
 *
 * Handles discovery, connection, command/response, and event dispatch
 * for a single Chrome tab target.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface CDPTarget {
	id: string;
	type: string;        // "page", "iframe", "worker", etc.
	title: string;
	url: string;
	webSocketDebuggerUrl: string;
}

export interface CDPOptions {
	/** Chrome remote-debugging port (default 9222) */
	port: number;
	/** Host (default "127.0.0.1") */
	host: string;
	/** Reconnect delay in ms (default 3000) */
	reconnectDelay: number;
}

export type CDPEventHandler = (method: string, params: Record<string, unknown>) => void;

// ── Client ───────────────────────────────────────────────────────────

export class CDPClient {
	public readonly options: CDPOptions;
	private ws: WebSocket | null = null;
	private nextId = 1;
	private pending = new Map<number, {
		resolve: (value: unknown) => void;
		reject: (err: Error) => void;
	}>();
	private handlers: CDPEventHandler[] = [];
	private _connected = false;
	private _closed = false;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private target: CDPTarget | null = null;

	constructor(options?: Partial<CDPOptions>) {
		this.options = {
			port: 9222,
			host: "127.0.0.1",
			reconnectDelay: 3000,
			...options,
		};
	}

	get connected() { return this._connected; }
	get closed() { return this._closed; }

	// ── Target discovery ──────────────────────────────────────────────

	async listTargets(): Promise<CDPTarget[]> {
		const url = `http://${this.options.host}:${this.options.port}/json`;
		const resp = await fetch(url);
		if (!resp.ok) throw new Error(`CDP discovery failed: ${resp.status} ${resp.statusText}`);
		const targets = await resp.json() as CDPTarget[];
		return targets.filter(t => t.type === "page" && t.webSocketDebuggerUrl);
	}

	// ── Connect / reconnect ──────────────────────────────────────────

	async connect(target?: CDPTarget): Promise<void> {
		if (this._closed) throw new Error("Client closed");

		// Discover targets if not supplied
		if (!target) {
			const targets = await this.listTargets();
			if (targets.length === 0) throw new Error("No Chrome tab targets found");
			target = targets[0]; // pick the first page
		}
		this.target = target;

		await this._connect(target.webSocketDebuggerUrl);
	}

	private _connect(wsUrl: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(wsUrl);
			this.ws = ws;

			ws.onopen = () => {
				this._connected = true;
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer);
					this.reconnectTimer = null;
				}
				resolve();
			};

			ws.onmessage = (event: MessageEvent) => {
				try {
					const msg = JSON.parse(event.data as string) as Record<string, unknown>;

					// Response to a command
					if (typeof msg.id === "number") {
						const pending = this.pending.get(msg.id);
						if (pending) {
							this.pending.delete(msg.id);
							if (msg.error) {
								pending.reject(new Error(String(msg.error.message ?? "CDP error")));
							} else {
								pending.resolve(msg.result);
							}
						}
						return;
					}

					// Event
					if (typeof msg.method === "string") {
						const params = (msg.params ?? {}) as Record<string, unknown>;
						for (const h of this.handlers) {
							try { h(msg.method, params); } catch { /* swallow */ }
						}
					}
				} catch { /* malformed JSON */ }
			};

			ws.onclose = () => {
				this._connected = false;
				this.ws = null;
				if (!this._closed) {
					this._scheduleReconnect();
				}
			};

			ws.onerror = () => {
				this._connected = false;
				if (!this._connected && !this._closed) {
					reject(new Error(`CDP connection error: WebSocket failed to connect`));
				}
			};
		});
	}

	private _scheduleReconnect() {
		if (this._closed) return;
		if (this.reconnectTimer) return;

		this.reconnectTimer = setTimeout(async () => {
			this.reconnectTimer = null;
			if (this._closed) return;
			try {
				const targets = await this.listTargets();
				if (targets.length === 0) {
					this._scheduleReconnect();
					return;
				}
				// Try to reconnect to the same target or first available
				const match = this.target
					? targets.find(t => t.id === this.target!.id)
					: targets[0];
				const t = match ?? targets[0];
				await this.connect(t);
			} catch {
				this._scheduleReconnect();
			}
		}, this.options.reconnectDelay);
	}

	// ── Send command ──────────────────────────────────────────────────

	send(method: string, params?: Record<string, unknown>): Promise<unknown> {
		return new Promise((resolve, reject) => {
			if (!this.ws || !this._connected) {
				reject(new Error("CDP not connected"));
				return;
			}

			const id = this.nextId++;
			const msg: Record<string, unknown> = { id, method };
			if (params) msg.params = params;

			this.pending.set(id, { resolve, reject });
			this.ws.send(JSON.stringify(msg));

			// Timeout after 10s
			setTimeout(() => {
				if (this.pending.has(id)) {
					this.pending.delete(id);
					reject(new Error(`CDP timeout: ${method}`));
				}
			}, 10_000);
		});
	}

	// ── Event subscription ────────────────────────────────────────────

	onEvent(handler: CDPEventHandler): void {
		this.handlers.push(handler);
	}

	// ── Enable CDP domains ────────────────────────────────────────────

	async enableDomains(): Promise<void> {
		await Promise.all([
			this.send("Runtime.enable"),
			this.send("Network.enable"),
			this.send("Page.enable"),
			this.send("DOM.enable"),
		]);
	}

	// ── Evaluate JS in page ───────────────────────────────────────────

	async evaluate(expression: string, options?: {
		awaitPromise?: boolean;
		returnByValue?: boolean;
	}): Promise<unknown> {
		const result = await this.send("Runtime.evaluate", {
			expression,
			awaitPromise: options?.awaitPromise ?? false,
			returnByValue: options?.returnByValue ?? true,
		}) as { result?: { value?: unknown; type?: string; description?: string } };
		return result?.result?.value;
	}

	// ── Add JS binding that page can call ─────────────────────────────

	async addBinding(name: string): Promise<void> {
		await this.send("Runtime.addBinding", { name });
	}

	// ── Inject script ─────────────────────────────────────────────────

	async addScriptToEvaluateOnNewDocument(source: string): Promise<unknown> {
		return this.send("Page.addScriptToEvaluateOnNewDocument", { source });
	}

	// ── Close ──────────────────────────────────────────────────────────

	close(): void {
		this._closed = true;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this._connected = false;
		this.pending.clear();
	}
}