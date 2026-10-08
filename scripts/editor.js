import { storage, KEYS } from './storage.js';

export const SAMPLE = `# Hello from the keyboard

Type on your own keys and the big ones glow. Tap them instead if you like.

## Try this

- Press **F1** to **F8** to change the theme
- Press **F9** or **F10** for a light show
- Press **esc** for the info card

> Turn on **fn** and tap \`B\` to make selected text bold.

\`\`\`js
const themes = 8;
console.log(\`\${themes} keyboards in one\`);
\`\`\`

- [x] Find the shuffle key
- [ ] Pick a favorite theme
`;

// Matches the start of a list, task or quote line, e.g. "- ", "1. ", "- [ ] ", "> ".
export const LIST_RE = /^(\s*)(> |- \[[ x]\] |[-*+] |\d+\. )/;

const escapeHTML = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export function createEditor({ textarea, preview, stats }) {
	const ta = textarea;
	let saveTimer;
	let keystrokes = 0;

	if (window.DOMPurify) {
		DOMPurify.addHook('afterSanitizeAttributes', node => {
			if (node.tagName === 'A') {
				node.setAttribute('target', '_blank');
				node.setAttribute('rel', 'noopener');
			}
		});
	}

	// ---- Text editing ---------------------------------------------------
	// Edits go through execCommand when the editor has focus, so Ctrl/⌘+Z can undo
	// them. Assigning textarea.value (the old approach) wipes the undo history.
	// execCommand is deprecated but still the only way to add to the native undo
	// stack; setRangeText is the fallback when the editor isn't focused (touch screens).
	const selection = () => [ta.selectionStart, ta.selectionEnd];
	function replace(text, start, end, mode = 'end') {
		if (document.activeElement === ta && typeof document.execCommand === 'function') {
			ta.setSelectionRange(start, end);
			const ok = text ? document.execCommand('insertText', false, text) : document.execCommand('delete');
			if (ok) return;
		}
		ta.setRangeText(text, start, end, mode);
	}
	const insert = text => {
		const [s, e] = selection();
		replace(text, s, e);
	};

	function backspace() {
		const [s, e] = selection();
		if (s !== e) replace('', s, e);
		else if (s > 0) replace('', s - 1, s);
	}

	function wrap(before, after, placeholder) {
		const [s, e] = selection();
		const inner = ta.value.slice(s, e) || placeholder;
		replace(before + inner + after, s, e);
		ta.setSelectionRange(s + before.length, s + before.length + inner.length);
	}

	// Toggles a prefix such as "# " or "- " on the current line.
	function togglePrefix(prefix, existing) {
		const [s] = selection();
		const v = ta.value;
		const lineStart = v.lastIndexOf('\n', s - 1) + 1;
		let lineEnd = v.indexOf('\n', s);
		if (lineEnd < 0) lineEnd = v.length;
		const line = v.slice(lineStart, lineEnd);
		const current = line.match(existing)?.[0] ?? '';
		const next = current === prefix ? '' : prefix;
		replace(next + line.slice(current.length), lineStart, lineEnd, 'preserve');
		const caret = Math.max(lineStart, s + next.length - current.length);
		ta.setSelectionRange(caret, caret);
	}

	// Enter continues lists; Enter on an empty list item ends the list.
	function newline() {
		const [s] = selection();
		const v = ta.value;
		const lineStart = v.lastIndexOf('\n', s - 1) + 1;
		const line = v.slice(lineStart, s);
		const m = line.match(LIST_RE);
		if (m && line.trim() === m[0].trim()) {
			replace('', lineStart, s);
			insert('\n');
			return;
		}
		if (m) {
			let marker = m[2];
			const num = marker.match(/^(\d+)\. /);
			if (num) marker = `${Number(num[1]) + 1}. `;
			if (marker.startsWith('- [')) marker = '- [ ] ';
			insert(`\n${m[1]}${marker}`);
			return;
		}
		insert('\n');
	}

	function moveHorizontal(dir) {
		const [s, e] = selection();
		const pos = dir < 0 ? (s !== e ? s : Math.max(0, s - 1)) : s !== e ? e : Math.min(ta.value.length, e + 1);
		ta.setSelectionRange(pos, pos);
	}

	// Moves the caret up or down a line, keeping the column where possible.
	function moveVertical(dir) {
		const v = ta.value;
		const s = ta.selectionStart;
		const lineStart = v.lastIndexOf('\n', s - 1) + 1;
		const col = s - lineStart;
		let pos;
		if (dir < 0) {
			if (lineStart === 0) pos = 0;
			else {
				const prevStart = v.lastIndexOf('\n', lineStart - 2) + 1;
				pos = Math.min(prevStart + col, lineStart - 1);
			}
		} else {
			const lineEnd = v.indexOf('\n', s);
			if (lineEnd < 0) pos = v.length;
			else {
				let nextEnd = v.indexOf('\n', lineEnd + 1);
				if (nextEnd < 0) nextEnd = v.length;
				pos = Math.min(lineEnd + 1 + col, nextEnd);
			}
		}
		ta.setSelectionRange(pos, pos);
	}

	const HEADING = /^#{1,6} /;
	const markdown = {
		h1: () => togglePrefix('# ', HEADING),
		h2: () => togglePrefix('## ', HEADING),
		h3: () => togglePrefix('### ', HEADING),
		quote: () => togglePrefix('> ', /^> /),
		ul: () => togglePrefix('- ', LIST_RE),
		ol: () => togglePrefix('1. ', LIST_RE),
		task: () => togglePrefix('- [ ] ', LIST_RE),
		bold: () => wrap('**', '**', 'bold text'),
		italic: () => wrap('*', '*', 'italic text'),
		strike: () => wrap('~~', '~~', 'struck text'),
		link: () => wrap('[', '](https://)', 'link text'),
		image: () => wrap('![', '](https://)', 'alt text'),
		code: () => {
			const [s, e] = selection();
			if (ta.value.slice(s, e).includes('\n')) wrap('```\n', '\n```', 'code');
			else wrap('`', '`', 'code');
		},
		hr: () => insert('\n\n---\n\n'),
	};

	// ---- Rendering, stats and saving -----------------------------------
	function render() {
		const v = ta.value;
		if (window.marked) {
			const html = marked.parse(v, { gfm: true });
			preview.innerHTML = window.DOMPurify ? DOMPurify.sanitize(html) : `<pre>${escapeHTML(v)}</pre>`;
		} else {
			preview.innerHTML = `<pre>${escapeHTML(v)}</pre>`;
		}
		const words = (v.match(/[A-Za-z0-9À-￿'’]+/g) || []).length;
		stats.words.textContent = words.toLocaleString();
		stats.chars.textContent = v.length.toLocaleString();
	}

	function save() {
		clearTimeout(saveTimer);
		const ok = storage.set(KEYS.note, ta.value);
		stats.saved.textContent = ok ? 'Saved' : 'Not saved: storage is off';
		return ok;
	}

	// Called after every change: re-render now, autosave shortly after typing stops.
	function update() {
		render();
		stats.saved.textContent = 'Saving…';
		clearTimeout(saveTimer);
		saveTimer = setTimeout(save, 500);
	}

	function countKeystroke() {
		keystrokes++;
		stats.keys.textContent = keystrokes.toLocaleString();
	}

	function clear() {
		ta.value = '';
		update();
	}

	const saved = storage.get(KEYS.note);
	ta.value = saved != null ? saved : SAMPLE;
	ta.addEventListener('input', update);
	render();

	return {
		textarea: ta,
		insert, backspace, newline, moveHorizontal, moveVertical,
		markdown, update, save, clear, countKeystroke, selection,
	};
}
