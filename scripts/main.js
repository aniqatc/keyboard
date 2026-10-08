import { storage, KEYS } from './storage.js';
import { toast } from './toast.js';
import { createSound } from './sound.js';
import { initThemes, setTheme, shuffleTheme } from './themes.js';
import { buildKeyboard, flash } from './keyboard.js';
import { createEditor, LIST_RE } from './editor.js';
import { createShows } from './shows.js';
import { createModal } from './modal.js';

const $ = id => document.getElementById(id);
const rowsEl = $('rows');
const finePointer = matchMedia('(pointer: fine)').matches;
const narrow = () => matchMedia('(max-width: 760px)').matches;

const { byCode, defs, allKeys } = buildKeyboard(rowsEl);
initThemes($('theme-grid'));
const sound = createSound($('sound'));
const shows = createShows(rowsEl, allKeys);
const modal = createModal($('overlay'), $('close'));
const editor = createEditor({
	textarea: $('editor'),
	preview: $('preview'),
	stats: { words: $('s-words'), chars: $('s-chars'), keys: $('s-keys'), saved: $('s-saved') },
});
const ta = editor.textarea;

// ---- Modifier state ------------------------------------------------------
// On-screen shift, fn and control are "sticky": tap once, then tap the next key.
const state = { shift: false, caps: false, fn: false, ctrl: false, physicalShift: false };

function renderModifiers() {
	const shifted = state.shift || state.physicalShift;
	rowsEl.classList.toggle('upper', shifted !== state.caps);
	rowsEl.classList.toggle('shifted', shifted);
	rowsEl.classList.toggle('fn', state.fn);
	byCode.CapsLock.classList.toggle('caps-on', state.caps);
	byCode.ShiftLeft.classList.toggle('latched', state.shift);
	byCode.ShiftRight.classList.toggle('latched', state.shift);
	byCode.ControlLeft.classList.toggle('latched', state.ctrl);
	byCode.Fn.classList.toggle('latched', state.fn);
}

const THEME_KEY = /^F([1-8])$/;
const SHOW_KEY = /^F(9|1[0-2])$/;
const isHeavy = code => ['Space', 'Enter', 'Backspace'].includes(code) || defs[code]?.type === 'm';

// Keep focus in the editor on desktop. On touch screens, focusing the
// textarea would pop up the phone's own keyboard on top of ours.
function afterEdit() {
	editor.update();
	if (finePointer) ta.focus();
}

// ---- On-screen key presses ----------------------------------------------
function pressKey(el) {
	const code = el.dataset.code;
	const def = defs[code];
	sound.play(isHeavy(code));

	if (THEME_KEY.test(code)) {
		flash(el);
		setTheme(Number(code.slice(1)) - 1, { announce: true });
		return;
	}
	if (SHOW_KEY.test(code)) {
		shows.play(code);
		return;
	}
	flash(el);

	switch (code) {
		case 'Shuffle':
			return shuffleTheme();
		case 'Escape':
			return modal.open();
		case 'Fn':
			state.fn = !state.fn;
			renderModifiers();
			return toast(state.fn ? 'Markdown shortcuts on' : 'Markdown shortcuts off', 1400);
		case 'CapsLock':
			state.caps = !state.caps;
			return renderModifiers();
		case 'ShiftLeft':
		case 'ShiftRight':
			state.shift = !state.shift;
			return renderModifiers();
		case 'ControlLeft':
		case 'MetaLeft':
		case 'MetaRight':
			state.ctrl = !state.ctrl;
			return renderModifiers();
		case 'AltLeft':
		case 'AltRight':
			return;
	}

	editor.countKeystroke();

	if ((state.fn || state.ctrl) && def.md) {
		editor.markdown[def.md]();
		state.ctrl = false;
		renderModifiers();
		return afterEdit();
	}
	if (state.ctrl) {
		state.ctrl = false;
		renderModifiers();
	}

	switch (code) {
		case 'Backspace': editor.backspace(); break;
		case 'Enter': editor.newline(); break;
		case 'Tab': editor.insert('    '); break;
		case 'Space': editor.insert(' '); break;
		case 'ArrowLeft': editor.moveHorizontal(-1); break;
		case 'ArrowRight': editor.moveHorizontal(1); break;
		case 'ArrowUp': editor.moveVertical(-1); break;
		case 'ArrowDown': editor.moveVertical(1); break;
		default: {
			let ch = def.legend;
			if (def.letter) ch = state.shift !== state.caps ? ch.toUpperCase() : ch;
			else if (state.shift && def.shifted) ch = def.shifted;
			editor.insert(ch);
		}
	}

	if (state.shift) {
		state.shift = false;
		renderModifiers();
	}
	afterEdit();
}

