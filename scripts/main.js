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

// Toast Notification
function renderToast() {
	const notif = document.createElement('div');
	notif.classList.add('toast');
	notif.innerHTML = `Click <code>Escape</code> for info!`;
	toasts.appendChild(notif);

	setTimeout(() => {
		notif.remove();
	}, 1000 * 5);
}

renderToast();

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

// Textarea toolbar
const clearButton = document.getElementById('clear-btn');
const copyButton = document.getElementById('copy-btn');
const saveButton = document.getElementById('save-btn');
const previewButton = document.getElementById('preview-btn');
const editButton = document.getElementById('edit-btn');
const textPreview = document.querySelector('.textarea-preview');
const previewLabel = document.querySelector('.preview-label');

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

// Textarea toolbar helpers
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

// Themes
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');

function changeTheme(theme) {
	themes.forEach(theme => document.body.classList.remove(`theme-${theme}`));
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
	changeTheme(themes[Math.floor(Math.random() * themes.length)]);
});

// KEY DECLARATIONS

// Theme Keys
let themeKeyCode = [];
themeButtons.forEach(button => themeKeyCode.push(button.getAttribute('data-key')));

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
allOperationalKeys.forEach(key => operationKeyCodes.push(key.getAttribute('data-key')));

// All 26 Letter Keys & Caps Lock Indicator (to change case)
const letterKeys = document.querySelectorAll('.letter-key');
const capsIndicator = document.querySelector('.caps-indicator');

// Click Sound
const clickAudio = document.getElementById('click-audio');

// Click Event Trigger Corresponding Keydown Event
allKeys.forEach(key => {
	key.addEventListener('click', event => {
		event.preventDefault();

		// Get the actual key element even if clicking on a child element
		const keyElement = event.target.closest('.key');
		if (!keyElement) return;

		const dataKeyCode = keyElement.getAttribute('data-key');
		const isAnimationKey = dataKeyCode === 'F9' || dataKeyCode === 'F10';

		if (!isAnimationKey && !textarea.matches(':focus')) {
			textarea.focus();
		}

		keyElement.classList.add('active');
		clickAudio.play();

		const keyCode = keyElement.getAttribute('data-key');
		let caretStart = textarea.selectionStart;
		let caretEnd = textarea.selectionEnd;

		switch (keyCode) {
			case 'Space':
				textarea.value =
					textarea.value.substring(0, caretStart) + ' ' + textarea.value.substring(caretEnd);
				caretStart++;
				break;
			case 'Backspace':
				if (caretStart === caretEnd && caretStart > 0) {
					textarea.value =
						textarea.value.substring(0, caretStart - 1) + textarea.value.substring(caretEnd);
					caretStart--;
				} else {
					textarea.value =
						textarea.value.substring(0, caretStart) + textarea.value.substring(caretEnd);
				}
				break;
			case 'Enter':
				textarea.value =
					textarea.value.substring(0, caretStart) + '\n' + textarea.value.substring(caretEnd);
				caretStart++;
				break;
			case 'Tab':
				textarea.value =
					textarea.value.substring(0, caretStart) + '    ' + textarea.value.substring(caretEnd);
				caretStart += 4;
				break;
			case 'F9':
				textarea.blur();
				animateF9();
				break;
			case 'F10':
				textarea.blur();
				animateF10();
				break;
			default:
				if (keyCode && keyCode.length === 1) {
					textarea.value =
						textarea.value.substring(0, caretStart) + keyCode + textarea.value.substring(caretEnd);
					caretStart++;
				}
		}

		// Update caret position
		textarea.setSelectionRange(caretStart, caretStart);

		// Remove active class after animation
		setTimeout(() => {
			keyElement.classList.remove('active');
		}, 150);
	});
});

// Keydown Events
document.addEventListener('keydown', event => {
	clearActiveOnKeys();
	if (!textarea.matches(':focus')) {
		textarea.focus();
	}

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
		if (event.key === charKeyCodes[i] || event.key === charKeyCodes[i].toUpperCase()) {
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
	if (event.code === 'CapsLock') {
		if (event.getModifierState('CapsLock')) {
			capsIndicator.classList.add('active');
			letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
		} else {
			capsIndicator.classList.remove('active');
			letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
		}
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
		textarea.blur();
		animateF9();
	}

	// F10 Animation
	if (event.key === 'F10') {
		textarea.blur();
		animateF10();
	}
});

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

	rows.forEach((row, rowIndex) => {
		row.forEach((key, keyIndex) => {
			setTimeout(() => {
				key.classList.add('active');
				setTimeout(() => {
					key.classList.remove('active');
				}, 800);
			}, rowIndex * 50 + keyIndex * 30);
		});
	});
}

function animateF10() {
	clearActiveOnKeys();

	const keys = Array.from(allKeys);
	const keyDelay = 20;
	const duration = 1800;

	const centerX = window.innerWidth / 2;
	const centerY = window.innerHeight / 2;

	keys.sort((a, b) => {
		const aRect = a.getBoundingClientRect();
		const bRect = b.getBoundingClientRect();
		const aDistance = Math.hypot(
			centerX - (aRect.left + aRect.width / 2),
			centerY - (aRect.top + aRect.height / 2)
		);
		const bDistance = Math.hypot(
			centerX - (bRect.left + bRect.width / 2),
			centerY - (bRect.top + bRect.height / 2)
		);
		return aDistance - bDistance;
	});

	keys.forEach((key, index) => {
		setTimeout(() => {
			key.classList.add('key-color-cycle');
			setTimeout(() => {
				key.classList.remove('key-color-cycle');
			}, duration);
		}, index * keyDelay);
	});
}

function clearActiveOnKeys() {
	allKeys.forEach(el => {
		el.classList.remove('active', 'key-color-cycle');
		// Force DOM reflow to ensure clean animation state
		void el.offsetWidth;
	});
}

document.addEventListener('keyup', event => {
	const keyElement = document.querySelector(`.key[data-key="${event.code}"]`);
	if (keyElement && !keyElement.classList.contains('key-color-cycle')) {
		setTimeout(() => {
			keyElement.classList.remove('active');
		}, 150);
	}

	if (event.code === 'CapsLock') {
		if (!event.getModifierState('CapsLock')) {
			capsIndicator.classList.remove('active');
			letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
		}
	}

	if (event.key === 'Shift' && !event.getModifierState('CapsLock')) {
		letterKeys.forEach(el => (el.style.textTransform = 'lowercase'));
	}
});
