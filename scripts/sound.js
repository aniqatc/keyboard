import { storage, KEYS } from './storage.js';

// Plays assets/click.mp3 through Web Audio so rapid presses overlap instead of
// cutting each other off. Falls back to a synthesized click if the file can't load.
export function createSound(button) {
	let ctx = null;
	let clickBuffer = null;
	let rawClick = null;
	let enabled = storage.get(KEYS.sound) === 'on';

	fetch('assets/click.mp3')
		.then(res => (res.ok ? res.arrayBuffer() : null))
		.then(buf => (rawClick = buf))
		.catch(() => {});

	function context() {
		if (!ctx) {
			const AudioCtx = window.AudioContext || window.webkitAudioContext;
			if (!AudioCtx) return null;
			ctx = new AudioCtx();
		}
		if (rawClick && !clickBuffer) {
			const data = rawClick;
			rawClick = null;
			ctx.decodeAudioData(data).then(b => (clickBuffer = b)).catch(() => {});
		}
		return ctx;
	}

	function synthClick(ac, heavy) {
		const length = 0.035;
		const buffer = ac.createBuffer(1, ac.sampleRate * length, ac.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6);
		}
		const source = ac.createBufferSource();
		source.buffer = buffer;
		const filter = ac.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = heavy ? 1000 : 2300;
		filter.Q.value = 0.9;
		source.connect(filter);
		return { source, out: filter };
	}

	function play(heavy = false) {
		if (!enabled) return;
		try {
			const ac = context();
			if (!ac) return;
			const gain = ac.createGain();
			gain.gain.value = heavy ? 0.9 : 0.6;
			gain.connect(ac.destination);
			if (clickBuffer) {
				const source = ac.createBufferSource();
				source.buffer = clickBuffer;
				source.playbackRate.value = heavy ? 0.85 : 1;
				source.connect(gain);
				source.start();
			} else {
				const { source, out } = synthClick(ac, heavy);
				out.connect(gain);
				source.start();
			}
		} catch {
			// Audio is a nice-to-have; never let it break typing.
		}
	}

	function render() {
		button.setAttribute('aria-pressed', String(enabled));
	}

	button.addEventListener('click', () => {
		enabled = !enabled;
		storage.set(KEYS.sound, enabled ? 'on' : 'off');
		render();
		play();
	});

	render();
	return { play };
}
