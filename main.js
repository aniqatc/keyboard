// Allow Touchstart Events
document.addEventListener('touchstart', function () {}, true);

// Initial Theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
	document.body.classList.add(`theme-${savedTheme}`);
}

// Text Area Buttons
const clearButton = document.getElementById('clear-btn');
const copyButton = document.getElementById('copy-btn');
const textarea = document.querySelector('textarea');

clearButton.addEventListener('click', () => {
	textarea.value = '';
});

copyButton.addEventListener('click', () => {
	let userText = textarea.value;
	if (userText) {
		navigator.clipboard.writeText(userText);
		textarea.value = 'Copied! ✔︎';
		setTimeout(() => (textarea.value = userText), 600);
	} else {
		textarea.value = `Type Something First! 📝`;
		setTimeout(() => (textarea.value = ''), 600);
	}
});

// Click & Keypress Events
// Theme Declarations
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');
let themeKeyCode = [];
themeButtons.forEach(button =>
	themeKeyCode.push(button.getAttribute('data-key'))
);

// All Keys
const allKeys = document.querySelectorAll('.key');
let allKeyCodes = [];
allKeys.forEach(key => allKeyCodes.push(key.getAttribute('data-key')));

// All Letter, Character and Number Keys
const allCharKeys = document.querySelectorAll('.key:not(.operation-key)');
let charKeyCodes = [];
allCharKeys.forEach(key => charKeyCodes.push(key.getAttribute('data-key')));

// All Operation-Based Keys
const allOperationalKeys = document.querySelectorAll('.operation-key');
let operationKeyCodes = [];
allOperationalKeys.forEach(key =>
	operationKeyCodes.push(key.getAttribute('data-key'))
);

// All Letter Keys & Caps Lock Indicator (to change case)
const letterKeys = document.querySelectorAll('.letter-key');
const capsIndicator = document.querySelector('.caps-indicator');

// Click Event Trigger Corresponding Keydown Event
allKeys.forEach(key => {
	key.addEventListener('click', event => {
		key.classList.add('active');
		// Remove Class After 4s
		setTimeout(() => {
			key.classList.remove('active');
		}, 2000);
		const keyCode = event.target.getAttribute('data-key');
		// Add Letter Clicks to Text Area
		if (keyCode.length == 1) {
			textarea.value += keyCode;
		} else if (keyCode === 'Space') {
			textarea.value += ' ';
		} else if (keyCode === 'Backspace') {
			textarea.value = textarea.value.substring(0, textarea.value.length - 1);
		} else if (keyCode === 'Enter') {
			textarea.value += '\n';
		} else if (keyCode === 'Tab') {
			textarea.value += '    ';
		} else if (keyCode === 'F9') {
			animationRows();
		} else if (keyCode === 'F10') {
			animationColors();
		}
	});
});

// Change Theme on Click
for (let j = 0; j < themeButtons.length; j++) {
	themeButtons[j].addEventListener('click', () => {
		for (let i = 0; i < themeButtons.length; i++) {
			document.body.classList.remove(`theme-${themes[i]}`);
			document.body.classList.add(`theme-${themes[j]}`);
			localStorage.setItem('theme', themes[j]);
		}
	});
}

// Shuffle Theme Button
document.getElementById('shuffle').addEventListener('click', () => {
	for (let i = 0; i < themes.length; i++) {
		document.body.classList.remove(`theme-${themes[i]}`);
	}
	const randomTheme = themes[Math.floor(Math.random() * themes.length)];
	document.body.classList.add(`theme-${randomTheme}`);
	localStorage.setItem('theme', randomTheme);
});

