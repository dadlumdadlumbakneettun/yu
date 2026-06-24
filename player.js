const imgDuran = new Image();
const imgAdim1 = new Image();
const imgAdim2 = new Image();
imgDuran.src = "duran.png";
imgAdim1.src = "adım1.png";
imgAdim2.src = "adım2.png";

function drawPlayer() {
    let ballScreenX = ball.x - camera.x;
    const charW = ball.radius * 2 + 50;
    const charH = ball.radius * 2 + 50;
    let currentImg;
    if (!keys.a && !keys.d) {
        currentImg = imgDuran;
    } else {
        currentImg = (walkFrame === 0) ? imgAdim1 : imgAdim2;
    }
    ctx.save();
    if (facingLeft) {
        ctx.scale(-1, 1);
        ctx.drawImage(currentImg, -ballScreenX - charW / 2, ball.y - charH + 10, charW, charH);
    } else {
        ctx.drawImage(currentImg, ballScreenX - charW / 2, ball.y - charH + 10, charW, charH);
    }
    ctx.restore();
}
