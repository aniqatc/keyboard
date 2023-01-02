// Initial Theme
document.querySelector('body').classList.add('theme-one');

// Change Themes on Click or Keydown
const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const themeButtons = document.querySelectorAll('.theme-key');
let themeKeyCode = [];
themeButtons.forEach(button =>
	themeKeyCode.push(button.getAttribute('data-key'))
);

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
		}
	}
});

document.addEventListener('keyup', () => {
	themeButtons.forEach(el => el.classList.remove('active'));
});
