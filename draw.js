function draw() {
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#02030f");
    skyGradient.addColorStop(0.55, "#0a1130");
    skyGradient.addColorStop(1, "#1b2350");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let nowMs = performance.now();
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = 0.35 + (0.5 + 0.5 * Math.sin(nowMs * 0.0018 + star.phase)) * 0.65;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = moonGlowGradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3b3320";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fdf3c8";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(196, 178, 130, 0.55)";
    for (let i = 0; i < MOON_CRATERS.length; i++) {
        const [cx, cy, cr] = MOON_CRATERS[i];
        ctx.beginPath();
        ctx.arc(moonX + cx * moonR, moonY + cy * moonR, cr * moonR, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(moonX - moonR * 0.32, moonY - moonR * 0.32, moonR * 0.22, 0, Math.PI * 2);
    ctx.fill();

    let mountainFactor1 = 0.01, mX1 = camera.x * mountainFactor1;
    ctx.fillStyle = "#e2a3a3";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width + 20; x += 30) {
        let worldX = x + mX1;
        let y = groundY - 220 + Math.sin(worldX * 0.0003) * 210 + Math.sin(worldX * 0.001) * 70;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    let mountainFactor2 = 0.03, mX2 = camera.x * mountainFactor2;
    ctx.fillStyle = "#d79292";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width + 20; x += 25) {
        let worldX = x + mX2;
        let y = groundY - 140 + Math.sin(worldX * 0.0007) * 160 + Math.sin(worldX * 0.002) * 45;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    let p2Factor = 0.12, vX2 = camera.x * p2Factor;
    let colStep2 = 30;
    let startCol2 = Math.floor(vX2 / colStep2) - 1, endCol2 = Math.ceil((vX2 + canvas.width) / colStep2) + 1;
    for (let col = startCol2; col <= endCol2; col++) {
        let seed = Math.abs((col * 8463) ^ 93245);
        let rand = lcg(seed);
        if (rand() < 0.85) {
            let treeH = 220 + rand() * 200, treeW = 42 + rand() * 28;
            let worldX = col * colStep2 + rand() * 10, screenX = worldX - vX2;
            drawPineTreeSilhouette(ctx, screenX, groundY + 12, treeW, treeH, "#c38d97");
        }
    }

    let p3Factor = 0.30, vX3 = camera.x * p3Factor;
    let colStep3 = 45;
    let startCol3 = Math.floor(vX3 / colStep3) - 1, endCol3 = Math.ceil((vX3 + canvas.width) / colStep3) + 1;
    for (let col = startCol3; col <= endCol3; col++) {
        let seed = Math.abs((col * 11523) ^ 44321);
        let rand = lcg(seed);
        if (rand() < 0.90) {
            let treeH = 280 + rand() * 200, treeW = 58 + rand() * 36;
            let worldX = col * colStep3 + rand() * 15, screenX = worldX - vX3;
            drawPineTreeSilhouette(ctx, screenX, groundY + 18, treeW, treeH, "#8d4f64");
        }
    }

    let p4Factor = 0.55, vX4 = camera.x * p4Factor;
    ctx.fillStyle = "#162f0e";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width + 10; x += 15) {
        let worldX = x + vX4;
        let y = groundY + 14 + Math.sin(worldX * 0.006) * 15 + Math.sin(worldX * 0.015) * 5;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    let colStep4 = 140;
    let startCol4 = Math.floor(vX4 / colStep4) - 1, endCol4 = Math.ceil((vX4 + canvas.width) / colStep4) + 1;
    for (let col = startCol4; col <= endCol4; col++) {
        let seed = Math.abs((col * 17421) ^ 87612);
        let rand = lcg(seed);
        let worldX = col * colStep4 + rand() * 55, screenX = worldX - vX4;
        let hillY = groundY + 14 + Math.sin(worldX * 0.006) * 15 + Math.sin(worldX * 0.015) * 5;
        if (rand() < 0.70) {
            let treeH = 420 + rand() * 260, treeW = 110 + rand() * 60;
            drawDetailedRetroPineTree(ctx, screenX, hillY + 4, treeW, treeH);
        } else if (rand() < 0.92) {
            let bushSize = 18 + rand() * 16;
            drawDetailedRetroBush(ctx, screenX, hillY + 2, bushSize);
        }
    }

    const drawStartX = Math.max(camera.x - 40, Math.floor(camera.x / 8) * 8);
    const drawEndX = Math.min(camera.x + canvas.width + 40, Math.ceil((camera.x + canvas.width) / 8) * 8 + 16);
    const step = 8;

    ctx.save();
    ctx.translate(-camera.x, groundY);
    ctx.fillStyle = groundPattern;
    for (let x = drawStartX; x < drawEndX; x += step) {
        if (!isPit(x)) {
            ctx.fillRect(x, 0, step, canvas.height - groundY);
        }
    }
    ctx.restore();

    const chunkW = 120;
    const startChunk = Math.floor(camera.x / chunkW) - 1, endChunk = Math.floor((camera.x + canvas.width) / chunkW) + 1;
    for (let c = startChunk; c <= endChunk; c++) {
        const plantSeed = Math.abs((c * 12343) ^ 5551213);
        const plantRand = lcg(plantSeed);
        if (plantRand() < 0.42) {
            let relX = plantRand() * chunkW;
            let worldX = c * chunkW + relX;
            if (!isPit(worldX)) {
                let px = worldX - camera.x;
                let minPy = groundY + 25, maxPy = canvas.height - 35;
                let py = minPy + plantRand() * (maxPy - minPy);
                let sizeVal = plantRand();
                let tier = sizeVal < 0.35 ? 1 : sizeVal < 0.68 ? 2 : sizeVal < 0.90 ? 3 : 4;
                drawRetroPlant(ctx, px, py, tier, plantRand);
            }
        }
    }

    ctx.save();
    ctx.translate(-camera.x, 0);
    const grassColor = "rgba(58, 179, 32, 1)";
    const grassHighlight = "rgba(100, 220, 70, 1)";
    const grassShadow = "rgba(30, 110, 15, 1)";
    for (let x = drawStartX; x < drawEndX; x += step) {
        if (isPit(x)) continue;
        const wave = Math.sin(x * 0.08) * 3;
        const variance = (x % 24 === 0) ? 5 : ((x % 16 === 0) ? 2 : -1);
        const bladeHeight = 6 + Math.floor(wave + variance);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, groundY - bladeHeight - 2, step, bladeHeight + 2);
    }
    for (let x = drawStartX; x < drawEndX; x += step) {
        if (isPit(x)) continue;
        const wave = Math.sin(x * 0.08) * 3;
        const variance = (x % 24 === 0) ? 5 : ((x % 16 === 0) ? 2 : -1);
        const bladeHeight = 6 + Math.floor(wave + variance);
        ctx.fillStyle = grassColor;
        ctx.fillRect(x, groundY - bladeHeight, step, bladeHeight);
        ctx.fillStyle = grassHighlight;
        ctx.fillRect(x, groundY - bladeHeight, step, 2);
    }
    for (let x = drawStartX; x < drawEndX; x += step) {
        if (isPit(x)) continue;
        const angle = (x / 32) * Math.PI;
        const scallop = Math.abs(Math.sin(angle));
        const depth = 22 + Math.floor(scallop * 12);
        ctx.fillStyle = grassColor;
        ctx.fillRect(x, groundY, step, depth);
        if (x % 24 === 0) {
            ctx.fillStyle = grassHighlight;
            ctx.fillRect(x, groundY + 4 + (x % 16), 3, 6);
        }
        ctx.fillStyle = grassShadow;
        ctx.fillRect(x, groundY + depth - 4, step, 4);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, groundY + depth, step, 2);
    }
    ctx.restore();

    drawPlayer();

    const pitSegment = 1400;
    const pitStart = 850;
    const pitEnd = 1050;
    const pitWidth = pitEnd - pitStart;
    const waterBottom = canvas.height;
    const waterSurfaceY = groundY;
    const waterDepth = waterBottom - waterSurfaceY;
    const rippleCount = 8;
    const rippleW = Math.floor(pitWidth / rippleCount);
    const nowT = performance.now();

    const firstPitChunk = Math.floor((camera.x - canvas.width) / pitSegment) - 1;
    const lastPitChunk = Math.floor((camera.x + canvas.width * 2) / pitSegment) + 1;

    for (let chunk = firstPitChunk; chunk <= lastPitChunk; chunk++) {
        const pitWorldStart = chunk * pitSegment + pitStart;
        const pitWorldEnd = chunk * pitSegment + pitEnd;
        const screenPitX = pitWorldStart - camera.x;
        const screenPitW = pitWidth;

        if (screenPitX + screenPitW < 0 || screenPitX > canvas.width) continue;

        ctx.fillStyle = "#0a2a6e";
        ctx.fillRect(screenPitX, waterSurfaceY, screenPitW, waterDepth);

        ctx.fillStyle = "#0d3a8f";
        ctx.fillRect(screenPitX, waterSurfaceY, screenPitW, Math.floor(waterDepth * 0.3));

        ctx.fillStyle = "#0f4db5";
        ctx.fillRect(screenPitX, waterSurfaceY, screenPitW, Math.floor(waterDepth * 0.10));

        for (let r = 0; r < rippleCount; r++) {
            const phase = (r % 2 === 0) ? 0 : Math.PI;
            const bob = Math.sin(nowT * 0.0022 + phase + r * 0.7) * 1.5;
            const rx = screenPitX + r * rippleW;
            const ry = waterSurfaceY + bob;
            const rh = 6 + (r % 3);
            ctx.fillStyle = r % 2 === 0 ? "#1a6fe8" : "#155cc4";
            ctx.fillRect(rx, ry, rippleW - 1, rh);
        }

        ctx.fillStyle = "rgba(120,180,255,0.18)";
        for (let r = 0; r < rippleCount; r += 2) {
            const phase = (r % 4 === 0) ? 0.3 : -0.3;
            const bob = Math.sin(nowT * 0.0018 + phase + r) * 1.2;
            const rx = screenPitX + r * rippleW + 2;
            const ry = waterSurfaceY + bob + 2;
            ctx.fillRect(rx, ry, Math.floor(rippleW * 0.55), 3);
        }
    }

    for (let i = 0; i < fallingLeaves.length; i++) {
        const leaf = fallingLeaves[i];
        let drawX = leaf.anchorX + Math.sin(leafClock * leaf.swaySpeed + leaf.phase) * leaf.swayAmp;
        ctx.save();
        ctx.translate(drawX, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.sizeW / 2, leaf.sizeH / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#122401";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-leaf.sizeW / 2, 0);
        ctx.lineTo(leaf.sizeW / 2, 0);
        ctx.stroke();
        ctx.restore();
    }
}
