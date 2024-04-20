ctx.canvas.width = Math.min(window.innerWidth, 1000);
ctx.canvas.height = 0;

// FPS
//> DeltaTime
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
//> FPS Measurement
let fpsTime = performance.now();
let frames = 0;
let trueFPS = fps;
let fpsDiffTime = 0;

// Physics
//> World
const gravity = new Vector(0, -9.81 / 64);
let worldLimit = -100;
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

// Level Specific
let outFocus = false;
let switchTime = 0;

window.addEventListener('blur', function(e) {
    outFocus = true;
    console.log(redBorder.moving);
});

window.addEventListener('mousemove', mouseMoveControls);

let mouseRange = 200;

let firstColour = false;

let softText = document.getElementById("soft_text");
let timeText = document.getElementById("time_text");
let finalText = document.getElementById("final_text");
let timeTopText = document.getElementById("time_top_text");

let timeToBottom = 0;
let timeToTop = 0;

let redHit = false;
let reachedTop = false;

function playerDeath() {
    movementList.splice(movementList.length - 1, 1);
    redBorder.moving = false;
    redHit = true;
    jbeats.linearVel = new Vector(0, 0);
    jbeats.angularVel = 0;
    jbeats.isGravityAffect = false;
    jbeats.moveTo(new Vector(ctx.canvas.width * 0.5, 300));
    redBorder.moveTo(new Vector(ctx.canvas.width * 0.5, 25));
}

// Initializing the World
// Levels
let level1 = new Level(2000);
levelList.push(level1);

let level2 = new Level(788);
levelList.push(level2);

let level3 = new Level(1000);
levelList.push(level3);

//> Level 1
let platform1 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform1.moveTo(new Vector(platform1.width * 0.5, 1060));
bodyList.push(platform1);
level1.add(platform1);

let platform2 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform2.moveTo(new Vector(ctx.canvas.width - platform2.width * 0.5, 1060));
bodyList.push(platform2);
level1.add(platform2);

