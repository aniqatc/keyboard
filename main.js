// Initial Theme
document.querySelector('body').classList.add('theme-one');

const userTheme = localStorage.getItem('userChoice');
if (userTheme) {
	document.querySelector('body').classList.add(userTheme);
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

// Change Theme on Click
for (let j = 0; j < themeButtons.length; j++) {
	themeButtons[j].addEventListener('click', () => {
		for (let i = 0; i < themeButtons.length; i++) {
			document.body.classList.remove(`theme-${themes[i]}`);
			document.body.classList.add(`theme-${themes[j]}`);
			updateStorage(`theme-${themes[j]}`);
		}
	});
}

// Shuffle Theme Button
document.getElementById('shuffle').addEventListener('click', () => {
	for (let i = 0; i < themes.length; i++) {
		document.body.classList.remove(`theme-${themes[i]}`);
	}
	document.body.classList.add(
		`theme-${themes[Math.floor(Math.random() * themes.length)]}`
	);
	updateStorage(`theme-${themes[j]}`);
});

// Click Event Trigger Corresponding Keydown Event
allKeys.forEach(key => {
	key.addEventListener('click', event => {
		const keyCode = event.target.getAttribute('data-key');
		textarea.focus();
		// Add Letter Clicks to Text Area
		if (keyCode.length === 1) {
			textarea.value += keyCode;
		} else if (keyCode === 'Space') {
			textarea.value += ' ';
		} else if (keyCode === 'Backspace') {
			textarea.value = textarea.value.substring(0, textarea.value.length - 1);
		} else if (keyCode === 'Enter') {
			textarea.value += '\n';
		}
	});
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
				updateStorage(`theme-${themes[j]}`);
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
});

// Remove Active Class With A Delay
document.addEventListener('keyup', event => {
	setTimeout(() => allKeys.forEach(el => el.classList.remove('active')), 1000);
	if (!event.getModifierState('CapsLock')) {
		capsIndicator.classList.remove('active');
		letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
	}
});

function updateStorage(theme) {
	localStorage.setItem('userChoice', theme);
}
