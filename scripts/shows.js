// F9–F12 light shows.
//
// Each show describes, for every key, one or more "pulses": when the key lights
// up, how long for, how bright, how far it lifts and in what color. Pulses run
// through the Web Animations API on opacity and transform only, so the browser
// animates them on the GPU and they stay smooth even on phones.

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// A stable pseudo-random number per key, so a show looks the same each frame.
const hash = n => {
	const x = Math.sin(n * 127.1) * 43758.5453;
	return x - Math.floor(x);
};

// Time (0–1) at which a beam that eases from `from` to `to` reaches position x.
const easedArrival = (x, from, to) => {
	const target = Math.min(1, Math.max(0, (x - from) / (to - from)));
	let lo = 0;
	let hi = 1;
	for (let i = 0; i < 14; i++) {
		const mid = (lo + hi) / 2;
		if (easeInOut(mid) < target) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
};

const SHOWS = {
	// Wave: a stadium wave rolls diagonally across the board, with a softer echo behind it.
	F9: k => {
		const at = (k.x * 0.8 + k.y * 0.3) * 760;
		return [
			{ delay: at, duration: 520, peak: 1, lift: 1 },
			{ delay: at + 260, duration: 460, peak: 0.4, lift: 0 },
		];
	},
	// Ripple: two rainbow rings expand from the center of the board.
	F10: k => {
		const d = Math.hypot((k.x - 0.5) * 1.6, (k.y - 0.5) * 0.9);
		const color = `hsl(${Math.round(d * 330) % 360} 95% 60%)`;
		return [
			{ delay: d * 820, duration: 560, peak: 1, lift: 0.8, color },
			{ delay: d * 820 + 230, duration: 520, peak: 0.55, lift: 0.3, color },
		];
	},
	// Sweep: a beam glides left to right, then back, easing at each end.
	F11: k => {
		const there = easedArrival(k.x, -0.05, 1.05) * 650;
		const back = 650 + (1 - easedArrival(k.x, -0.05, 1.05)) * 650;
		return [
			{ delay: there, duration: 380, peak: 1, lift: 0.5 },
			{ delay: back + 40, duration: 380, peak: 0.85, lift: 0.4 },
		];
	},
	// Twinkle: keys sparkle at random moments in the theme's row colors.
	F12: k => {
		const color = `var(--g${1 + Math.floor(hash(k.i * 9.3) * 6)})`;
		return [0, 1].map(n => ({
			delay: hash(k.i * 3.1 + n * 17.7) * 1400,
			duration: 300 + hash(k.i * 5.7 + n) * 260,
			peak: 0.7 + hash(k.i + n * 2.3) * 0.3,
			lift: 0.6,
			color,
		}));
	},
};

// Reduced motion: one gentle fade of the whole board, no movement.
const CALM = () => [{ delay: 0, duration: 800, peak: 0.7, lift: 0 }];

// Brightness of one pulse at `u` (0–1 through the pulse): quick rise, soft fall.
const envelope = u =>
	u <= 0 || u >= 1 ? 0 : u < 0.3 ? Math.sin((u / 0.3) * (Math.PI / 2)) : Math.cos(((u - 0.3) / 0.7) * (Math.PI / 2)) ** 2;

// Keyframes every 50ms; the browser interpolates smoothly between them.
const SAMPLE_MS = 50;

// Combines a key's pulses into one smooth curve per property, so overlapping
// pulses (like a wave and its echo) blend instead of cutting each other off.
function buildKeyframes(pulses) {
	const start = Math.min(...pulses.map(p => p.delay));
	const end = Math.max(...pulses.map(p => p.delay + p.duration));
	const duration = end - start;
	const steps = Math.max(2, Math.ceil(duration / SAMPLE_MS));
	const glow = [];
	const lift = [];
	for (let i = 0; i <= steps; i++) {
		const t = start + (duration * i) / steps;
		let g = 0;
		let l = 0;
		for (const p of pulses) {
			const e = envelope((t - p.delay) / p.duration);
			g = Math.max(g, e * p.peak);
			l = Math.max(l, e * p.lift);
		}
		glow.push(g);
		lift.push(l);
	}
	return { start, duration, glow, lift, lifts: lift.some(v => v > 0) };
}

export function createShows(rowsEl, allKeys) {
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
	// Look up each key's layers once instead of on every show.
	const parts = allKeys.map(el => ({
		glow: el.querySelector('.glow'),
		tint: el.querySelector('.tint'),
		top: el.querySelector('.top'),
	}));
	let running = [];
	let cleanupTimer = 0;

	// Every key's position as 0–1 across the board, cached until the window resizes.
	let positions = null;
	addEventListener('resize', () => (positions = null));
	function measure() {
		if (positions) return positions;
		const box = rowsEl.getBoundingClientRect();
		positions = allKeys.map((el, i) => {
			const r = el.getBoundingClientRect();
			return {
				el,
				i,
				x: (r.left + r.width / 2 - box.left) / box.width,
				y: (r.top + r.height / 2 - box.top) / box.height,
			};
		});
		return positions;
	}

	function stop() {
		clearTimeout(cleanupTimer);
		running.forEach(a => a.cancel());
		running = [];
		rowsEl.classList.remove('playing');
		allKeys.forEach(el => {
			el.classList.remove('showing');
			el.style.removeProperty('--gc');
		});
	}

	function play(code) {
		const show = reduceMotion.matches ? CALM : SHOWS[code];
		if (!show) return;
		stop();

		const keys = measure();
		rowsEl.classList.add('playing');
		let end = 0;

		for (const k of keys) {
			const { glow, tint, top } = parts[k.i];
			k.el.classList.add('showing');

			const pulses = show(k);
			const color = pulses.find(p => p.color)?.color;
			if (color) k.el.style.setProperty('--gc', color);

			const f = buildKeyframes(pulses);
			const timing = { delay: f.start, duration: f.duration };
			running.push(glow.animate(f.glow.map(v => ({ opacity: v })), timing));
			running.push(tint.animate(f.glow.map(v => ({ opacity: v * 0.55 })), timing));
			if (f.lifts) {
				const frames = f.lift.map(v => ({
					transform: `translateY(${(-v * 14).toFixed(2)}%) scale(${(1 + v * 0.03).toFixed(4)})`,
				}));
				running.push(top.animate(frames, timing));
			}
			end = Math.max(end, f.start + f.duration);
		}

		cleanupTimer = setTimeout(stop, end + 50);
	}

	return { play, stop };
}
