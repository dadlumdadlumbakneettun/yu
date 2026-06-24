const meterUnit = 200;
let groundY = window.innerHeight * 0.72;
let groundPattern = null;
let stars = [];
let moonX = 0, moonY = 0, moonR = 40;
let moonGlowGradient = null;
const MOON_CRATERS = [[-0.35, -0.25, 0.22], [0.25, 0.05, 0.16], [-0.05, 0.35, 0.13], [0.4, -0.35, 0.10]];
let fallingLeaves = [];
let leafClock = 0;

function lcg(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

function initStars() {
    stars = [];
    const starCount = Math.floor((canvas.width * canvas.height) / 9000) + 40;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * Math.max(40, groundY - 60),
            size: 0.7 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function buildSkyVisuals() {
    moonX = canvas.width * 0.78;
    moonY = canvas.height * 0.20;
    moonR = Math.max(34, Math.min(60, canvas.height * 0.07));
    moonGlowGradient = ctx.createRadialGradient(moonX, moonY, moonR * 0.6, moonX, moonY, moonR * 2.6);
    moonGlowGradient.addColorStop(0, "rgba(255, 250, 214, 0.30)");
    moonGlowGradient.addColorStop(1, "rgba(255, 250, 214, 0)");
}

function createFallingLeaf(spreadFull) {
    const leafColors = ["#155c02", "#2ebd07", "#174609", "#3b8517"];
    return {
        anchorX: Math.random() * canvas.width,
        y: spreadFull ? (Math.random() * (canvas.height + 200) - 200) : (-30 - Math.random() * 80),
        speed: 0.55 + Math.random() * 0.85,
        sizeW: 10 + Math.random() * 7,
        sizeH: 6 + Math.random() * 4,
        swayAmp: 16 + Math.random() * 22,
        swaySpeed: 0.025 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.045,
        rotation: Math.random() * Math.PI * 2,
        color: leafColors[Math.floor(Math.random() * leafColors.length)]
    };
}

function initFallingLeaves() {
    fallingLeaves = [];
    for (let i = 0; i < 24; i++) {
        fallingLeaves.push(createFallingLeaf(true));
    }
}

function createTileableGround() {
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = meterUnit;
    const groundHeight = Math.max(100, canvas.height - groundY);
    tileCanvas.height = groundHeight;
    const tCtx = tileCanvas.getContext('2d');
    tCtx.imageSmoothingEnabled = false;
    tCtx.fillStyle = "#1c0f01";
    tCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
    const rockColors = ["#80561d", "#996c2d", "#6a4411", "#a67733", "#8c5f21"];
    const rockHighlights = ["#be954a", "#cca256", "#ab813a", "#cca256", "#be954a"];
    const rockShadows = ["#402604", "#4c2c04", "#381e02", "#523205", "#442804"];
    const cols = 5;
    const cellW = tileCanvas.width / cols;
    const cellH = 34;
    const rows = Math.ceil(tileCanvas.height / cellH);
    const rocks = [];
    const rand = lcg(42);
    for (let r = -1; r <= rows + 1; r++) {
        for (let c = 0; c < cols; c++) {
            let cx = c * cellW + (rand() * cellW * 0.4);
            let cy = r * cellH + (rand() * cellH * 0.4);
            let scaleX = 0.85 + rand() * 0.4;
            let scaleY = 0.75 + rand() * 0.3;
            let baseRadius = 26 + rand() * 6;
            let rotation = rand() * Math.PI * 2;
            let numSides = 5 + Math.floor(rand() * 4);
            let vertices = [];
            for (let i = 0; i < numSides; i++) {
                let angle = (i / numSides) * Math.PI * 2;
                let rNoise = baseRadius * (0.65 + rand() * 0.5);
                vertices.push({ x: Math.cos(angle) * rNoise, y: Math.sin(angle) * rNoise });
            }
            let colorIdx = Math.floor(rand() * rockColors.length);
            rocks.push({ cx, cy, vertices, scaleX, scaleY, rotation, baseColor: rockColors[colorIdx], lightColor: rockHighlights[colorIdx], darkColor: rockShadows[colorIdx] });
        }
    }
    function drawBeveledPoly(ctx, x, y, rock, scale = 1) {
        const verts = rock.vertices;
        if (verts.length < 3) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rock.rotation);
        ctx.scale(rock.scaleX * scale, rock.scaleY * scale);
        ctx.beginPath();
        const bevelRadius = 5;
        for (let i = 0; i < verts.length; i++) {
            let p1 = verts[i];
            let p2 = verts[(i + 1) % verts.length];
            let p3 = verts[(i + 2) % verts.length];
            let dx1 = p1.x - p2.x, dy1 = p1.y - p2.y;
            let len1 = Math.hypot(dx1, dy1);
            let dx2 = p3.x - p2.x, dy2 = p3.y - p2.y;
            let len2 = Math.hypot(dx2, dy2);
            let d = Math.min(bevelRadius, len1 / 2, len2 / 2);
            let startX = p2.x + (dx1 / len1) * d, startY = p2.y + (dy1 / len1) * d;
            let endX = p2.x + (dx2 / len2) * d, endY = p2.y + (dy2 / len2) * d;
            if (i === 0) ctx.moveTo(startX, startY);
            else ctx.lineTo(startX, startY);
            ctx.quadraticCurveTo(p2.x, p2.y, endX, endY);
        }
        ctx.closePath();
        ctx.restore();
    }
    for (let r = -1; r <= rows + 1; r++) {
        for (let c = 0; c < cols; c++) {
            let px = c * cellW + cellW/2 + (rand() * 16 - 8);
            let py = r * cellH + cellH/2 + (rand() * 16 - 8);
            for (let offset of [-meterUnit, 0, meterUnit]) {
                tCtx.fillStyle = "#120901";
                tCtx.beginPath();
                tCtx.arc(px + offset, py, 14, 0, Math.PI * 2);
                tCtx.fill();
                tCtx.fillStyle = "#5c3d14";
                tCtx.beginPath();
                tCtx.arc(px + offset - 1, py - 1, 11, 0, Math.PI * 2);
                tCtx.fill();
            }
        }
    }
    rocks.forEach(rock => {
        for (let offset of [-meterUnit, 0, meterUnit]) {
            let tx = rock.cx + offset, ty = rock.cy;
            tCtx.lineWidth = 5;
            tCtx.strokeStyle = "#1c0f01";
            tCtx.lineJoin = "round";
            drawBeveledPoly(tCtx, tx, ty, rock, 1.02);
            tCtx.stroke();
            tCtx.fillStyle = rock.baseColor;
            drawBeveledPoly(tCtx, tx, ty, rock, 1.0);
            tCtx.fill();
            tCtx.save();
            tCtx.translate(1.5, 1.5);
            tCtx.fillStyle = rock.darkColor;
            drawBeveledPoly(tCtx, tx, ty, rock, 0.94);
            tCtx.fill();
            tCtx.restore();
            tCtx.save();
            tCtx.translate(-1.5, -1.5);
            tCtx.fillStyle = rock.lightColor;
            drawBeveledPoly(tCtx, tx, ty, rock, 0.88);
            tCtx.fill();
            tCtx.restore();
            tCtx.fillStyle = rock.baseColor;
            drawBeveledPoly(tCtx, tx, ty, rock, 0.80);
            tCtx.fill();
        }
    });
    groundPattern = ctx.createPattern(tileCanvas, 'repeat-x');
}

function drawRetroPlant(tCtx, cx, cy, tier, plantRand) {
    let numLeaves = 0, baseLen = 0, baseWidth = 0, baseDroop = 0;
    if (tier === 1) { numLeaves = 2 + Math.floor(plantRand() * 2); baseLen = 5 + plantRand() * 2; baseWidth = 2.2 + plantRand() * 0.8; baseDroop = 1 + plantRand() * 1; }
    else if (tier === 2) { numLeaves = 3 + Math.floor(plantRand() * 2); baseLen = 10 + plantRand() * 3; baseWidth = 4.5 + plantRand() * 1.2; baseDroop = 3 + plantRand() * 2; }
    else if (tier === 3) { numLeaves = 4 + Math.floor(plantRand() * 2); baseLen = 18 + plantRand() * 4; baseWidth = 7.0 + plantRand() * 1.8; baseDroop = 7 + plantRand() * 3; }
    else { numLeaves = 3 + Math.floor(plantRand() * 2); baseLen = 27 + plantRand() * 5; baseWidth = 11.5 + plantRand() * 1.5; baseDroop = 13 + plantRand() * 3; }
    const leaves = [];
    for (let i = 0; i < numLeaves; i++) {
        let angle = (i / numLeaves) * Math.PI * 2 + (plantRand() * 0.5 - 0.25);
        let len = baseLen * (0.85 + plantRand() * 0.3);
        let leftWidth = baseWidth * (0.85 + plantRand() * 0.3);
        let rightWidth = baseWidth * (0.85 + plantRand() * 0.3);
        let droop = baseDroop * (0.8 + plantRand() * 0.4);
        leaves.push({ angle, len, leftWidth, rightWidth, droop });
    }
    leaves.sort((a, b) => (Math.sin(a.angle) * a.len + a.droop) - (Math.sin(b.angle) * b.len + b.droop));
    function traceLeaf(ctx, cx, cy, leaf, scale = 1.0) {
        let len = leaf.len * scale, lW = leaf.leftWidth * scale, rW = leaf.rightWidth * scale, droop = leaf.droop * scale, alpha = leaf.angle;
        let x2 = cx + len * Math.cos(alpha), y2 = cy + len * Math.sin(alpha) + droop;
        let perpX = -Math.sin(alpha), perpY = Math.cos(alpha);
        let side1X = cx + len * 0.4 * Math.cos(alpha) + perpX * lW, side1Y = cy + len * 0.4 * Math.sin(alpha) + perpY * lW + droop * 0.45;
        let side2X = cx + len * 0.4 * Math.cos(alpha) - perpX * rW, side2Y = cy + len * 0.4 * Math.sin(alpha) - perpY * rW + droop * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(side1X, side1Y, x2, y2);
        ctx.quadraticCurveTo(side2X, side2Y, cx, cy);
        ctx.closePath();
    }
    const darkOutline = "#122401", shadowGreen = "#155c02", midGreen = "#2ebd07", highlightGreen = "#93f20f";
    leaves.forEach(leaf => { tCtx.lineWidth = tier >= 3 ? 5.5 : 3.5; tCtx.strokeStyle = darkOutline; tCtx.lineJoin = "round"; traceLeaf(tCtx, cx, cy, leaf, 1.12); tCtx.stroke(); tCtx.fillStyle = darkOutline; tCtx.fill(); });
    leaves.forEach(leaf => { tCtx.fillStyle = midGreen; traceLeaf(tCtx, cx, cy, leaf, 1.0); tCtx.fill(); });
    leaves.forEach(leaf => { tCtx.fillStyle = shadowGreen; tCtx.save(); tCtx.translate(0, tier >= 3 ? 1.6 : 0.8); traceLeaf(tCtx, cx, cy, leaf, 0.84); tCtx.fill(); tCtx.restore(); });
    leaves.forEach(leaf => { tCtx.fillStyle = highlightGreen; tCtx.save(); tCtx.translate(0, tier >= 3 ? -1.3 : -0.6); traceLeaf(tCtx, cx, cy, leaf, 0.62); tCtx.fill(); tCtx.restore(); });
    leaves.forEach(leaf => { tCtx.fillStyle = midGreen; traceLeaf(tCtx, cx, cy, leaf, 0.4); tCtx.fill(); });
    if (tier >= 3) {
        tCtx.strokeStyle = darkOutline;
        tCtx.lineWidth = tier === 4 ? 2.0 : 1.2;
        leaves.forEach(leaf => {
            let x2 = cx + leaf.len * 0.65 * Math.cos(leaf.angle), y2 = cy + leaf.len * 0.65 * Math.sin(leaf.angle) + leaf.droop * 0.65;
            tCtx.beginPath();
            tCtx.moveTo(cx, cy);
            tCtx.quadraticCurveTo(cx + leaf.len * 0.3 * Math.cos(leaf.angle), cy + leaf.len * 0.3 * Math.sin(leaf.angle) + leaf.droop * 0.3, x2, y2);
            tCtx.stroke();
        });
    }
}

function drawPineTreeSilhouette(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    let numTiers = 5, trunkW = width * 0.16, trunkH = height * 0.12;
    ctx.fillRect(x - trunkW/2, y - trunkH, trunkW, trunkH);
    let foliageH = height - trunkH, tierH = foliageH / numTiers;
    for (let i = 0; i < numTiers; i++) {
        let progress = i / (numTiers - 1);
        let tierW = width * (0.45 + (1 - progress) * 0.55);
        let tierBottomY = y - trunkH - (i * tierH * 0.82);
        let tierTopY = tierBottomY - tierH * 1.3;
        ctx.beginPath();
        ctx.moveTo(x - tierW/2, tierBottomY);
        ctx.quadraticCurveTo(x - tierW * 0.15, tierTopY, x, tierTopY);
        ctx.quadraticCurveTo(x + tierW * 0.15, tierTopY, x + tierW/2, tierBottomY);
        ctx.quadraticCurveTo(x, tierBottomY - tierH * 0.15, x - tierW/2, tierBottomY);
        ctx.closePath();
        ctx.fill();
    }
}

function drawDetailedRetroPineTree(ctx, x, y, w, h) {
    let trunkW = Math.max(8, w * 0.15), trunkH = h * 0.11;
    ctx.fillStyle = "#180c01"; ctx.fillRect(x - trunkW/2, y - trunkH, trunkW, trunkH);
    ctx.fillStyle = "#2e1704"; ctx.fillRect(x - trunkW/4, y - trunkH, trunkW * 0.65, trunkH);
    ctx.fillStyle = "#4a2608"; ctx.fillRect(x + trunkW/6, y - trunkH, trunkW * 0.25, trunkH);
    ctx.fillStyle = "#180c01";
    ctx.beginPath();
    ctx.moveTo(x - trunkW/2, y);
    ctx.quadraticCurveTo(x - trunkW * 1.1, y, x - trunkW * 1.2, y + 4);
    ctx.lineTo(x + trunkW * 1.2, y + 4);
    ctx.quadraticCurveTo(x + trunkW * 1.1, y, x + trunkW/2, y);
    ctx.closePath();
    ctx.fill();
    let foliageH = h - trunkH, numTiers = 6, tierH = foliageH / numTiers;
    const outlineColor = "#071302", shadowGreen = "#0c2804", baseGreen = "#174609";
    const highlightGreen = "#3b8517", lightHighlight = "#78d433", ultraHighlight = "#b7f975";
    let startY = y - trunkH;
    for (let i = 0; i < numTiers; i++) {
        let progress = i / (numTiers - 1);
        let currentW = w * (1.0 - progress * 0.85);
        let currentH = tierH * 1.45;
        let currentY = startY - (i * tierH * 0.80);
        ctx.save();
        ctx.translate(x, currentY);
        ctx.fillStyle = outlineColor;
        ctx.beginPath();
        ctx.arc(-currentW/2, 0, 7, Math.PI/2, Math.PI, false);
        ctx.quadraticCurveTo(0, -currentH, currentW/2, 0);
        ctx.arc(currentW/2, 0, 7, 0, Math.PI/2, false);
        ctx.quadraticCurveTo(0, currentH * 0.3, -currentW/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = baseGreen;
        ctx.beginPath();
        ctx.arc(-currentW/2 + 1, 0, 5, Math.PI/2, Math.PI, false);
        ctx.quadraticCurveTo(0, -currentH + 3, currentW/2 - 1, 0);
        ctx.arc(currentW/2 - 1, 0, 5, 0, Math.PI/2, false);
        ctx.quadraticCurveTo(0, currentH * 0.26, -currentW/2 + 1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = shadowGreen;
        ctx.beginPath();
        ctx.moveTo(0, -currentH + 3);
        ctx.quadraticCurveTo(currentW/3, -currentH * 0.5, currentW/2 - 1, 0);
        ctx.arc(currentW/2 - 1, 0, 5, 0, Math.PI/2, false);
        ctx.quadraticCurveTo(0, currentH * 0.26, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = highlightGreen;
        ctx.beginPath();
        ctx.arc(-currentW/2 + 2, 0, 4, Math.PI/2, Math.PI, false);
        ctx.quadraticCurveTo(-currentW * 0.25, -currentH + 5, 0, -currentH + 5);
        ctx.quadraticCurveTo(-currentW * 0.15, -currentH * 0.35, -currentW/2 + 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = lightHighlight;
        ctx.beginPath();
        ctx.ellipse(-currentW * 0.28, -currentH * 0.45, currentW * 0.15, currentH * 0.15, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = ultraHighlight;
        ctx.beginPath();
        ctx.ellipse(-currentW * 0.32, -currentH * 0.5, currentW * 0.05, currentH * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-currentW * 0.35, -currentH * 0.25);
        ctx.quadraticCurveTo(-currentW * 0.1, -currentH * 0.15, 0, -currentH * 0.2);
        ctx.moveTo(currentW * 0.1, -currentH * 0.35);
        ctx.quadraticCurveTo(currentW * 0.25, -currentH * 0.22, currentW * 0.35, -currentH * 0.3);
        ctx.stroke();
        ctx.restore();
    }
}

function drawDetailedRetroBush(ctx, x, y, size) {
    const outlineColor = "#0f2105", baseGreen = "#275416", highlightGreen = "#538f30";
    ctx.fillStyle = outlineColor;
    ctx.beginPath();
    ctx.arc(x, y - size*0.4, size + 2, 0, Math.PI * 2);
    ctx.arc(x - size*0.5, y - size*0.3, size*0.8 + 2, 0, Math.PI * 2);
    ctx.arc(x + size*0.5, y - size*0.3, size*0.8 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = baseGreen;
    ctx.beginPath();
    ctx.arc(x, y - size*0.4, size, 0, Math.PI * 2);
    ctx.arc(x - size*0.5, y - size*0.3, size*0.75, 0, Math.PI * 2);
    ctx.arc(x + size*0.5, y - size*0.3, size*0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = highlightGreen;
    ctx.beginPath();
    ctx.arc(x - size*0.2, y - size*0.5, size*0.6, Math.PI, Math.PI * 1.8);
    ctx.arc(x - size*0.5, y - size*0.4, size*0.5, Math.PI, Math.PI * 1.8);
    ctx.fill();
}

function isPit(worldX) {
    if (worldX < 600) return false;
    const segment = 1400;
    const offset = worldX % segment;
    return offset > 850 && offset < 1050;
}