// Change Theme on Keydown
document.addEventListener('keydown', event => {
	for (let j = 0; j < themeKeyCode.length; j++) {
		if (event.key === themeKeyCode[j]) {
			themeButtons.forEach(el => el.classList.remove('active'));
			themeButtons[j].classList.add('active');
			for (let i = 0; i < themeButtons.length; i++) {
				document.body.classList.remove(`theme-${themes[i]}`);
				document.body.classList.add(`theme-${themes[j]}`);
				localStorage.setItem('theme', themes[j]);
			}
			break;
		} else {
			textarea.focus();
		}
	}

	// Add Active Class for Character Keys
	for (let k = 0; k < allCharKeys.length; k++) {
		if (event.key === charKeyCodes[k]) {
			allCharKeys[k].classList.add('active');
		} else if (event.key === charKeyCodes[k].toUpperCase()) {
			allCharKeys[k].classList.add('active');
		}
	}

	// Add Active Class for Operation Keys
	for (let i = 0; i < allOperationalKeys.length; i++) {
		if (event.code === operationKeyCodes[i]) {
			allOperationalKeys[i].classList.add('active');
		}
		if (event.code === 'CapsLock' && event.getModifierState('CapsLock')) {
			capsIndicator.classList.add('active');
			letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
		}
	}

	// Shift Hold
	if (event.key === 'Shift') {
		letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
	}

	// Escape Open Modal
	if (event.key === 'Escape') {
		textarea.blur();
		openModal();
	}

	// F9 Animation
	if (event.key === 'F9') {
		animationRows();
	}

	// F10 Animation
	if (event.key === 'F10') {
		animationColors();
	}
});

// "Esc" Modal Popup
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const closeModalButton = document.querySelector('.close-modal');
const openModalButton = document.getElementById('esc');

function closeModal() {
	modal.classList.add('hidden');
	overlay.classList.add('hidden');
}

function openModal() {
	modal.classList.remove('hidden');
	overlay.classList.remove('hidden');
}

openModalButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

function animationRows() {
	allKeys.forEach(el => el.classList.remove('key-animation', 'active'));
	const rowOne = document.querySelectorAll('.row-one .key');
	for (let i = 0; i < rowOne.length; i++) {
		setTimeout(() => {
			rowOne[i].classList.add('active');
		}, 100 * i);
	}
	const rowTwo = document.querySelectorAll('.row-two .key');
	for (let i = 0; i < rowTwo.length; i++) {
		setTimeout(() => {
			rowTwo[i].classList.add('active');
		}, 500 + 100 * i);
	}
	const rowThree = document.querySelectorAll('.row-three .key');
	for (let i = 0; i < rowThree.length; i++) {
		setTimeout(() => {
			rowThree[i].classList.add('active');
		}, 1000 + 100 * i);
	}
	const rowFour = document.querySelectorAll('.row-four .key');
	for (let i = 0; i < rowFour.length; i++) {
		setTimeout(() => {
			rowFour[i].classList.add('active');
		}, 1500 + 100 * i);
	}
	const rowFive = document.querySelectorAll('.row-five .key');
	for (let i = 0; i < rowFive.length; i++) {
		setTimeout(() => {
			rowFive[i].classList.add('active');
		}, 2000 + 100 * i);
	}
	const rowSix = document.querySelectorAll('.row-six .key');
	for (let i = 0; i < rowFour.length; i++) {
		setTimeout(() => {
			rowSix[i].classList.add('active');
		}, 2500 + 100 * i);
	}
	setTimeout(() => {
		allKeys.forEach(el => el.classList.remove('active'));
	}, 6000);
}

function animationColors() {
	allKeys.forEach(el => el.classList.remove('active', 'key-animation'));
	for (let i = 0; i < allKeys.length; i++) {
		setTimeout(() => {
			allKeys[i].classList.add('active', 'key-animation');
		}, 50 * i);
	}
	setTimeout(() => {
		for (let i = 0; i < allKeys.length; i++) {
			setTimeout(() => {
				allKeys[i].classList.remove('active', 'key-animation');
			}, 100 * i);
		}
	}, 5000);
}

// Remove Active Class With A Delay
document.addEventListener('keyup', event => {
	if (!event.getModifierState('CapsLock')) {
		capsIndicator.classList.remove('active');
		letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
	}

	setTimeout(() => {
		allKeys.forEach(el => el.classList.remove('active', 'key-animation'));
	}, 2000);
});
