// Initial Theme
document.querySelector('body').classList.add('theme-one');

// Text Area Buttons
const clearButton = document.getElementById('clear-btn');
const copyButton = document.getElementById('copy-btn');
const textarea = document.querySelector('textarea');

clearButton.addEventListener('click', () => {
	textarea.value = '';
});

copyButton.addEventListener('click', () => {
	let userText = textarea.value;
	navigator.clipboard.writeText(userText);
	textarea.value = 'Copied!';
	setTimeout(() => (textarea.value = userText), 500);
});

// Click & Keypress Events
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');
let themeKeyCode = [];
themeButtons.forEach(button =>
	themeKeyCode.push(button.getAttribute('data-key'))
);
const allKeys = document.querySelectorAll('.key');
let keyCodes = [];
allKeys.forEach(key => keyCodes.push(key.getAttribute('data-key')));

for (let j = 0; j < themeButtons.length; j++) {
	themeButtons[j].addEventListener('click', () => {
		for (let i = 0; i < themeButtons.length; i++) {
			document.body.classList.remove(`theme-${themes[i]}`);
			document.body.classList.add(`theme-${themes[j]}`);
		}
	});
}

document.addEventListener('keydown', event => {
	for (let j = 0; j < themeKeyCode.length; j++) {
		if (event.key === themeKeyCode[j]) {
			themeButtons.forEach(el => el.classList.remove('active'));
			themeButtons[j].classList.add('active');
			for (let i = 0; i < themeButtons.length; i++) {
				document.body.classList.remove(`theme-${themes[i]}`);
				document.body.classList.add(`theme-${themes[j]}`);
			}
			break;
		} else {
			textarea.focus();
		}
	}
	for (let k = 0; k < allKeys.length; k++) {
		if (event.key === keyCodes[k]) {
			allKeys[k].classList.add('active');
		}
	}
});

document.addEventListener('keyup', () => {
	allKeys.forEach(el => el.classList.remove('active'));
});
