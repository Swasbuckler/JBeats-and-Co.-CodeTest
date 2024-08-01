// This JavaScript file consist of the variables, objects and update loop for the tutorial

ctx.canvas.width = Math.min(window.innerWidth, 1000); // Maximum width of the game is 1000 pixels
ctx.canvas.height = 0; // Sets game height to 0. Will extend by adding objects

// FPS
//> DeltaTime : Variables to make the game not reliant on FPS. Sets game speed to 60 FPS
const fps = 60;
const interval = Math.floor(1000 / fps);
class Time
{
    static unscaledTime = 0;
    static unscaledDeltaTime = 0;
    static timeScale = 1;
    static time = 0;
    static deltaTime = 0;
    static maximumDeltaTime = interval * 10;
    static deltaTimeMulti = 0;
}
//> FPS Measurement : To measure FPS which can be seen in the web browser's console
let fpsTime = performance.now();
let frames = 0;
let trueFPS = fps;
let fpsDiffTime = 0;

// Physics
//> World
const gravity = new Vector(0, -9.81 / 64); // The gravity of the game
let worldLimit = -100; // The world border being 100 pixels below the game
//> Physics Lists
let shapeList = {'Circle': 0, 'Box': 1};
let bodyList = [];
let breakawayList = [];
let contactPairs = [];
let movementList = [];
let levelList = [];
let contactL = [new Vector(0, 0), new Vector(0, 0)];
let impulseL = [new Vector(0, 0), new Vector(0, 0)];
let raL = [new Vector(0, 0), new Vector(0, 0)];
let rbL = [new Vector(0, 0), new Vector(0, 0)];
let frictionImpulseL = [new Vector(0, 0), new Vector(0, 0)];
let jL = [0, 0];
//> Physics Measurement
let totalWorldStepTime = 0;
let totalBodyCount = 0;
let totalSampleCount = 0;
//> Gameplay
let mousePos = new Vector(0, 0);
let img = document.getElementById("logo");

const logoLink = document.getElementById('logo_link');

// Level Specific
let firstHit = false;
let mouseRange = 120;

let podium = document.getElementById("podium");

let tutText1 = document.getElementById("ballmove");
let tutText2 = document.getElementById("triggers");
let tutText3 = document.getElementById("smash");

tutText2.style.top = `${parseFloat(window.getComputedStyle(tutText1).getPropertyValue('top')) - 150}px`;
tutText3.style.top = `${parseFloat(window.getComputedStyle(tutText1).getPropertyValue('top')) + 300}px`;

// Initializing the World : Creating all of the objects that is seen in the tutorial
// JBeats Logo / Player
let jbeats = Body.createCircle(40, 2, 0.5, false, "hsl(0, 0%, 100%)", null);
jbeats.moveTo(new Vector(ctx.canvas.width * 0.5, (window.innerHeight * 0.4 + 100) + 500));
jbeats.isGravityAffect = false;
jbeats.isPlayer = true;
jbeats.sprite = img;
bodyList.push(jbeats);

// Levels
//> Tutorial
let tutorial = new Level(window.innerHeight + 500);
levelList.push(tutorial);

//>> Obstacles
let roof = Body.createBox(ctx.canvas.width, 10, 1, 0.5, true, "hsl(0, 0%, 0%)", "hsl(0, 0%, 0%)", false);
roof.moveTo(new Vector(jbeats.pos.x, jbeats.pos.y + 100));
roof.collisionColour = true;
bodyList.push(roof);
tutorial.add(roof);

let movingTut = Body.createBox(ctx.canvas.width * 0.4, 20, 1, 0.5, true, "hsl(0, 0%, 50%)", "hsl(0, 0%, 0%)", false);
movingTut.moveTo(new Vector(jbeats.pos.x, jbeats.pos.y - 300));
bodyList.push(movingTut);
tutorial.add(movingTut);

let leftBlock = Body.createBox(ctx.canvas.width * 0.2, 300, 1, 0.5, true, "hsl(0, 0%, 50%)", "hsl(0, 0%, 0%)", false);
leftBlock.moveTo(new Vector(jbeats.pos.x - movingTut.width * 0.5 - leftBlock.width * 0.5, movingTut.pos.y - movingTut.height * 0.5 + leftBlock.height * 0.5));
bodyList.push(leftBlock);
tutorial.add(leftBlock);

