// Initial Theme
document.querySelector('body').classList.add('theme-one');

const themes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

const themeButtons = document.querySelectorAll('.theme-key');
for (let j = 0; j < themeButtons.length; j++) {
	themeButtons[j].addEventListener('click', () => {
		for (let i = 0; i < themeButtons.length; i++) {
			document.body.classList.remove(`theme-${themes[i]}`);
			document.body.classList.add(`theme-${themes[j]}`);
		}
	});
}
