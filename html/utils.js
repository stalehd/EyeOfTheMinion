/**
 * Convert radians into degrees somewhere in the 0-360 range
 */
function toDegrees(radians) {
    var degrees = radians * 180/Math.PI;
    while (degrees < 0) {
        degrees += 360;
    }
    while (degrees > 360) {
        degrees -= 360;
    }
    return degrees;
}

/**
 * Convert to polar coordinates (aka the eye's lookAt() parameters)
 */
function coordinateToPolar(x, y, w, h) {
    // Map coordinates to angle and length. This is a bit headache-inducing since
    // there are different coordinate systems, different types of angles *and*
    // the motion grid is inverted left-right
    var centerx = w/2;
    var centery = h/2;

    // Length is a percentage
    var dx = -(centerx - x);
    var dy = centery - y;

    if (dx == 0 && dy == 0) {
        // centered; look forward
        return { angle: 0.0, length: 0.0 };
    }

    // this is the easy one: The length of the line. The length is a value
    // from 0-100 wrt how far the eye is looking in a particular direction
    var length = Math.sqrt((dx * dx) + (dy * dy)) / centerx * 100;


    // The angle is a bit more difficult. The atan2 function works between π and -π
    // with 0 along the x-axis. This means that we have to adjust for positive/negative
    // y values. The "add" variable is the degree offset (the eye uses 0 as up) wrt the
    // atan axis (x-axis, positive y down)
    var add = -Math.PI/2;
    if (dy < 0) {
        dy = -dy;
        dx = -dx;
        add += Math.PI;
    }

    var angle = toDegrees(add + Math.atan2(Math.abs(dy), dx));

    return { angle: angle, length: length };
}
