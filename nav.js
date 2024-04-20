const navbar = document.getElementById('navbar_id');
const navContainer = document.getElementById('navbar_container');
const button = document.getElementById('dropdown_button');
const navlink1 = document.getElementById('tutorial_level');
const navlink2 = document.getElementById('gameplay_level');
const navlink3 = document.getElementById('jbeats_web');
const navlink4 = document.getElementById('jbeats_alternative');
const list = document.getElementById('dropdown_list');
let childList = button.children;

function dropdown() {
    childList[0].classList.toggle('rotateDown');
    childList[1].classList.toggle('gone');
    childList[2].classList.toggle('rotateUp');
    list.classList.toggle('open');
}

window.addEventListener('keydown', function(e) {
    if (e.key == 'Shift') {
        openLinks();
    }
});

function openLinks() {
    navbar.style.display = 'flex';
    navContainer.style.display = 'block';
    navlink1.style.display = 'flex';
    navlink2.style.display = 'flex';
    navlink3.style.display = 'flex';
    navlink4.style.display = 'flex';
}