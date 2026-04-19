/**
 * Action tracker — injected into Chrome pages via CDP.
 *
 * Captures user interactions (clicks, inputs, navigation) and
 * communicates them back to the extension via a CDP binding.
 */

// This string is evaluated inside the browser page via CDP Runtime.evaluate.
// It must be a self-contained IIFE — no external imports.

export const TRACKER_SCRIPT = `
(function() {
	'use strict';

	// Guard against double injection
	if (window.__PI_TRACKER_ACTIVE__) return;
	window.__PI_TRACKER_ACTIVE__ = true;

	const MAX_ACTIONS = 500;
	const actions = [];

	function truncate(s, max) {
		if (!s) return s;
		return s.length > max ? s.substring(0, max) + '...' : s;
	}

	function describeElement(el) {
		if (!el || !el.tagName) return '<unknown>';
		const tag = (el.tagName || '').toLowerCase();
		const id = el.id ? '#' + el.id : '';
		let cls = '';
		if (el.className && typeof el.className === 'string') {
			cls = el.className.trim().split(/\\s+/).slice(0, 3).join('.');
			if (cls) cls = '.' + cls;
		}
		let text = '';
		try {
			if (tag === 'input' || tag === 'textarea' || tag === 'select') {
				text = truncate(el.placeholder || (el.getAttribute ? el.getAttribute('aria-label') : '') || '', 40);
			} else {
				text = truncate((el.textContent || '').trim().substring(0, 60), 60);
			}
		} catch(e) {}
		let role = el.getAttribute ? el.getAttribute('role') : null;
		let aria = el.getAttribute ? el.getAttribute('aria-label') : null;
		let extra = '';
		if (role) extra += ' [role=' + role + ']';
		if (aria) extra += ' [aria=' + truncate(aria, 30) + ']';
		return '<' + tag + id + cls + '>' + extra + ' ' + truncate(text, 80);
	}

	function buildPath(el) {
		if (!el || el.nodeType !== 1) return '';
		const path = [];
		let cur = el;
		let depth = 0;
		while (cur && cur !== document.body && depth < 6) {
			let seg = cur.tagName?.toLowerCase() || '';
			if (cur.id) seg += '#' + cur.id;
			else if (cur.className && typeof cur.className === 'string') {
				const first = cur.className.trim().split(/\\s+/)[0];
				if (first) seg += '.' + first;
			}
			path.unshift(seg);
			cur = cur.parentElement;
			depth++;
		}
		return path.join(' > ');
	}

	function push(action) {
		action.ts = Date.now();
		action.url = truncate(location.href, 200);
		actions.push(action);
		if (actions.length > MAX_ACTIONS) actions.splice(0, actions.length - MAX_ACTIONS);
		// Send to CDP binding if available
		try {
			if (typeof window.__piAction === 'function') {
				window.__piAction(JSON.stringify(action));
			}
		} catch(e) { /* binding may not exist yet */ }
	}

	// ── Click ────────────────────────────────────────────────────────
	document.addEventListener('click', function(e) {
		var target = e.target || document.elementFromPoint(e.clientX, e.clientY);
		if (!target || !target.tagName) target = document.body;
		push({
			type: 'click',
			element: describeElement(target),
			path: buildPath(target),
			x: e.clientX,
			y: e.clientY,
		});
	}, true);

	// ── Double-click ─────────────────────────────────────────────────
	document.addEventListener('dblclick', function(e) {
		var target = e.target;
		if (!target || !target.tagName) target = document.body;
		push({
			type: 'dblclick',
			element: describeElement(target),
			path: buildPath(target),
		});
	}, true);

	// ── Input / change ──────────────────────────────────────────────
	document.addEventListener('input', function(e) {
		const el = e.target;
		if (!el || !el.tagName) return;
		const tag = el.tagName.toLowerCase();
		if (tag === 'input' || tag === 'textarea') {
			const inputType = (el.getAttribute('type') || 'text').toLowerCase();
			// Don't capture password values
			const val = (inputType === 'password')
				? '••••••'
				: truncate(el.value || '', 100);
			push({
				type: 'input',
				element: describeElement(el),
				path: buildPath(el),
				inputType: inputType,
				value: val,
			});
		} else if (tag === 'select') {
			push({
				type: 'select',
				element: describeElement(el),
				path: buildPath(el),
				value: truncate(el.value || '', 100),
			});
		}
	}, true);

	// ── Key presses (only Enter, Tab, Escape for context) ──────────
	document.addEventListener('keydown', function(e) {
		const interesting = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
		if (interesting.includes(e.key)) {
			push({
				type: 'keydown',
				key: e.key,
				element: describeElement(e.target),
				path: buildPath(e.target),
			});
		}
	}, true);

	// ── Scroll (debounced) ──────────────────────────────────────────
	let scrollTimer = null;
	document.addEventListener('scroll', function() {
		if (scrollTimer) return;
		scrollTimer = setTimeout(function() {
			scrollTimer = null;
			push({
				type: 'scroll',
				scrollX: Math.round(window.scrollX),
				scrollY: Math.round(window.scrollY),
			});
		}, 500);
	}, true);

	// ── Navigation ──────────────────────────────────────────────────
	// pushState / replaceState
	const origPush = history.pushState;
	history.pushState = function() {
		push({ type: 'navigation', navType: 'pushState', to: truncate(arguments[2]?.toString() || '', 200) });
		return origPush.apply(this, arguments);
	};
	const origReplace = history.replaceState;
	history.replaceState = function() {
		push({ type: 'navigation', navType: 'replaceState', to: truncate(arguments[2]?.toString() || '', 200) });
		return origReplace.apply(this, arguments);
	};
	window.addEventListener('popstate', function() {
		push({ type: 'navigation', navType: 'popstate', to: truncate(location.href, 200) });
	});

	// ── Form submit ──────────────────────────────────────────────────
	document.addEventListener('submit', function(e) {
		push({
			type: 'formSubmit',
			element: describeElement(e.target),
			action: truncate(e.target?.action || '', 200),
			method: (e.target?.method || 'GET').toUpperCase(),
		});
	}, true);

	// ── Expose getter for CDP ────────────────────────────────────────
	window.__piGetActions = function() {
		return JSON.stringify(actions.slice(-100)); // last 100 actions
	};
	window.__piClearActions = function() {
		actions.length = 0;
	};
})();
`;

