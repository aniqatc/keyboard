// F9–F12 light shows.
//
// Each show is a function of time that returns, for every key, how brightly it
// glows (heat, 0–1), how far it lifts (lift, 0–1) and optionally a color.
// One requestAnimationFrame loop writes those as CSS variables, so the lights
// move smoothly instead of switching classes on and off with setTimeout.

const gauss = (x, width) => Math.exp(-((x / width) ** 2));
const clamp01 = v => Math.min(1, Math.max(0, v));
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// A stable pseudo-random number per key, so twinkles don't change every frame.
const hash = n => {
	const x = Math.sin(n * 127.1) * 43758.5453;
	return x - Math.floor(x);
};

const SHOWS = {
	// Wave: a stadium wave rolls diagonally across the board, with a softer echo behind it.
	F9: {
		duration: 2000,
		frame(t, k) {
			const pos = k.x * 0.8 + k.y * 0.35;
			const front = -0.25 + t * 1.6;
			const main = gauss(pos - front, 0.09);
			const echo = gauss(pos - (front - 0.35), 0.07) * 0.45;
			const heat = Math.max(main, echo);
			return { heat, lift: main };
		},
	},
	// Ripple: two rainbow rings expand from the center; color shifts with distance and time.
	F10: {
		duration: 2200,
		frame(t, k) {
			const d = Math.hypot((k.x - 0.5) * 1.6, (k.y - 0.5) * 0.9);
			const r1 = gauss(d - t * 1.25, 0.09);
			const r2 = gauss(d - (t - 0.28) * 1.25, 0.08) * 0.7;
			const heat = Math.max(r1, r2) * (1 - t * 0.35);
			const hue = Math.round((d * 320 + t * 240) % 360);
			return { heat, lift: r1 * 0.8, color: `hsl(${hue} 95% 60%)` };
		},
	},
	// Sweep: a beam of light glides left to right and back, like a scanner.
	F11: {
		duration: 2400,
		frame(t, k) {
			const phase = t < 0.5 ? easeInOut(t * 2) : 1 - easeInOut((t - 0.5) * 2);
			const beam = -0.1 + phase * 1.2;
			const heat = gauss(k.x - beam, 0.07);
			const trail = gauss(k.x - beam + (t < 0.5 ? 0.12 : -0.12), 0.1) * 0.35;
			return { heat: Math.max(heat, trail), lift: heat * 0.5 };
		},
	},
	// Twinkle: keys sparkle at random moments in random row colors, then the board settles.
	F12: {
		duration: 2600,
		frame(t, k) {
			let heat = 0;
			for (let n = 0; n < 2; n++) {
				const start = hash(k.i * 3.1 + n * 17.7) * 0.8;
				const local = (t - start) / 0.16;
				if (local > 0 && local < 1) heat = Math.max(heat, Math.sin(local * Math.PI) ** 2);
			}
			const glow = 1 + Math.floor(hash(k.i * 9.3) * 6);
			return { heat, lift: heat * 0.6, color: `var(--g${glow})` };
		},
	},
};

// Reduced motion: one gentle fade of the whole board, no movement.
const CALM = {
	duration: 900,
	frame: t => ({ heat: Math.sin(t * Math.PI) * 0.7, lift: 0 }),
};

export function createShows(rowsEl, allKeys) {
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
	let raf = 0;

	function stop() {
		cancelAnimationFrame(raf);
		raf = 0;
		allKeys.forEach(el => {
			el.classList.remove('showing');
			el.style.removeProperty('--heat');
			el.style.removeProperty('--lift');
			el.style.removeProperty('--gc');
		});
	}

	function play(code) {
		const show = reduceMotion.matches ? CALM : SHOWS[code];
		if (!show) return;
		stop();

		// Measure every key once, as 0–1 positions across the board.
		const box = rowsEl.getBoundingClientRect();
		const keys = allKeys.map((el, i) => {
			const r = el.getBoundingClientRect();
			return {
				el,
				i,
				x: (r.left + r.width / 2 - box.left) / box.width,
				y: (r.top + r.height / 2 - box.top) / box.height,
			};
		});
		keys.forEach(k => k.el.classList.add('showing'));

		const startTime = performance.now();
		const tick = now => {
			const t = Math.min(1, (now - startTime) / show.duration);
			for (const k of keys) {
				const { heat, lift = 0, color } = show.frame(t, k);
				k.el.style.setProperty('--heat', clamp01(heat).toFixed(3));
				k.el.style.setProperty('--lift', clamp01(lift).toFixed(3));
				if (color) k.el.style.setProperty('--gc', color);
			}
			if (t < 1) raf = requestAnimationFrame(tick);
			else stop();
		};
		raf = requestAnimationFrame(tick);
	}

	return { play, stop };
}