let platform3 = Body.createBox(ctx.canvas.width * 0.3, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform3.moveTo(new Vector(ctx.canvas.width * 0.5, 910));
bodyList.push(platform3);
level1.add(platform3);

let platform4 = Body.createBox(ctx.canvas.width * 0.2, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform4.moveTo(new Vector(ctx.canvas.width * 0.25, 895));
platform4.rotate(0.05 * Math.PI);
bodyList.push(platform4);
level1.add(platform4);

let platform5 = Body.createBox(ctx.canvas.width * 0.2, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform5.moveTo(new Vector(ctx.canvas.width * 0.75, 895));
platform5.rotate(-0.05 * Math.PI);
bodyList.push(platform5);
level1.add(platform5);

let platform6 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform6.moveTo(new Vector(platform6.width * 0.5, 500));
bodyList.push(platform6);
level1.add(platform6);

let platform7 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform7.moveTo(new Vector(ctx.canvas.width - platform7.width * 0.5, 500));
bodyList.push(platform7);
level1.add(platform7);

let platform8 = Body.createBox(ctx.canvas.width * 0.2, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform8.moveTo(new Vector(platform4.pos.x, 550));
platform8.rotate(0.15 * Math.PI);
bodyList.push(platform8);
level1.add(platform8);

let platform9 = Body.createBox(ctx.canvas.width * 0.2, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform9.moveTo(new Vector(platform5.pos.x, 550));
platform9.rotate(-0.15 * Math.PI);
bodyList.push(platform9);
level1.add(platform9);

let platform10 = Body.createBox(ctx.canvas.width * 0.22, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform10.moveTo(new Vector(ctx.canvas.width * 0.25, 260));
bodyList.push(platform10);
level1.add(platform10);

let platform11 = Body.createBox(ctx.canvas.width * 0.36, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform11.moveTo(new Vector(platform11.width * 0.5, 10));
bodyList.push(platform11);
level1.add(platform11);

let wall1 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall1.moveTo(new Vector(ctx.canvas.width * 0.15, 790));
bodyList.push(wall1);
level1.add(wall1);

let wall2 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall2.moveTo(new Vector(ctx.canvas.width * 0.85, 790));
bodyList.push(wall2);
level1.add(wall2);

let wall3 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
wall3.moveTo(new Vector(ctx.canvas.width * 0.35, 790 - wall3.height));
bodyList.push(wall3);
level1.add(wall3);

let wall4 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
wall4.moveTo(new Vector(ctx.canvas.width * 0.65, 790 - wall4.height));
bodyList.push(wall4);
level1.add(wall4);

let wall5 = Body.createBox(20, 125, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall5.moveTo(new Vector(ctx.canvas.width * 0.5 + platform3.width * 0.5, 430));
bodyList.push(wall5);
level1.add(wall5);

let wall6 = Body.createBox(20, 125, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall6.moveTo(new Vector(wall5.pos.x, 80));
bodyList.push(wall6);
level1.add(wall6);

let movable1 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
movable1.moveTo(new Vector(ctx.canvas.width * 0.15, wall3.pos.y));
bodyList.push(movable1);
level1.add(movable1);

let movable2 = Body.createBox(20, 200, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
movable2.moveTo(new Vector(ctx.canvas.width * 0.85, wall4.pos.y));
bodyList.push(movable2);
level1.add(movable2);

let movable3 = Body.createBox(ctx.canvas.width * 0.28, 10, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
movable3.moveTo(new Vector(ctx.canvas.width * 0.5, 495));
bodyList.push(movable3);
level1.add(movable3);

let movable4 = Body.createBox(ctx.canvas.width * 0.28, 10, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
movable4.moveTo(new Vector(ctx.canvas.width * 0.5, 505));
bodyList.push(movable4);
level1.add(movable4);

let movable5 = Body.createBox(ctx.canvas.width * 0.28, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
movable5.moveTo(new Vector(ctx.canvas.width * 0.5, 10));
bodyList.push(movable5);
level1.add(movable5);

let blue = Body.createBox(30, 30, 2, 0.5, false, "hsl(225, 85%, 45%)", "hsl(0, 0%, 0%)", false);
blue.moveTo(new Vector(platform4.pos.x, platform4.pos.y + 50));
bodyList.push(blue);
level1.add(blue);

let blueTrigger = Body.createBox(ctx.canvas.width * 0.13, 10, 2, 0.5, true, "hsl(225, 85%, 45%)", "hsl(0, 0%, 0%)", true);
blueTrigger.moveTo(new Vector(blueTrigger.width * 0.5, 510));
blueTrigger.collisionTarget = "hsl(225, 85%, 45%)";
bodyList.push(blueTrigger);
level1.add(blueTrigger);

let red = Body.createBox(30, 30, 2, 0.5, false, "hsl(0, 85%, 45%)", "hsl(0, 0%, 0%)", false);
red.moveTo(new Vector(platform5.pos.x, platform5.pos.y + 50));
bodyList.push(red);
level1.add(red);

let redTrigger = Body.createBox(ctx.canvas.width * 0.13, 10, 2, 0.5, true, "hsl(0, 85%, 45%)", "hsl(0, 0%, 0%)", true);
redTrigger.moveTo(new Vector(ctx.canvas.width - redTrigger.width * 0.5, 510));
redTrigger.collisionTarget = "hsl(0, 85%, 45%)";
bodyList.push(redTrigger);
level1.add(redTrigger);

let green = Body.createBox(20, 150, 2, 0.5, true, "hsl(130, 85%, 45%)", "hsl(0, 0%, 0%)", true);
green.moveTo(new Vector(ctx.canvas.width * 0.3, 410));
green.createBreakaways(10, 8, true);
bodyList.push(green);
level1.add(green);

let greenTrigger = Body.createBox(ctx.canvas.width * 0.36, 20, 2, 0.5, true, "hsl(130, 85%, 45%)", "hsl(0, 0%, 0%)", false);
greenTrigger.moveTo(new Vector(ctx.canvas.width - greenTrigger.width * 0.5, 10));
greenTrigger.collisionTarget = "hsl(130, 85%, 45%)";
bodyList.push(greenTrigger);
level1.add(greenTrigger);

//> Level 2
let platform12 = Body.createBox(ctx.canvas.width * 0.64 - platform11.width * 0.5 + wall6.width * 2.5, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
platform12.moveTo(new Vector(platform12.width * 0.5 + platform11.width * 0.5 - wall6.width * 1.5, 488));
bodyList.push(platform12);
level2.add(platform12);

let platform13 = Body.createBox(ctx.canvas.width * 0.5 + 10, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
platform13.moveTo(new Vector(platform13.width * 0.5, 188));
bodyList.push(platform13);
level2.add(platform13);

let platform14 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
platform14.moveTo(new Vector(ctx.canvas.width * 0.5 + platform14.width * 0.5, 338));
bodyList.push(platform14);
level2.add(platform14);

let platform15 = Body.createBox(ctx.canvas.width * 0.15, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
platform15.moveTo(new Vector(ctx.canvas.width - platform15.width * 0.5, 10));
bodyList.push(platform15);
level2.add(platform15);

let platform16 = Body.createBox(ctx.canvas.width * 0.5 + 10, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
platform16.moveTo(new Vector(platform16.width * 0.5, 10));
bodyList.push(platform16);
level2.add(platform16);

let platform17 = Body.createBox(ctx.canvas.width * 0.5 + 10, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
platform17.moveTo(new Vector(platform17.width * 0.5, 88));
platform17.rotate(-0.1 * Math.PI);
bodyList.push(platform17);
level2.add(platform17);

let wall7 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall7.moveTo(new Vector(wall6.pos.x, 713));
bodyList.push(wall7);
level2.add(wall7);

let wall8 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall8.moveTo(new Vector(wall3.pos.x, 713));
bodyList.push(wall8);
level2.add(wall8);

let wall9 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall9.moveTo(new Vector(wall1.pos.x, 553));
bodyList.push(wall9);
level2.add(wall9);

let wall10 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall10.moveTo(new Vector(ctx.canvas.width * 0.5, 273));
bodyList.push(wall10);
level2.add(wall10);

let wall11 = Body.createBox(20, 320, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall11.moveTo(new Vector(wall2.pos.x, 488));
bodyList.push(wall11);
level2.add(wall11);

let wall12 = Body.createBox(20, 175, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall12.moveTo(new Vector(wall2.pos.x, 88));
bodyList.push(wall12);
level2.add(wall12);

let wall13 = Body.createBox(20, 175, 2, 0.5, true, "hsl(0, 0%, 80%)", null, false);
wall13.moveTo(new Vector(ctx.canvas.width * 0.5, 98));
bodyList.push(wall13);
level2.add(wall13);

for (let i = 0; i < 20; i++) {
    let ball = Body.createCircle(15, 2, 0.5, false, "hsl(0, 0%, 100%)", "hsl(0, 0%, 0%)");
    ball.moveTo(new Vector(ctx.canvas.width * 0.2 + Math.round(Math.random()), 188));
    bodyList.push(ball);
    level2.add(ball);
}

let breakable1 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
breakable1.moveTo(new Vector(wall6.pos.x, 573));
breakable1.createBreakaways(5, 8, true);
bodyList.push(breakable1);
level2.add(breakable1);

let breakable2 = Body.createBox(ctx.canvas.width * 0.3, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
breakable2.moveTo(new Vector(breakable2.width * 0.5, 338));
breakable2.createBreakaways(8, 8, true);
bodyList.push(breakable2);
level2.add(breakable2);

let breakable3 = Body.createBox(20, 130, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
breakable3.moveTo(new Vector(wall6.pos.x, 413));
breakable3.createBreakaways(5, 6, true);
bodyList.push(breakable3);
level2.add(breakable3);

let breakable4 = Body.createBox(ctx.canvas.width * 0.15 - 10, 20, 2, 0.5, true, "hsl(0, 0%, 80%)", "hsl(0, 0%, 0%)", false);
breakable4.moveTo(new Vector(ctx.canvas.width - breakable4.width * 0.5, breakable2.pos.y));
breakable4.createBreakaways(5, 8, true);
bodyList.push(breakable4);
level2.add(breakable4);

//> Level 3
let platform18 = Body.createBox(ctx.canvas.width * 0.35, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", "hsl(0, 0%, 0%)", false);
platform18.moveTo(new Vector(ctx.canvas.width * 0.5 + platform18.width * 0.5, 850));
platform18.collisionColour = true;
bodyList.push(platform18);
level3.add(platform18);

let platform19 = Body.createBox(ctx.canvas.width * 0.15, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", "hsl(0, 0%, 0%)", false);
platform19.moveTo(new Vector(ctx.canvas.width - platform19.width * 0.5, 675));
platform19.collisionColour = true;
bodyList.push(platform19);
level3.add(platform19);

let platform20 = Body.createBox(ctx.canvas.width * 0.45, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", "hsl(0, 0%, 0%)", false);
platform20.moveTo(new Vector(ctx.canvas.width - platform20.width * 0.5 - platform19.width, 675));
platform20.collisionColour = true;
bodyList.push(platform20);
level3.add(platform20);

let platform21 = Body.createBox(ctx.canvas.width * 0.25 + 10, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", "hsl(0, 0%, 0%)", false);
platform21.moveTo(new Vector(ctx.canvas.width - platform21.width * 0.5 - platform20.width - platform19.width, 675));
platform21.collisionColour = true;
bodyList.push(platform21);
level3.add(platform21);

let platform22 = Body.createBox(ctx.canvas.width * 0.36, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
platform22.moveTo(new Vector(platform22.width * 0.5, 450));
platform22.collisionColour = true;
bodyList.push(platform22);
level3.add(platform22);

let platform23 = Body.createBox(ctx.canvas.width * 0.36, 20, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
platform23.moveTo(new Vector(ctx.canvas.width - platform23.width * 0.5, 450));
platform23.collisionColour = true;
bodyList.push(platform23);
level3.add(platform23);

let wall14 = Body.createBox(20, 165, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall14.moveTo(new Vector(ctx.canvas.width * 0.5, 840 + wall14.height * 0.5));
wall14.collisionColour = true;
bodyList.push(wall14);
level3.add(wall14);

let wall15 = Body.createBox(20, 175, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall15.moveTo(new Vector(wall3.pos.x, 675 + wall15.height * 0.5));
wall15.collisionColour = true;
bodyList.push(wall15);
level3.add(wall15);

let wall16 = Body.createBox(20, 175, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall16.moveTo(new Vector(wall1.pos.x, 675 + wall16.height * 0.5));
wall16.collisionColour = true;
bodyList.push(wall16);
level3.add(wall16);

let wall17 = Body.createBox(20, 230, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall17.moveTo(new Vector(wall6.pos.x, 550));
wall17.collisionColour = true;
bodyList.push(wall17);
level3.add(wall17);

let wall18 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall18.moveTo(new Vector(wall3.pos.x, 385));
wall18.collisionColour = true;
bodyList.push(wall18);
level3.add(wall18);

let wall19 = Body.createBox(20, 150, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
wall19.moveTo(new Vector(wall6.pos.x, 385));
wall19.collisionColour = true;
bodyList.push(wall19);
level3.add(wall19);

let finalTrigger = Body.createBox(ctx.canvas.width, 20, 2, 0.5, true, "hsl(60, 85%, 45%)", "hsl(0, 0%, 0%)", false);
finalTrigger.moveTo(new Vector(ctx.canvas.width * 0.5, 150));
finalTrigger.collisionTarget = "hsl(50, 50%, 50%)";
bodyList.push(finalTrigger);
level3.add(finalTrigger);

let redBorder = Body.createBox(ctx.canvas.width, 100, 2, 0.5, true, "hsl(0, 70%, 45%)", "hsl(0, 0%, 0%)", true);
redBorder.moveTo(new Vector(ctx.canvas.width * 0.5, 25));
redBorder.collisionTarget = "hsl(50, 50%, 50%)";
bodyList.push(redBorder);
level3.add(redBorder);

for (let i = 0; i < levelList.length; i++) {
    let level = levelList[i];
    ctx.canvas.height = ctx.canvas.height + level.height;
}

let previousY = ctx.canvas.height;
for (let i = 0; i < levelList.length; i++) {
    let level = levelList[i];
    previousY = previousY - level.height;
    level.generate(previousY);
}

// JBeats / Player
let jbeats = Body.createCircle(40, 2, 0.5, false, "hsl(0, 0%, 100%)", null);
jbeats.moveTo(new Vector(ctx.canvas.width * 0.5, ctx.canvas.height + 200));
jbeats.isPlayer = true;
jbeats.sprite = img;
bodyList.push(jbeats);

// World Borders
let edge1 = Body.createBox(0.1, ctx.canvas.height + 200, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge1.moveTo(new Vector(0, ctx.canvas.height * 0.5 + 100));
edge1.collisionColour = true;
edge1.isDrawable = true;
bodyList.push(edge1);

let edge2 = Body.createBox(ctx.canvas.width, 0.1, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge2.moveTo(new Vector(ctx.canvas.width * 0.5, ctx.canvas.height + 200));
edge2.collisionColour = true;
edge2.isDrawable = true;
bodyList.push(edge2);

let edge3 = Body.createBox(0.1, ctx.canvas.height + 200, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge3.moveTo(new Vector(ctx.canvas.width, ctx.canvas.height * 0.5 + 100));
edge3.collisionColour = true;
edge3.isDrawable = true;
bodyList.push(edge3);

let edge4 = Body.createBox(ctx.canvas.width, 0.1, 2, 0.5, true, "hsl(0, 0%, 0%)", null, false);
edge4.moveTo(new Vector(ctx.canvas.width * 0.5, 0));
edge4.collisionColour = true;
edge4.isDrawable = true;
bodyList.push(edge4);

let testTime = performance.now();

function update() {
    window.requestAnimationFrame(update);

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

    let mouseDist = VectorMath.distance(mousePos, jbeats.pos);
    if (mouseDist <= mouseRange) {
        let forceDir = VectorMath.normalize(jbeats.pos.sub(mousePos));
        let force = forceDir.multi((((mouseDist / -mouseRange) + 1) * mouseRange) * 500);

        jbeats.addForce(force);
        if (redHit) {
            jbeats.isGravityAffect = true;
            movementList.push([redBorder, new Vector(redBorder.pos.x, ctx.canvas.height), 35]);
            timeToTop = performance.now();
        }
        redHit = false;
    }

    if (blueTrigger.collidedWithTarget) {
        if (!firstColour) {
            firstColour = true;
            blueTrigger.collisionTarget = null;
            movementList.push([movable1, new Vector(movable1.pos.x, movable1.pos.y + movable1.height * 2), 0.5]);
            movementList.push([movable2, new Vector(movable2.pos.x, movable2.pos.y + movable2.height), 0.5]);
            movementList.push([movable3, new Vector(movable3.pos.x + movable3.width, movable3.pos.y), 1]);
        } else {
            blueTrigger.collisionTarget = null;
            movementList.push([movable3, new Vector(movable3.pos.x + movable3.width, movable3.pos.y), 1]);
        }
    }
    if (redTrigger.collidedWithTarget) {
        if (!firstColour) {
            firstColour = true;
            redTrigger.collisionTarget = null;
            movementList.push([movable2, new Vector(movable2.pos.x, movable2.pos.y + movable2.height * 2), 0.5]);
            movementList.push([movable1, new Vector(movable1.pos.x, movable1.pos.y + movable1.height), 0.5]);
            movementList.push([movable4, new Vector(movable4.pos.x + movable4.width, movable4.pos.y), 1]);
        } else {
            redTrigger.collisionTarget = null;
            movementList.push([movable4, new Vector(movable4.pos.x + movable4.width, movable4.pos.y), 1]);
        }
    }
    if (greenTrigger.collidedWithTarget) {
        greenTrigger.collisionTarget = null;
        movementList.push([movable5, new Vector(movable5.pos.x - movable5.width, movable5.pos.y), 0.5]);
    }
    if (finalTrigger.collidedWithTarget) {
        finalTrigger.collisionTarget = null;
        timeToBottom = Math.round(performance.now() * 0.001 * 1000) / 1000;
        timeText.innerHTML = "Time taken: " + timeToBottom.toString() + " seconds";
        softText.innerHTML = "Mission: Reach the TOP<br><br>Reload the page if you do get stuck<br>It's all Trial and Error"
        timeToTop = performance.now();
        finalText.style.opacity = '1';
        movementList.push([redBorder, new Vector(redBorder.pos.x, ctx.canvas.height), 35]);
        movementList.push([wall13, new Vector(wall13.pos.x, wall13.pos.y - wall13.height), 0.25]);
    }
    if (redBorder.collidedWithTarget) {
        if (!reachedTop) {
            playerDeath();
        }
    }
    if (redBorder.moving && outFocus) {
        if (!reachedTop) {
            outFocus = false;
            playerDeath();
        }
    }
    if (redBorder.moving && jbeats.pos.y >= ctx.canvas.height) {
        if (!reachedTop) {
            reachedTop = true;
            navlink3.style.display = 'flex';
            timeTopText.innerHTML = "Time taken to reach Top: " + (Math.round((performance.now() - timeToTop) * 0.001 * 1000) / 1000).toString() + " seconds<br>Time taken to reach Bottom: " + timeToBottom.toString() + " seconds";
        }
    }

    for (let i = 0; i < movementList.length; i++) {
        let mover = movementList[i];
        mover[0].moveTo(mover[1], performance.now(), mover[2]);
        if (mover[0].moving == false) {
            movementList.splice(i, 1);
        }
    }

    for (let i = 0; i < bodyList.length; i++) {
        let body = bodyList[i];
        if (body.isDrawable) { body.drawBody(); }

        if (body.isStatic) {
            continue;
        }

        let box = body.getAABB();

        if (box.max.y < worldLimit) {
            bodyList.splice(i, 1);
        }
    }

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

if (ctx.canvas.width > 800) {
    update();
}