let blue = Body.createBox(30, 30, 1, 0.5, false, "hsl(225, 85%, 45%)", "hsl(0, 0%, 0%)", false);
blue.moveTo(new Vector(leftBlock.pos.x, jbeats.pos.y - 20));
bodyList.push(blue);
tutorial.add(blue);

let triggerBlue = Body.createBox(ctx.canvas.width * 0.1, 10, 1, 0.5, true, "hsl(225, 85%, 45%)", "hsl(0, 0%, 0%)", true);
triggerBlue.moveTo(new Vector(jbeats.pos.x - (ctx.canvas.width * 0.5 - triggerBlue.width * 0.5), jbeats.pos.y - 290));
triggerBlue.collisionTarget = "hsl(225, 85%, 45%)";
bodyList.push(triggerBlue);
tutorial.add(triggerBlue);

let triggerBlueBase = Body.createBox(ctx.canvas.width * 0.1, 20, 1, 0.5, true, "hsl(0, 0%, 50%)", "hsl(0, 0%, 0%)", false);
triggerBlueBase.moveTo(new Vector(triggerBlue.pos.x, movingTut.pos.y));
bodyList.push(triggerBlueBase);
tutorial.add(triggerBlueBase);

let rightBlock = Body.createBox(ctx.canvas.width * 0.2, 300, 1, 0.5, true, "hsl(0, 0%, 50%)", "hsl(0, 0%, 0%)", false);
rightBlock.moveTo(new Vector(jbeats.pos.x + movingTut.width * 0.5 + leftBlock.width * 0.5, movingTut.pos.y - movingTut.height * 0.5 + leftBlock.height * 0.5));
bodyList.push(rightBlock);
tutorial.add(rightBlock);

let red = Body.createBox(30, 30, 1, 0.5, false, "hsl(0, 85%, 45%)", "hsl(0, 0%, 0%)", false);
red.moveTo(new Vector(rightBlock.pos.x, jbeats.pos.y - 20));
bodyList.push(red);
tutorial.add(red);

let triggerRed = Body.createBox(ctx.canvas.width * 0.1, 10, 1, 0.5, true, "hsl(0, 85%, 45%)", "hsl(0, 0%, 0%)", true);
triggerRed.moveTo(new Vector(jbeats.pos.x + (ctx.canvas.width * 0.5 - triggerRed.width * 0.5), jbeats.pos.y - 290));
triggerRed.collisionTarget = "hsl(0, 85%, 45%)";
bodyList.push(triggerRed);
tutorial.add(triggerRed);

let triggerRedBase = Body.createBox(ctx.canvas.width * 0.1, 20, 1, 0.5, true, "hsl(0, 0%, 50%)", "hsl(0, 0%, 0%)", false);
triggerRedBase.moveTo(new Vector(triggerRed.pos.x, movingTut.pos.y));
bodyList.push(triggerRedBase);
tutorial.add(triggerRedBase);

let breakThis = Body.createBox(ctx.canvas.width, 10, 2, 0.5, true, "hsl(0, 0%, 90%)", null, true);
breakThis.moveTo(new Vector(jbeats.pos.x, jbeats.pos.y - 500));
breakThis.createBreakaways(20, 15, false);
breakThis.collisionTarget = "hsl(50, 50%, 50%)";
bodyList.push(breakThis);
tutorial.add(breakThis);

// Adds level objects that extends the height with their own heights
for (let i = 0; i < levelList.length; i++) {
    let level = levelList[i];
    ctx.canvas.height = ctx.canvas.height + level.height;
}

// Moves objects to be relative to their respective level. 
// Was done as the objects was orginally relative to the player and since the height has increased they have to move accordingly
let previousY = ctx.canvas.height;
for (let i = 0; i < levelList.length; i++) {
    let level = levelList[i];
    previousY = previousY - level.height;
    level.generate(previousY);
}

