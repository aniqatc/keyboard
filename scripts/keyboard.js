import { ROWS, ICONS, MD_LABELS, LIGHT_SHOWS } from './layout.js';
import { THEMES } from './themes.js';

const RAINBOW = 'conic-gradient(#ff3b3b,#ffb800,#3dff6e,#00c8ff,#8a4dff,#ff3b3b)';

function legendHTML(def) {
	const w = def.word ? ' w' : '';
	if (def.icon) return `<span class="ftop end">${ICONS[def.icon]}</span>`;
	if (def.fkey != null) {
		const theme = THEMES[def.fkey];
		const dot = theme
			? `<i class="dot" style="background:linear-gradient(135deg,${theme.face},${theme.glow});box-shadow:0 0 0 1px rgba(127,127,127,.5)"></i>`
			: `<i class="dot" style="background:${RAINBOW}"></i>`;
		return `<span class="ftop"><span class="lg fk">${def.legend}</span>${dot}</span>`;
	}
	if (def.shifted) {
		return `<span class="dual"><span class="lg up${w}">${def.shifted}</span><span class="lg${w}">${def.legend}</span></span>`;
	}
	return `<span class="lg${w}">${def.legend}</span>`;
}

function ariaLabel(def) {
	if (def.label) return def.label;
	if (def.fkey != null && THEMES[def.fkey]) return `${def.legend}: ${THEMES[def.fkey].name} theme`;
	if (LIGHT_SHOWS[def.code]) return `${def.legend}: ${LIGHT_SHOWS[def.code]} light show`;
	if (def.letter) return def.legend.toUpperCase();
	return def.legend;
}

function createKey(def, byCode, defs) {
	const el = document.createElement('button');
	el.type = 'button';
	el.className = ['key', def.type, def.letter && 'lt'].filter(Boolean).join(' ');
	el.dataset.code = def.code;
	el.style.gridColumn = `span ${Math.round(def.width * 4)}`;
	if (def.md) el.dataset.md = def.md;
	if (def.word) el.dataset.w = '1';

	let inner = def.short
		? `<span class="full">${legendHTML(def)}</span><span class="lg short">${def.short}</span>`
		: legendHTML(def);
	if (def.caps) inner = `<i class="dot caps-led"></i>${inner}`;
	if (def.md) inner += `<span class="sub">${MD_LABELS[def.md]}</span>`;
	// .glow and .ring sit behind the keycap; .tint sits on its face. Animations only
	// change their opacity and transform, so they stay smooth.
	el.innerHTML = `<span class="glow"></span><span class="ring"></span><span class="top${def.right ? ' right' : ''}"><span class="tint"></span>${inner}</span>`;
	el.setAttribute('aria-label', ariaLabel(def));

	if (def.fkey != null && THEMES[def.fkey]) el.title = `Theme ${def.fkey + 1}: ${THEMES[def.fkey].name}`;
	if (LIGHT_SHOWS[def.code]) el.title = `Light show: ${LIGHT_SHOWS[def.code]}`;

	byCode[def.code] = el;
	defs[def.code] = def;
	return el;
}

function createArrows(codes, byCode, defs) {
	const cluster = document.createElement('div');
	cluster.className = 'arrows';
	codes.forEach(code => {
		const def = { code, legend: '', width: 1, type: 'x', label: code.replace('Arrow', 'arrow ').toLowerCase() };
		const el = createKey(def, byCode, defs);
		el.style.gridColumn = '';
		el.querySelector('.top').insertAdjacentHTML('beforeend', ICONS[code]);
		cluster.appendChild(el);
	});
	return cluster;
}

// Builds the board and returns lookups keyed by KeyboardEvent.code.
export function buildKeyboard(container) {
	const byCode = {};
	const defs = {};

	ROWS.forEach(row => {
		const rowEl = document.createElement('div');
		rowEl.className = `row ${row.className}`;
		row.keys.forEach(def => {
			rowEl.appendChild(def.arrows ? createArrows(def.arrows, byCode, defs) : createKey(def, byCode, defs));
		});
		container.appendChild(rowEl);
	});

	return { byCode, defs, allKeys: [...container.querySelectorAll('.key')] };
}

// Restarts the ring that ripples out from a key.
export function ping(el) {
	el.classList.remove('ping');
	void el.offsetWidth; // restart the CSS animation
	el.classList.add('ping');
}

// A quick press-and-release for on-screen taps.
export function flash(el, ms = 120) {
	el.classList.add('down');
	ping(el);
	setTimeout(() => el.classList.remove('down'), ms);
}

document.addEventListener('animationend', e => {
	if (e.animationName === 'ping') e.target.classList.remove('ping');
});

// The keyboard is one Tab stop. Inside it, the arrow keys move focus to the
// nearest key in that direction, Home and End jump to the ends of a row.
// (A "roving tabindex": only the focused key has tabindex="0".)
export function enableKeyNavigation(container, keys) {
	let current = keys.find(k => k.dataset.code === 'KeyF') || keys[0];
	keys.forEach(k => (k.tabIndex = k === current ? 0 : -1));

	const center = el => {
		const r = el.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	};

	function moveTo(next) {
		if (!next) return;
		current.tabIndex = -1;
		next.tabIndex = 0;
		current = next;
		next.focus();
	}

	function nearest(from, dir) {
		const a = center(from);
		let best = null;
		let bestScore = Infinity;
		for (const k of keys) {
			if (k === from) continue;
			const b = center(k);
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const ahead = { left: -dx, right: dx, up: -dy, down: dy }[dir];
			if (ahead <= 1) continue;
			const sideways = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
			// Strongly prefer keys in the same row (or column) over closer ones elsewhere
			const score = ahead + sideways * 4;
			if (score < bestScore) {
				bestScore = score;
				best = k;
			}
		}
		return best;
	}

	container.addEventListener('focusin', e => {
		const key = e.target.closest('.key');
		if (key && key !== current) {
			current.tabIndex = -1;
			key.tabIndex = 0;
			current = key;
		}
	});

	container.addEventListener('keydown', e => {
		const key = e.target.closest('.key');
		if (!key || e.altKey || e.ctrlKey || e.metaKey) return;
		const dir = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key];
		if (dir) {
			e.preventDefault();
			moveTo(nearest(key, dir));
		} else if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			const row = [...key.closest('.row').querySelectorAll('.key')];
			moveTo(e.key === 'Home' ? row[0] : row[row.length - 1]);
		}
	});
}
