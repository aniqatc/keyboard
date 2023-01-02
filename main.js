let keys = document.querySelectorAll('.key');
let container = document.querySelector('.keyboard-container');
let textarea = document.querySelector('textarea');
let button = document.querySelectorAll('button');

keys.forEach(el => el.classList.add('theme-three'));
container.classList.add('theme-three');
textarea.classList.add('theme-three');
document.querySelector('body').classList.add('dark-two');
button.forEach(el => el.classList.add('theme-three'));
