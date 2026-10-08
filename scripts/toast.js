const container = document.getElementById('toasts');

// Small pill notifications. Replaces writing "Copied!" into the textarea,
// which could overwrite whatever was typed during the message.
export function toast(html, duration = 2200) {
	const el = document.createElement('div');
	el.className = 'toast';
	el.innerHTML = html;
	container.appendChild(el);

	setTimeout(() => {
		el.classList.add('out');
		setTimeout(() => el.remove(), 300);
	}, duration);
}
