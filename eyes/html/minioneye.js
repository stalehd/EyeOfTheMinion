
var MinionColors = {
    SKIN: '#FFD803',
    HIGHLIGHT: 'rgba(255,255,255,0.5)',
    PUPIL: 'black',
    IRIS_OUTER: '#E87000',
    IRIS_INNER: '#7E3700',
    EYEBALL_OUTER: '#EEEEEE',
    EYEBALL_INNER: 'white',
}
var EYEBALL_RADIUS = 200;
var UNIT = EYEBALL_RADIUS / 8;
var IRIS_RADIUS = EYEBALL_RADIUS / 2 + UNIT;
var LARGE_PUPIL = 3 * UNIT;
var NORM_PUPIL = 2 * UNIT;
var SMALL_PUPIL = 1.5 * UNIT;


function drawTopEyelid(eye, ctx, centerX, centerY) {
    // Draw eyelids. The top lid is a bezier curve. The connecting points are
    // slightly outside the eyeball itself, positioned on the center line.
    // The control points are aligned with the connecting points on each side
    // and the position of the control points determines the position of the
    // eye lid. The lid goes 90% down when closed and the bottom eyelid
    // does the rest.

    // Yellow with a hint of red
    ctx.fillStyle = MinionColors.SKIN;
    ctx.beginPath();
    ctx.moveTo(centerX - EYEBALL_RADIUS, centerY - EYEBALL_RADIUS);
    ctx.lineTo(centerX - EYEBALL_RADIUS, centerY);

    var p1 =  {
        x: centerX - EYEBALL_RADIUS,
        y: centerY
    };
    var p2 = {
        x: centerX + EYEBALL_RADIUS,
        y: centerY
    };

    // Move the y coordinate of the control points to
    // open and close the eyelid
    var ypos = centerY - eye.topEyelid;
    var cp1 = {
        x: p1.x,
        y: ypos
    };
    var cp2 = {
        x: p2.x,
        y: ypos
    };
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);

    ctx.lineTo(centerX + EYEBALL_RADIUS, centerY);
    ctx.lineTo(centerX + EYEBALL_RADIUS, centerY - EYEBALL_RADIUS);
    ctx.fill();

    ctx.closePath();
}

function drawBottomEyelid(eye, ctx, centerX, centerY) {
    ctx.fillStyle = MinionColors.SKIN;
    ctx.beginPath();
    ctx.moveTo(centerX - EYEBALL_RADIUS, centerY + EYEBALL_RADIUS);
    ctx.lineTo(centerX + EYEBALL_RADIUS, centerY + EYEBALL_RADIUS);
    ctx.lineTo(centerX + EYEBALL_RADIUS, centerY);

    var p1 = {
        x: centerX + EYEBALL_RADIUS ,
        y: centerY
    }

    var p2 = {
        x: centerX - EYEBALL_RADIUS ,
        y: centerY
    }
    var ypos = centerY + eye.bottomEyelid;
    var cp1 = {
        x: p1.x,
        y: ypos
    };
    var cp2 = {
        x: p2.x,
        y: ypos
    };
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);

    ctx.lineTo(centerX - EYEBALL_RADIUS, centerY);
    ctx.fill();

    ctx.closePath();
}

