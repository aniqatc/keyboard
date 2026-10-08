// F9–F12 light shows. All timers are tracked so starting a new show cleanly cancels the last one.
export function createShows(rowsEl, allKeys) {
	const timers = new Set();
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

	const later = (fn, ms) => {
		const t = setTimeout(() => {
			timers.delete(t);
			fn();
		}, ms);
		timers.add(t);
	};

	function stop() {
		timers.forEach(clearTimeout);
		timers.clear();
		allKeys.forEach(k => {
			k.classList.remove('lit', 'cycle');
			k.style.removeProperty('--g');
		});
	}

	// Lights a key with its row's glow color, or a given color.
	function light(k, ms = 700, color) {
		if (color) k.style.setProperty('--g', color);
		k.classList.add('lit');
		later(() => {
			k.classList.remove('lit');
			if (color) k.style.removeProperty('--g');
		}, ms);
	}

	const centerOf = k => {
		const r = k.getBoundingClientRect();
		return [r.left + r.width / 2, r.top + r.height / 2];
	};

	const shows = {
		// Wave: lights travel across each row, one row after another.
		F9() {
			[...rowsEl.children].forEach((row, r) =>
				row.querySelectorAll('.key').forEach((k, i) => later(() => light(k, 800), r * 50 + i * 30))
			);
		},
		// Ripple: a rainbow spreads out from the center of the board.
		F10() {
			const box = rowsEl.getBoundingClientRect();
			const cx = box.left + box.width / 2;
			const cy = box.top + box.height / 2;
			const dist = k => {
				const [x, y] = centerOf(k);
				return Math.hypot(x - cx, y - cy);
			};
			[...allKeys]
				.sort((a, b) => dist(a) - dist(b))
				.forEach((k, i) =>
					later(() => {
						k.classList.add('cycle');
						later(() => k.classList.remove('cycle'), 1800);
					}, i * 20)
				);
		},
		// Sweep: a band of light crosses left to right, then back.
		F11() {
			const box = rowsEl.getBoundingClientRect();
			allKeys.forEach(k => later(() => light(k, 520), ((centerOf(k)[0] - box.left) / box.width) * 900));
			later(
				() => allKeys.forEach(k => later(() => light(k, 420), ((box.right - centerOf(k)[0]) / box.width) * 700)),
				1100
			);
		},
		// Twinkle: random keys sparkle in random row colors.
		F12() {
			for (let i = 0; i < 70; i++) {
				const k = allKeys[Math.floor(Math.random() * allKeys.length)];
				const color = `var(--g${1 + Math.floor(Math.random() * 6)})`;
				later(() => light(k, 420, color), Math.random() * 2000);
			}
		},
	};

	return {
		play(code) {
			stop();
			if (reduceMotion.matches) {
				allKeys.forEach(k => light(k, 600));
				return;
			}
			shows[code]?.();
		},
		stop,
	};
}
