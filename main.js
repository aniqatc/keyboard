// Allow Touchstart Events (Mobile)
document.addEventListener('touchstart', function () {}, true);

// Add Toast Notification
function renderToast() {
	const notif = document.createElement('div');
	notif.classList.add('toast');
	notif.innerHTML = `Click <code>Escape</code> for info!`;
	toasts.appendChild(notif);

	setTimeout(() => {
		notif.remove();
	}, 4000);
}

// Render Toast Notifcation
renderToast();

// Initial Theme from Local Storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
	document.body.classList.add(`theme-${savedTheme}`);
}

// Previously Saved Text from Local Storage
const textarea = document.querySelector('textarea');
const savedText = localStorage.getItem('note');
if (savedText) {
	textarea.value = `${savedText}`;
}

// Textarea Button Functionality
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
	let textValue = textarea.value;
	let htmlValue = textPreview.innerHTML;
	if (textValue || htmlValue) {
		navigator.clipboard.writeText(textValue);
		textarea.value = 'Copied! ✔︎';
		setTimeout(() => (textarea.value = textValue), 600);
		textPreview.innerHTML = 'Copied! ✔︎';
		setTimeout(() => (textPreview.innerHTML = htmlValue), 600);
	} else {
		textarea.value = `Type Something! 📝`;
		setTimeout(() => (textarea.value = ''), 600);
		textPreview.innerHTML = `Type Something! 📝`;
		setTimeout(() => (textPreview.innerHTML = ''), 600);
	}
});

saveButton.addEventListener('click', () => {
	let textValue = textarea.value;
	textarea.value = 'Saved! ✔︎';
	setTimeout(() => (textarea.value = textValue), 600);
	let htmlValue = textPreview.innerHTML;
	textPreview.innerHTML = 'Saved! ✔';
	setTimeout(() => (textPreview.innerHTML = htmlValue), 600);
	localStorage.setItem('note', `${textValue}`);
});

previewButton.addEventListener('click', () => {
	const markdown = marked(textarea.value);
	textPreview.innerHTML = markdown;
	previewLabel.style.display = 'block';
	textPreview.style.display = 'block';
	textarea.style.display = 'none';
});

editButton.addEventListener('click', () => {
	previewLabel.style.display = 'none';
	textPreview.style.display = 'none';
	textarea.style.display = 'block';
});

// CLICK AND KEYPRESS EVENTS
// Theme Declarations
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');
let themeKeyCode = [];
themeButtons.forEach(button =>
	themeKeyCode.push(button.getAttribute('data-key'))
);

// KEY DECLARATIONS
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
		textarea.blur();
		// Add Active Class
		key.classList.add('active');
		// Add Click Sound
		clickAudio.play();
		// Remove Class After 4s If It's Not Part of The Animation
		setTimeout(() => {
			if (!key.classList.contains('key-color-cycle')) {
				key.classList.remove('active');
			}
		}, 1500);
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

// Shuffle Theme Button (Click Only)
document.getElementById('shuffle').addEventListener('click', () => {
	for (let i = 0; i < themes.length; i++) {
		document.body.classList.remove(`theme-${themes[i]}`);
	}
	const randomTheme = themes[Math.floor(Math.random() * themes.length)];
	document.body.classList.add(`theme-${randomTheme}`);
	localStorage.setItem('theme', randomTheme);
});

// Keydown Events
document.addEventListener('keydown', event => {
	// Change Theme
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
		// Handle CapsLock
		if (event.code === 'CapsLock' && event.getModifierState('CapsLock')) {
			capsIndicator.classList.add('active');
			letterKeys.forEach(el => (el.style.textTransform = 'uppercase'));
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
		animateF9();
	}

	// F10 Animation
	if (event.key === 'F10') {
		animateF10();
	}
});

// Animations for F9 and F10
function animateF9() {
	allKeys.forEach(el => el.classList.remove('key-color-cycle', 'active'));
	const rowOne = document.querySelectorAll('.row-one .key');
	for (let i = 0; i < rowOne.length; i++) {
		setTimeout(() => {
			rowOne[i].classList.add('active');
			setTimeout(() => {
				rowOne[i].classList.remove('active');
			}, 500);
		}, 100);
	}
	const rowTwo = document.querySelectorAll('.row-two .key');
	for (let i = 0; i < rowTwo.length; i++) {
		setTimeout(() => {
			rowTwo[i].classList.add('active');
			setTimeout(() => {
				rowTwo[i].classList.remove('active');
			}, 1000);
		}, 500);
	}
	const rowThree = document.querySelectorAll('.row-three .key');
	for (let i = 0; i < rowThree.length; i++) {
		setTimeout(() => {
			rowThree[i].classList.add('active');
			setTimeout(() => {
				rowThree[i].classList.remove('active');
			}, 1500);
		}, 900);
	}
	const rowFour = document.querySelectorAll('.row-four .key');
	for (let i = 0; i < rowFour.length; i++) {
		setTimeout(() => {
			rowFour[i].classList.add('active');
			setTimeout(() => {
				rowFour[i].classList.remove('active');
			}, 2000);
		}, 1300);
	}
	const rowFive = document.querySelectorAll('.row-five .key');
	for (let i = 0; i < rowFive.length; i++) {
		setTimeout(() => {
			rowFive[i].classList.add('active');
			setTimeout(() => {
				rowFive[i].classList.remove('active');
			}, 2500);
		}, 1700);
	}
	const rowSix = document.querySelectorAll('.row-six .key');
	for (let i = 0; i < rowSix.length; i++) {
		setTimeout(() => {
			rowSix[i].classList.add('active');
			setTimeout(() => {
				rowSix[i].classList.remove('active');
			}, 3000);
		}, 2100);
	}
}

function animateF10() {
	allKeys.forEach(el => el.classList.remove('active', 'key-color-cycle'));
	for (let i = 0; i < allKeys.length; i++) {
		setTimeout(() => {
			allKeys[i].classList.add('active', 'key-color-cycle');
		}, 50 * i);
	}
	setTimeout(() => {
		for (let i = 0; i < allKeys.length; i++) {
			setTimeout(() => {
				allKeys[i].classList.remove('active', 'key-color-cycle');
			}, 50 * i);
		}
	}, 3000);
}

// Remove Active Classes on Keyup Events
document.addEventListener('keyup', event => {
	setTimeout(() => {
		allKeys.forEach(el => {
			if (!el.classList.contains('key-color-cycle')) {
				el.classList.remove('active');
			}
		});
	}, 1500);

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
	modal.classList.remove('hidden');
	overlay.classList.remove('hidden');
}

openModalButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
