// Toast Notification
function renderToast() {
	const notif = document.createElement('div');
	notif.classList.add('toast');
	notif.innerHTML = `Click <code>Escape</code> for info!`;
	toasts.appendChild(notif);

	setTimeout(() => {
		notif.remove();
	}, 5000);
}

renderToast();

// Retrieve saved content
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
	document.body.classList.add(`theme-${savedTheme}`);
}

const textarea = document.querySelector('textarea');
const savedText = localStorage.getItem('note');
if (savedText) {
	textarea.value = `${savedText}`;
}

// Textarea toolbar
const clearButton = document.getElementById('clear-btn');
const copyButton = document.getElementById('copy-btn');
const saveButton = document.getElementById('save-btn');
const previewButton = document.getElementById('preview-btn');
const editButton = document.getElementById('edit-btn');
const textPreview = document.querySelector('.textarea-preview');
const previewLabel = document.querySelector('.preview-label');

function toggleVisibility(element, displayChoice) {
	element.style.display = displayChoice;
}

function displayTemporaryMessage(element, message, content, duration = 600) {
	if (element === textarea) {
		textarea.value = message;
		setTimeout(() => (element.value = content), duration);
	} else if (element === textPreview) {
		textPreview.innerHTML = message;
		setTimeout(() => (element.innerHTML = content), duration);
	}
}

clearButton.addEventListener('click', () => {
	textarea.value = '';
	textPreview.innerHTML = '';

	localStorage.setItem('note', `${textarea.value}`);
});

copyButton.addEventListener('click', () => {
	const textValue = textarea.value;
	const htmlValue = textPreview.innerHTML;
	if (textValue || htmlValue) {
		navigator.clipboard.writeText(textValue);

		displayTemporaryMessage(textarea, 'Copied! ✔︎', textValue);
		displayTemporaryMessage(textPreview, 'Copied! ✔︎', htmlValue);
	} else {
		displayTemporaryMessage(textarea, `Type Something! 📝`, '');
		displayTemporaryMessage(textPreview, `Type Something! 📝`, '');
	}
});

saveButton.addEventListener('click', () => {
	const textValue = textarea.value;
	const htmlValue = textPreview.innerHTML;

	displayTemporaryMessage(textarea, 'Saved! ✔︎', textValue);
	displayTemporaryMessage(textPreview, 'Saved! ✔︎', htmlValue);

	localStorage.setItem('note', `${textValue}`);
});

previewButton.addEventListener('click', () => {
	const markdown = marked(textarea.value);
	textPreview.innerHTML = markdown;

	toggleVisibility(previewLabel, 'block');
	toggleVisibility(textPreview, 'block');
	toggleVisibility(textarea, 'none');
});

editButton.addEventListener('click', () => {
	toggleVisibility(previewLabel, 'none');
	toggleVisibility(textPreview, 'none');
	toggleVisibility(textarea, 'block');
});

// Themes
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');

function removeAllThemeClasses() {
	themes.forEach(theme => document.body.classList.remove(`theme-${theme}`));
}

function changeTheme(theme) {
	removeAllThemeClasses();
	document.body.classList.add(`theme-${theme}`);
	localStorage.setItem('theme', theme);
}

// Change Theme on Click
themeButtons.forEach((button, index) => {
	button.addEventListener('click', () => {
		changeTheme(themes[index]);
	});
});

// Shuffle Theme Button
document.getElementById('shuffle').addEventListener('click', () => {
	removeAllThemeClasses();
	const randomTheme = themes[Math.floor(Math.random() * themes.length)];
	changeTheme(randomTheme);
});

// KEY DECLARATIONS

// Theme Keys
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

// Click Sound
const clickAudio = document.getElementById('click-audio');

