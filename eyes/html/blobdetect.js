/**
 * Blob detection
 */

var Minion = Minion || {};

Minion.Grid = function(array, w, h) {
    this.data = array;
    this.width = w;
    this.height = h;
};

Minion.Grid.prototype.get = function(x, y) {
    return this.data[x + (y * this.width)];
};

Minion.Grid.prototype.set = function(x, y, v) {
    this.data[x + (y * this.width)] = v;
};

Minion.Grid.prototype.getWidth = function() {
    return this.width;
};

Minion.Grid.prototype.getHeight = function() {
    return this.height;
};

Minion.Grid.prototype.iterate = function (func) {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            func(x, y, this.get(x, y));
        }
    }
};

Minion.Grid.prototype.findFirstNonNull = function() {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.get(x, y) > 0) {
                return { x: x, y: y };
            }
        }
    }
    return null;
};

Minion.Grid.prototype.isSet = function(pos) {
    if (pos == null) {
        return false;
    }
    if (pos.x >= this.width || pos.x < 0) {
        return false;
    }
    if (pos.y >= this.height || pos.y < 0) {
        return false;
    }
    if (this.get(pos.x, pos.y) > 0) {
        return true;
    }
    return false;
};


Minion.BlobDetector = function(sourceArray, width, height) {
    this.grid = new Minion.Grid(sourceArray, width, height);
};

/**
 * A simple recursive function to find blobs. It works like a cellular-automata
 * and scans through the first non-0 cell in the grid.
 *
 *
 * The algorithm works like this:
 *
 * for each element in check list:
 *   - unset element in grid
 *   - add element to blobList
 *   if element E, SE, S, SW, W, NW, N, NE if it is set in grid:
 *      - add element to new check list
 *  - repeat with new check list
 *  - return blobList
 *
 * The returned blobList contains all adjacent pixels as a single blob.
 *
 * Each pass selects the first set element, iterates across all adjacent
 * elements and returns the list.
 * When there's no more set elements all blobs are discovered.
 */
function checkWorkList(grid, checkList, blob) {
    var newCheckList = new Array();
    checkList.forEach(function(pos) {
        if (!grid.isSet(pos)) {
            return;
        }
        blob.push(pos);
        grid.set(pos.x, pos.y, 0);

        var east      = { x: pos.x + 1, y: pos.y };
        var southEast = { x: pos.x + 1, y: pos.y + 1 };
        var south     = { x: pos.x,     y: pos.y + 1 };
        var southWest = { x: pos.x - 1, y: pos.y + 1 };
        var west      = { x: pos.x - 1, y: pos.y };
        var northWest = { x: pos.x - 1, y: pos.y - 1 };
        var north     = { x: pos.x,     y: pos.y - 1 };
        var northEast = { x: pos.x + 1, y: pos.y - 1 };
        [ east, southEast, south, southWest, west, northWest, north, northEast ].forEach(function(checkPos) {
            if (grid.isSet(checkPos)) {
                newCheckList.push(checkPos);
            }
        });
    });

    if (newCheckList.length > 0) {
        checkWorkList(grid, newCheckList, blob);
    }
};


/**
 * Return a list of rectangles (x, y, w, h, size) covering
 * all of the blobs. They are sorted by size, biggest first.
 */
Minion.BlobDetector.prototype.findBlobs = function() {
    // Find first element with a non-null value
    // add to work list
    //
    var blobs = new Array();
    var completed = false;
    while (!completed) {
        var pos = this.grid.findFirstNonNull();
        if (pos == null) {
            completed = true;
            break;
        }
        var workList = new Array();
        var blob = new Array();
        workList.push(pos);
        checkWorkList(this.grid, workList, blob);
        blobs.push(blob);
    }

    // We now have a list of blobs; find the surrounding rectangles. They might
    // overlap but that doesn't matter.
    var rectangles = new Array();
    blobs.forEach(function(blobList) {
        var xstart = 9999;
        var ystart = 9999;
        var xend = 0;
        var yend = 0;
        blobList.forEach(function(point) {
            xstart = Math.min(point.x, xstart);
            ystart = Math.min(point.y, ystart);
            xend = Math.max(point.x, xend);
            yend = Math.max(point.y, yend);
        });
        rectangles.push({
            x: xstart,
            y: ystart,
            w: xend - xstart + 1,
            h: yend - ystart + 1,
            size: (xend - xstart + 1) * (yend - ystart + 1)
        });
    });

    return rectangles.sort(function(a,b) {
        return b.size - a.size;
    });
};
