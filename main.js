const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
    document.getElementById("touchControls").classList.remove("hidden");
}

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnJump = document.getElementById("btnJump");
btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); keys.a = true; });
btnLeft.addEventListener("touchend", () => { keys.a = false; });
btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); keys.d = true; });
btnRight.addEventListener("touchend", () => { keys.d = false; });
btnJump.addEventListener("touchstart", (e) => { e.preventDefault(); keys.w = true; });
btnJump.addEventListener("touchend", () => { keys.w = false; });

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    groundY = canvas.height * 0.72;
    if (ball.isGrounded) {
        ball.y = groundY - ball.radius;
    }
    createTileableGround();
    initStars();
    buildSkyVisuals();
    initFallingLeaves();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
ball.y = groundY - ball.radius;

let lastTime = performance.now();
let accumulator = 0.0;
const timestep = 1000 / 60;

function loop(timestamp) {
    let dt = timestamp - lastTime;
    if (dt > 100) dt = 100;
    lastTime = timestamp;
    accumulator += dt;
    while (accumulator >= timestep) {
        update();
        accumulator -= timestep;
    }
    draw();
    requestAnimationFrame(loop);
}

window.onload = function() {
    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        requestAnimationFrame(loop);
    });
};