// preventDefault on pointerdown keeps the textarea's focus and selection.
rowsEl.addEventListener('pointerdown', e => {
	if (e.target.closest('.key')) e.preventDefault();
});
rowsEl.addEventListener('click', e => {
	const el = e.target.closest('.key');
	if (el) pressKey(el);
});

// ---- Physical keyboard ---------------------------------------------------
const held = new Set();

document.addEventListener('keydown', e => {
	if (modal.isOpen()) {
		if (e.key === 'Escape') {
			e.preventDefault();
			modal.close();
		}
		return;
	}

	state.physicalShift = e.shiftKey;
	if (e.getModifierState) state.caps = e.getModifierState('CapsLock');
	renderModifiers();

	const el = byCode[e.code];

	if (e.code === 'Escape') {
		e.preventDefault();
		if (el) flash(el);
		modal.open();
		return;
	}
	if (THEME_KEY.test(e.code)) {
		e.preventDefault();
		if (!e.repeat) {
			flash(el);
			sound.play();
			setTheme(Number(e.code.slice(1)) - 1, { announce: true });
		}
		return;
	}
	if (SHOW_KEY.test(e.code)) {
		e.preventDefault();
		if (!e.repeat) shows.play(e.code);
		return;
	}

	if (el) {
		el.classList.add('down');
		held.add(el);
	}
	if (!e.repeat) sound.play(isHeavy(e.code));

	if (e.target === ta) {
		if (!e.repeat) editor.countKeystroke();
		const mod = e.ctrlKey || e.metaKey;

		if (mod && !e.altKey && !e.shiftKey) {
			const action = { b: 'bold', i: 'italic', k: 'link' }[e.key.toLowerCase()];
			if (action) {
				e.preventDefault();
				editor.markdown[action]();
				editor.update();
				return;
			}
		}
		if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) {
			const [s] = editor.selection();
			const line = ta.value.slice(ta.value.lastIndexOf('\n', s - 1) + 1, s);
			if (LIST_RE.test(line)) {
				e.preventDefault();
				editor.newline();
				editor.update();
			}
		}
		return;
	}

	// Typing a character while nothing else has focus sends it to the editor.
	const busy = /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/.test(e.target.tagName);
	if (!busy && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) ta.focus();
});

document.addEventListener('keyup', e => {
	state.physicalShift = e.shiftKey;
	if (e.getModifierState) state.caps = e.getModifierState('CapsLock');
	renderModifiers();
	const el = byCode[e.code];
	if (el) {
		setTimeout(() => el.classList.remove('down'), 120);
		held.delete(el);
	}
});

// Releasing keys while the window is in the background never fires keyup.
window.addEventListener('blur', () => {
	held.forEach(el => el.classList.remove('down'));
	held.clear();
	state.physicalShift = false;
	renderModifiers();
});

// ---- Toolbar --------------------------------------------------------------
const views = { write: $('v-write'), split: $('v-split'), preview: $('v-preview') };

function setView(view) {
	$('ed').dataset.view = view;
	Object.entries(views).forEach(([name, b]) => b.setAttribute('aria-pressed', String(name === view)));
	storage.set(KEYS.view, view);
}
Object.entries(views).forEach(([name, b]) => b.addEventListener('click', () => setView(name)));
if (views[storage.get(KEYS.view)]) setView(storage.get(KEYS.view));

$('copy').addEventListener('click', async () => {
	if (!ta.value.trim()) return toast('Type something first 📝');
	try {
		await navigator.clipboard.writeText(ta.value);
		toast('Copied ✓');
	} catch {
		if ($('ed').dataset.view === 'preview') setView(narrow() ? 'write' : 'split');
		ta.focus();
		ta.select();
		toast('Text selected. Press Ctrl+C or ⌘C to copy');
	}
});

$('save').addEventListener('click', () => {
	toast(editor.save() ? 'Saved ✓' : "Couldn't save: this browser blocks storage");
});

// Clear asks for a second tap within 3 seconds.
let clearArmedUntil = 0;
let clearTimer;
$('clear').addEventListener('click', e => {
	const button = e.currentTarget;
	const label = button.querySelector('.t');
	const reset = () => {
		clearArmedUntil = 0;
		button.classList.remove('warn');
		label.textContent = 'Clear';
	};

	if (Date.now() < clearArmedUntil) {
		clearTimeout(clearTimer);
		reset();
		editor.clear();
		toast('Cleared');
		if (finePointer) ta.focus();
		return;
	}
	clearArmedUntil = Date.now() + 3000;
	button.classList.add('warn');
	label.textContent = 'Tap again to clear';
	if (narrow()) toast('Tap the trash again to clear everything');
	clearTimeout(clearTimer);
	clearTimer = setTimeout(reset, 3000);
});

$('info').addEventListener('click', modal.open);

renderModifiers();
setTimeout(() => toast('Press <kbd>esc</kbd> for info', 5000), 400);
