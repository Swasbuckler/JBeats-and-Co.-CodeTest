let start = false;

function expansion() {
    const circle = document.getElementById('circle');
    circle.classList.add('expansion_circle');
    circle.addEventListener('animationend', function() {
        const startCover = document.getElementById('start');
        startCover.classList.add('transition_anim');
        start = true;
        window.addEventListener('mousemove', mouseMoveControls);
    });
}