function drawHighlight(eye, ctx, centerX, centerY) {
    ctx.beginPath();
    ctx.fillStyle = MinionColors.HIGHLIGHT;
    ctx.arc(centerX - UNIT , centerY - UNIT , UNIT*0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
}

function drawPupil(eye, ctx, centerX, centerY) {
    ctx.beginPath();
    ctx.fillStyle = MinionColors.PUPIL;
    ctx.arc(centerX + eye.pupilOffsetX, centerY + eye.pupilOffsetY, eye.currentPupilSize, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
}

function drawIris(eye, ctx, centerX, centerY) {
    // Iris
    // Fill the entire iris with
    // Four shades of brown:
    // Dark brown background: CB5800
    // Lighter inner circle: E87000
    // solid triangles: B45700
    // translucent triangles: 9E4D00
    var x = centerX + eye.irisOffsetX;
    var y = centerY + eye.irisOffsetY;
    var irisGradient
        = ctx.createRadialGradient(x, y, 100, x, y, 128);
    irisGradient.addColorStop(0, MinionColors.IRIS_OUTER);
    irisGradient.addColorStop(1, MinionColors.IRIS_INNER);

    ctx.beginPath();
    ctx.fillStyle = irisGradient;
    ctx.arc(x, y, eye.irisRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    // TODO: Iris pattern
}

function drawEyeball(eye, ctx, centerX, centerY) {
    // Eyeball with light coming from top left
    var eyeballGradient = ctx.createRadialGradient(centerX-10, centerY-10, 175, centerX, centerY, EYEBALL_RADIUS);
    eyeballGradient.addColorStop(1, MinionColors.EYEBALL_OUTER);
    eyeballGradient.addColorStop(0, MinionColors.EYEBALL_INNER);
    ctx.beginPath();
    ctx.fillStyle = eyeballGradient;
    ctx.arc(centerX, centerY, EYEBALL_RADIUS, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
}

var Minion = Minion || {};

Minion.Eye = function(canvasId) {
    this.blinkTimer = null;
    this.canvasId = canvasId;
    this.eye = {
        currentPupilSize: 1.5*UNIT,
        irisRadius: IRIS_RADIUS,
        topEyelid: 1.3 * EYEBALL_RADIUS,
        bottomEyelid: 1.3 * EYEBALL_RADIUS,
        irisOffsetX: 0, irisOffsetY: 0,
        pupilOffsetX: 0, pupilOffsetY: 0,

    };
};

Minion.Eye.prototype.draw = function() {
    var canvas = document.getElementById(this.canvasId);
    var ctx = canvas.getContext('2d');
    var centerX = canvas.width/2;
    var centerY = canvas.height/2;
    ctx.beginPath();
    ctx.fillStyle = MinionColors.SKIN;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.closePath();
    drawEyeball(this.eye, ctx, centerX, centerY);

    drawIris(this.eye, ctx, centerX, centerY);

    drawPupil(this.eye, ctx, centerX, centerY);

    drawHighlight(this.eye, ctx, centerX, centerY);

    drawTopEyelid(this.eye, ctx, centerX, centerY);
    drawBottomEyelid(this.eye, ctx, centerX, centerY);
};

Minion.Eye.prototype.tinyPupil = function() {
    var tween = new TWEEN.Tween(this.eye);
    tween.to({ currentPupilSize: 5 }, 250);
    tween.start();
}

Minion.Eye.prototype.smallPupil = function() {
    var tween = new TWEEN.Tween(this.eye);
    tween.to({ currentPupilSize: SMALL_PUPIL }, 250);
    tween.start();
}

Minion.Eye.prototype.bigPupil = function() {
    var tween = new TWEEN.Tween(this.eye);
    tween.to({ currentPupilSize: LARGE_PUPIL }, 250);
    tween.start();
}

Minion.Eye.prototype.massivePupil = function() {
    var tween = new TWEEN.Tween(this.eye);
    tween.to({ currentPupilSize: 1.4*LARGE_PUPIL }, 250);
    tween.start();
}

Minion.Eye.prototype.normPupil = function() {
    var tween = new TWEEN.Tween(this.eye);
    tween.to({ currentPupilSize: NORM_PUPIL }, 250);
    tween.start();
}

Minion.Eye.prototype.smugMug = function() {
    this.setBlinkRate(this.normalBlink, 3000);
    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        currentPupilSize: SMALL_PUPIL,
        topEyelid: 2*UNIT,
        bottomEyelid: 4*UNIT }, 500);
    tween.start();
}


Minion.Eye.prototype.sleepy = function() {
    this.setBlinkRate(this.slowBlink, 6000);
    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        currentPupilSize: LARGE_PUPIL,
        topEyelid: -UNIT,
        bottomEyelid: 5*UNIT }, 500);
    tween.start();
}


Minion.Eye.prototype.alert = function() {
    this.setBlinkRate(this.fastBlink, 2000);

    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        currentPupilSize: SMALL_PUPIL,
        topEyelid: 1.3*EYEBALL_RADIUS,
        bottomEyelid: 1.3*EYEBALL_RADIUS }, 500);
    tween.start();

}


Minion.Eye.prototype.normal = function() {
    this.setBlinkRate(this.normalBlink, 5000);

    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        currentPupilSize: NORM_PUPIL,
        topEyelid: 1.2*EYEBALL_RADIUS,
        bottomEyelid: 1.2*EYEBALL_RADIUS }, 500);
    tween.start();
}

Minion.Eye.prototype.vengeance = function() {
    this.setBlinkRate(this.slowBlink, 4000);

    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        currentPupilSize: LARGE_PUPIL,
        topEyelid: 1.3*EYEBALL_RADIUS,
        bottomEyelid: UNIT }, 500);
    tween.start();
}

Minion.Eye.prototype.lookAt = function(direction, length, duration) {
    var actualDuration = duration || 100;
    var pupilCenter = length / (IRIS_RADIUS + UNIT) * 100;
    var direction = Math.PI/180.0 * direction;

    var xOffset = Math.round(pupilCenter * Math.sin(direction), 2);
    var yOffset = Math.round(pupilCenter * -Math.cos(direction), 2);

    var tween = new TWEEN.Tween(this.eye);
    tween.to({
        irisOffsetX: xOffset,
        irisOffsetY: yOffset,
        pupilOffsetX: 1.4 * xOffset,
        pupilOffsetY: 1.4 * yOffset }, actualDuration);
    tween.start();
}

Minion.Eye.prototype.doBlink = function(duration) {
    var currentTop = this.eye.topEyelid;
    var currentBottom = this.eye.bottomEyelid;

    var down = new TWEEN.Tween(this.eye);
    down.to({ topEyelid: -2*UNIT, bottomEyelid: UNIT }, duration);

    var up = new TWEEN.Tween(this.eye);
    up.to({ topEyelid: currentTop, bottomEyelid: currentBottom }, duration);

    down.chain(up);
    down.start();
}

Minion.Eye.prototype.fastBlink = function() {
    this.doBlink(50);
}

Minion.Eye.prototype.slowBlink = function() {
    this.doBlink(250);

}

Minion.Eye.prototype.normalBlink = function() {
    this.doBlink(100);
}

function animateEye(eye) {
    TWEEN.update();
    eye.draw();
    requestAnimationFrame(function() { animateEye(eye); });
}

Minion.Eye.prototype.animate = function() {
    animateEye(this);
}
Minion.Eye.prototype.setBlinkRate = function(func, duration) {
    if (this.blinkTimer) {
        window.clearInterval(this.blinkTimer);
    }
    this.currentBlinkFn = func;
    this.blinkTimer = window.setInterval(function() { eye.currentBlinkFn() }, duration);
}