// Click Event Trigger Corresponding Keydown Event
allKeys.forEach(key => {
	key.addEventListener('click', event => {
		clearActiveOnKeys();

		// Add Active Class
		key.classList.add('active');

		// Add Click Sound
		clickAudio.play();

		const keyCode = event.target.getAttribute('data-key');
		let caretStart = textarea.selectionStart;

		// Add Letter Clicks to Text Area
		if (keyCode && keyCode.length === 1) {
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
			textarea.blur();
			animateF9();
		} else if (keyCode === 'F10') {
			textarea.blur();
			animateF10();
		} else if (keyCode === 'ArrowLeft') {
			caretStart--;
		} else if (keyCode === 'ArrowRight') {
			caretStart++;
		} else if (keyCode === 'ArrowUp') {
			caretStart = textarea.value.lastIndexOf('\n', caretStart - 1);
		} else if (keyCode === 'ArrowDown') {
			caretStart = textarea.value.indexOf('\n', caretStart) + 1;
		}
		textarea.setSelectionRange(caretStart, caretStart);
	});
});

// Keydown Events
document.addEventListener('keydown', event => {
	clearActiveOnKeys();
	textarea.focus();

	// Change Theme
	for (let i = 0; i < themeKeyCode.length; i++) {
		if (event.key === themeKeyCode[i]) {
			themeButtons[i].classList.add('active');
			removeAllThemeClasses();
			changeTheme(themes[i]);
			break;
		}
	}

	// Add Active Class for Character Keys
	for (let i = 0; i < allCharKeys.length; i++) {
		if (
			event.key === charKeyCodes[i] ||
			event.key === charKeyCodes[i].toUpperCase()
		) {
			allCharKeys[i].classList.add('active');
		}
	}

	// Add Active Class for Operation Keys
	for (let i = 0; i < allOperationalKeys.length; i++) {
		if (event.code === operationKeyCodes[i]) {
			allOperationalKeys[i].classList.add('active');
		}
	}

	// Handle CapsLock
	if (event.code === 'CapsLock' && event.getModifierState('CapsLock')) {
		capsIndicator.classList.add('active');
		letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
	}

	// Shift Hold
	if (event.key === 'Shift') {
		letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
	}

	// Escape: Open Modal
	if (event.key === 'Escape') {
		textarea.blur();
		openModal();
	}

	// F9 Animation
	if (event.key === 'F9') {
		animateF9();
	}

	// F10 Animation
	if (event.key === 'F10') {
		animateF10();
	}
});

// Animation helpers
function clearActiveOnKeys() {
	allKeys.forEach(el => el.classList.remove('active', 'key-color-cycle'));
}

function addAnimationClasses(key, delay, className) {
	requestAnimationFrame(() =>
		setTimeout(() => key.classList.add(className), delay)
	);
}

function removeAnimationClasses(key, delay, className) {
	requestAnimationFrame(() =>
		setTimeout(() => key.classList.remove(className), delay)
	);
}

// Animations
function animateF9() {
	clearActiveOnKeys();

	const rows = [
		document.querySelectorAll('.row-one .key'),
		document.querySelectorAll('.row-two .key'),
		document.querySelectorAll('.row-three .key'),
		document.querySelectorAll('.row-four .key'),
		document.querySelectorAll('.row-five .key'),
		document.querySelectorAll('.row-six .key'),
	];

	rows.forEach(row => {
		row.forEach((key, i) => addAnimationClasses(key, 100 * i, 'active'));
	});
}

function animateF10() {
	clearActiveOnKeys();

	for (let i = 0; i < allKeys.length; i++) {
		addAnimationClasses(allKeys[i], 50 * i, 'key-color-cycle');

		setTimeout(() => {
			removeAnimationClasses(allKeys[i], 50 * i, 'key-color-cycle');
		}, 4000);
	}
}

// Remove Active Classes on Keyup Events
document.addEventListener('keyup', event => {
	setTimeout(clearActiveOnKeys, 2000);

	if (!event.getModifierState('CapsLock')) {
		capsIndicator.classList.remove('active');
		letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
	}
});

// Modal Popup
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const closeModalButton = document.querySelector('.close-modal');
const openModalButton = document.getElementById('esc');

function closeModal() {
	modal.classList.add('hidden');
	overlay.classList.add('hidden');
}

function openModal() {
	textarea.blur();
	modal.classList.remove('hidden');
	overlay.classList.remove('hidden');
}

openModalButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
