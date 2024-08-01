// This JavaScript file consist of the function that acts as the trigger to start the physics engine for the tutorial

let start = false; // The variable used to check whether the mouse gets too close to the JBeats logo

// Makes the white circle after clicking on the start button to expand
// and cover the screen as a transition to the tutorial
function expansion() {
    const circle = document.getElementById('circle');
    circle.classList.add('expansion_circle');

    // Listening to when the transition stops to start the physics engine
    circle.addEventListener('animationend', function() {
        const startCover = document.getElementById('start');
        startCover.classList.add('transition_anim');
        start = true;
        window.addEventListener('mousemove', mouseMoveControls);
    });
}