const gravity = 0.6;

const ball = {
    x: 100,
    y: window.innerHeight / 2,
    radius: 18,
    vx: 0,
    vy: 0,
    speed: 6.5,
    jumpForce: 13.5,
    isGrounded: false
};

const camera = { x: 0 };
const keys = { a: false, d: false, w: false, space: false };

let walkFrame = 0;
let walkClock = 0;
const walkFrameSpeed = 8;
let facingLeft = false;

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "a" || e.key === "ArrowLeft") keys.a = true;
    if (key === "d" || e.key === "ArrowRight") keys.d = true;
    if (key === "w" || e.key === "ArrowUp") keys.w = true;
    if (e.key === " ") keys.space = true;
});
window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === "a" || e.key === "ArrowLeft") keys.a = false;
    if (key === "d" || e.key === "ArrowRight") keys.d = false;
    if (key === "w" || e.key === "ArrowUp") keys.w = false;
    if (e.key === " ") keys.space = false;
});

function update() {
    if (keys.a) {
        ball.vx = -ball.speed;
        facingLeft = true;
    } else if (keys.d) {
        ball.vx = ball.speed;
        facingLeft = false;
    } else ball.vx = 0;

    if ((keys.a || keys.d) && ball.isGrounded) {
        walkClock++;
        if (walkClock >= walkFrameSpeed) {
            walkClock = 0;
            walkFrame = 1 - walkFrame;
        }
    } else {
        walkFrame = 0;
        walkClock = 0;
    }

    ball.vy += gravity;

    if ((keys.w || keys.space) && ball.isGrounded) {
        ball.vy = -ball.jumpForce;
        ball.isGrounded = false;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y + ball.radius >= groundY) {
        if (!isPit(ball.x)) {
            ball.y = groundY - ball.radius;
            ball.vy = 0;
            ball.isGrounded = true;
        }
    }

    if (ball.x - ball.radius < 0) ball.x = ball.radius;

    if (ball.x > canvas.width / 2) {
        camera.x = ball.x - canvas.width / 2;
    } else {
        camera.x = 0;
    }

    if (ball.y > canvas.height + 150) {
        ball.x = 100;
        ball.y = groundY - ball.radius;
        ball.vx = 0;
        ball.vy = 0;
        ball.isGrounded = true;
    }

    leafClock += 1;
    for (let i = 0; i < fallingLeaves.length; i++) {
        const leaf = fallingLeaves[i];
        leaf.y += leaf.speed;
        leaf.rotation += leaf.rotSpeed;
        if (leaf.y > canvas.height + 30) {
            leaf.y = -30 - Math.random() * 60;
            leaf.anchorX = Math.random() * canvas.width;
        }
    }
}
