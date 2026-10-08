// Info dialog: esc or the backdrop closes it, Tab stays inside it, and focus
// returns to where it was when it closes.
export function createModal(overlay, closeButton) {
	let returnFocus = null;

	const focusable = () =>
		[...overlay.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden);

	function open() {
		returnFocus = document.activeElement;
		overlay.hidden = false;
		closeButton.focus();
	}

	function close() {
		overlay.hidden = true;
		if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
	}

	closeButton.addEventListener('click', close);
	overlay.addEventListener('click', e => {
		if (e.target === overlay) close();
	});
	overlay.addEventListener('keydown', e => {
		if (e.key !== 'Tab') return;
		const items = focusable();
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	});

	return { open, close, isOpen: () => !overlay.hidden };
}