// World Borders
let edge1 = Body.createBox(0.1, ctx.canvas.height, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge1.moveTo(new Vector(0, ctx.canvas.height * 0.5));
edge1.collisionColour = true;
edge1.isDrawable = true;
bodyList.push(edge1);

let edge2 = Body.createBox(ctx.canvas.width, 0.1, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge2.moveTo(new Vector(ctx.canvas.width * 0.5, ctx.canvas.height));
edge2.collisionColour = true;
edge2.isDrawable = true;
bodyList.push(edge2);

let edge3 = Body.createBox(0.1, ctx.canvas.height, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge3.moveTo(new Vector(ctx.canvas.width, ctx.canvas.height * 0.5));
edge3.collisionColour = true;
edge3.isDrawable = true;
bodyList.push(edge3);

let testTime = performance.now();

// Update Loop
function update() {
    window.requestAnimationFrame(update);

    if (!start) { // Only runs the rest of the loop once the mouse goes too close to the player
        return;
    }

    Time.unscaledDeltaTime = performance.now() - Time.unscaledTime;
    Time.unscaledTime += Time.unscaledDeltaTime;

    let deltaT = Time.unscaledDeltaTime;

    if (deltaT > Time.maximumDeltaTime) { deltaT = Time.maximumDeltaTime; }
        
    Time.deltaTime = deltaT * Time.timeScale;
    Time.deltaTimeMulti = Time.deltaTime / interval;
    Time.time += Time.deltaTime;
        
    frames++;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let startStep = performance.now();
    step(Time.deltaTimeMulti, 20, performance.now());
    let endStep = performance.now() - startStep;

    totalWorldStepTime += endStep;
    totalBodyCount += bodyList.length;
    totalSampleCount++;

    // Calculates how far the mouse is from the player and adds force accordingly
    let mouseDist = VectorMath.distance(mousePos, jbeats.pos);
    if (mouseDist <= mouseRange) {
        let forceDir = VectorMath.normalize(jbeats.pos.sub(mousePos));
        let force = forceDir.multi((((mouseDist / -mouseRange) + 1) * mouseRange) * 500);

        jbeats.addForce(force);

        // Triggers when the mouse gets too close to the JBeats on the podium
        if (!firstHit) {
            mouseRange = 200;
            jbeats.isGravityAffect = true;
            img.style.visibility = 'hidden';
            tutText1.style.visibility = 'visible';
            tutText2.style.visibility = 'visible';
            podium.classList.add('go_invisible');
            bodyDoc.style.overflowY = 'auto';
        }
        firstHit = true;
    }

    // Below consists of collision trigger logic
    if (triggerBlue.collidedWithTarget && triggerRed.collidedWithTarget) {
        movementList.push([movingTut, new Vector(movingTut.pos.x + movingTut.width, movingTut.pos.y), 1]);
        triggerBlue.collisionTarget = null;
        triggerRed.collisionTarget = null;
    }

    for (let i = 0; i < movementList.length; i++) {
        let mover = movementList[i];
        mover[0].moveTo(mover[1], performance.now(), mover[2]);
        if (mover[0].moving == false) {
            movementList.splice(i, 1);
            tutText3.style.visibility = 'visible';
        }
    }

    if (breakThis.isBreakaway == false) {
        navbar.style.display = 'flex'
    }

    for (let i = 0; i < bodyList.length; i++) {
        let body = bodyList[i];
        // Draws the objects in the game on screen. To make the objects visible
        if (body.isDrawable) { body.drawBody(); }

        if (body.isStatic) {
            continue;
        }

        let box = body.getAABB();

        // If the objects goes lower than the world limit, they are deleted
        if (box.max.y < worldLimit) {
            bodyList.splice(i, 1);
        }
    }

    // Calculates the FPS of the user's game and puts the results on the console
    if (performance.now() > fpsTime + 1000) {
        console.log("FPS:", frames);
        console.log("Step Time:", Math.round((totalWorldStepTime / totalSampleCount) * 10000) / 10000);
        console.log("Body Count:", Math.round((totalBodyCount / totalSampleCount) * 10000) / 10000);
        
        fpsTime = performance.now();
        trueFPS = frames;
        frames = 0;
        totalWorldStepTime = 0;
        totalBodyCount = 0;
        totalSampleCount = 0;
    }
}

// If the width of the window is lower than 800 pixels the game is playable, if not ie. on a mobile device then the game is not playable
if (ctx.canvas.width > 800) {
    logoLink.href = "";
    update();
}