import { storage, KEYS } from './storage.js';
import { toast } from './toast.js';

// `id` matches the values the original site saved, so returning visitors keep their theme.
// `face` and `glow` are only used for the small swatches on the F-keys and theme picker.
export const THEMES = [
	{ id: 'one', name: 'Nebula', face: '#16151f', glow: '#c800ff' },
	{ id: 'two', name: 'Lilac', face: '#ece4f6', glow: '#6531be' },
	{ id: 'three', name: 'Terminal', face: '#2b2b2b', glow: '#5dff9b' },
	{ id: 'four', name: 'Paper', face: '#eeeeee', glow: '#2f5bea' },
	{ id: 'five', name: 'Graphite', face: '#262626', glow: '#ffb347' },
	{ id: 'six', name: 'Chalk', face: '#c8c8c8', glow: '#ff6a4a' },
	{ id: 'seven', name: 'Forest', face: '#05301a', glow: '#48ff6c' },
	{ id: 'eight', name: 'Terracotta', face: '#c4c4c4', glow: '#d6907a' },
];

const root = document.documentElement;
let current = 0;
let grid = null;

export const currentTheme = () => current;

export function setTheme(index, { announce = false } = {}) {
	const theme = THEMES[index];
	if (!theme) return;
	current = index;
	root.dataset.kb = String(index + 1);
	document.getElementById('theme-num').textContent = index + 1;
	document.getElementById('theme-name').textContent = theme.name;
	storage.set(KEYS.theme, theme.id);
	grid?.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
	if (announce) toast(`Theme ${index + 1} · ${theme.name}`);
}

export function shuffleTheme() {
	let next;
	do next = Math.floor(Math.random() * THEMES.length);
	while (next === current);
	setTheme(next, { announce: true });
}

export function initThemes(gridEl) {
	grid = gridEl;
	THEMES.forEach((theme, i) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.innerHTML = `<i style="background:linear-gradient(90deg,${theme.face} 0 55%,${theme.glow} 55%)"></i>F${i + 1} ${theme.name}`;
		b.addEventListener('click', () => setTheme(i));
		grid.appendChild(b);
	});

	// The inline script in <head> already applied the saved theme before paint.
	const saved = THEMES.findIndex(t => t.id === storage.get(KEYS.theme));
	const fallback = matchMedia('(prefers-color-scheme: dark)').matches ? 0 : 1;
	setTheme(saved >= 0 ? saved : fallback);
}
