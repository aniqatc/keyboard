// Keyboard layout data. Widths are in key units (1u = one letter key); every row adds up to 15u.
// Each key is identified by its KeyboardEvent.code so physical presses map straight to it.

export const ICONS = {
	shuffle:
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
	ArrowLeft: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 6v12l-8-6z"/></svg>',
	ArrowRight: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 6v12l8-6z"/></svg>',
	ArrowUp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 15h12l-6-8z"/></svg>',
	ArrowDown: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 9h12l-6 8z"/></svg>',
};

// Markdown shortcut labels shown when the fn layer is on.
export const MD_LABELS = {
	h1: 'H1', h2: 'H2', h3: 'H3', hr: 'rule', quote: 'quote', task: 'task', italic: 'italic',
	ol: '1.', strike: 'strike', image: 'image', link: 'link', ul: '•', code: 'code', bold: 'bold',
};

export const LIGHT_SHOWS = { F9: 'Wave', F10: 'Ripple', F11: 'Sweep', F12: 'Twinkle' };

// key(code, legend, width, type, shifted legend, markdown action, extra options)
// type: '' = letter/number key, 'm' = modifier, 'x' = function row, fn and arrows
const key = (code, legend, width = 1, type = '', shifted = null, md = null, opts = {}) => ({
	code, legend, width, type, shifted, md, ...opts,
});
const word = (code, legend, width, type, opts = {}) => key(code, legend, width, type, null, null, { word: true, ...opts });
const letters = (chars, md = {}) =>
	chars.split('').map(ch => key(`Key${ch.toUpperCase()}`, ch, 1, '', null, md[ch] || null, { letter: true }));

export const ROWS = [
	{
		className: 'fnrow r1',
		keys: [
			word('Escape', 'esc', 1.5, 'x'),
			...Array.from({ length: 12 }, (_, i) => key(`F${i + 1}`, `F${i + 1}`, 1, 'x', null, null, { fkey: i })),
			key('Shuffle', '', 1.5, 'x', null, null, { icon: 'shuffle', label: 'Shuffle theme' }),
		],
	},
	{
		className: 'r2',
		keys: [
			key('Backquote', '`', 1, '', '~'),
			key('Digit1', '1', 1, '', '!', 'h1'),
			key('Digit2', '2', 1, '', '@', 'h2'),
			key('Digit3', '3', 1, '', '#', 'h3'),
			key('Digit4', '4', 1, '', '$'),
			key('Digit5', '5', 1, '', '%'),
			key('Digit6', '6', 1, '', '^'),
			key('Digit7', '7', 1, '', '&'),
			key('Digit8', '8', 1, '', '*'),
			key('Digit9', '9', 1, '', '('),
			key('Digit0', '0', 1, '', ')'),
			key('Minus', '-', 1, '', '_', 'hr'),
			key('Equal', '=', 1, '', '+'),
			word('Backspace', 'delete', 2, 'm', { right: true }),
		],
	},
	{
		className: 'r3',
		keys: [
			word('Tab', 'tab', 1.5, 'm'),
			...letters('qwertyuiop', { q: 'quote', t: 'task', i: 'italic', o: 'ol' }),
			key('BracketLeft', '[', 1, '', '{'),
			key('BracketRight', ']', 1, '', '}'),
			key('Backslash', '\\', 1.5, '', '|'),
		],
	},
	{
		className: 'r4',
		keys: [
			word('CapsLock', 'caps lock', 1.75, 'm', { caps: true }),
			...letters('asdfghjkl', { s: 'strike', g: 'image', k: 'link', l: 'ul' }),
			key('Semicolon', ';', 1, '', ':'),
			key('Quote', "'", 1, '', '"'),
			word('Enter', 'return', 2.25, 'm', { right: true }),
		],
	},
	{
		className: 'r5',
		keys: [
			word('ShiftLeft', 'shift', 2.25, 'm'),
			...letters('zxcvbnm', { c: 'code', b: 'bold' }),
			key('Comma', ',', 1, '', '<'),
			key('Period', '.', 1, '', '>'),
			key('Slash', '/', 1, '', '?'),
			word('ShiftRight', 'shift', 2.75, 'm', { right: true }),
		],
	},
	{
		className: 'r6',
		keys: [
			word('Fn', 'fn', 1, 'x'),
			word('ControlLeft', 'control', 1, 'm'),
			word('AltLeft', 'option', 1, 'm', { shifted: 'alt', right: true }),
			word('MetaLeft', 'command', 1.25, 'm', { shifted: '⌘', right: true }),
			key('Space', '', 5.5, '', null, null, { label: 'space' }),
			word('MetaRight', 'command', 1.25, 'm', { shifted: '⌘' }),
			word('AltRight', 'option', 1, 'm', { shifted: 'alt' }),
			{ arrows: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'] },
		],
	},
];