export const CONSOLE_CAPTURE_SCRIPT = `
(function() {
	'use strict';
	if (window.__PI_CONSOLE_CAPTURE_ACTIVE__) return;
	window.__PI_CONSOLE_CAPTURE_ACTIVE__ = true;

	const origError = console.error;
	const origWarn = console.warn;

	console.error = function(...args) {
		try {
			if (typeof window.__piConsole === 'function') {
				window.__piConsole(JSON.stringify({
					level: 'error',
					args: args.map(a => {
						if (a instanceof Error) return a.stack || a.message;
						try { return typeof a === 'object' ? JSON.stringify(a).substring(0, 500) : String(a).substring(0, 500); }
						catch { return String(a).substring(0, 500); }
					}),
					ts: Date.now(),
					url: location.href.substring(0, 200),
				}));
			}
		} catch(e) {}
		origError.apply(console, args);
	};

	console.warn = function(...args) {
		try {
			if (typeof window.__piConsole === 'function') {
				window.__piConsole(JSON.stringify({
					level: 'warn',
					args: args.map(a => {
						try { return typeof a === 'object' ? JSON.stringify(a).substring(0, 500) : String(a).substring(0, 500); }
						catch { return String(a).substring(0, 500); }
					}),
					ts: Date.now(),
					url: location.href.substring(0, 200),
				}));
			}
		} catch(e) {}
		origWarn.apply(console, args);
	};
})();
`;