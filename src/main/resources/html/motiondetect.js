/**
 * A quick and dirty motion detector script
 */


/**
 * Do simple motion detection based on diff between previous and current image
 */
function getFrameDiff(previous, current, threshold) {
    var index = 0;
    var bitarray = new Array();
    for (var x = 0; x < previous.width; x++) {
        for (var y = 0; y < previous.height; y++) {
            // Calculate difference between r, g and b channels. Ignore alpha channel
            var r_diff = Math.abs(current.data[index] - previous.data[index++]);
            var g_diff = Math.abs(current.data[index] - previous.data[index++]);
            var b_diff = Math.abs(current.data[index] - previous.data[index++]);
            index++; // skip alpha channel

            // Set pixel to white if there's a difference
            bitarray.push( (r_diff > threshold
                || g_diff > threshold
                || b_diff > threshold) ? 1: 0);
        }
    }
    return bitarray;
}

/**
 * Downsample array from orig_x, orig_y to new_x, new_y
 */
function downsampleArray(bitarray, width, height, pixelSize) {
    var downsampled = new Array();
    var threshold = (pixelSize * pixelSize) / 4;
    for (var y = 0; y < height; y += pixelSize) {
        for (var x = 0; x < width; x += pixelSize) {
            var sum = 0;
            for (var dx = 0; dx < pixelSize; dx++) {
                for (var dy = 0; dy < pixelSize; dy++) {
                    sum += bitarray[(x + dx) + ((y + dy) * width)];
                }
            }
            downsampled.push(sum > threshold ? 1 : 0);
        }
    }
    return downsampled;
}

/**
 * Upsample bit array to a bigger one
 */
function upsampleArray(bitarray, width, height, multiplier) {
    var newWidth = width * multiplier;
    var newHeight = height * multiplier;
    var upsampled = new Array(newWidth * newHeight);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var currentValue = bitarray[x + (y * width)];
            for (var dy = 0; dy < multiplier; dy++) {
                for (var dx = 0; dx < multiplier; dx++) {
                    var index = (x * multiplier) + dx + (((y * multiplier) + dy) * newWidth);
                    upsampled[index] = currentValue;
                }
            }
        }
    }
    return upsampled;
}
/**
 * Convert bit array to imageData rgba structure
 */
function bitArrayToImageData(bitarray, imageData) {
    var dataIndex = 0;
    var bitIndex = 0;

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            if (bitarray[bitIndex++] == 1) {
                imageData.data[dataIndex] = 0;
                imageData.data[dataIndex + 1] = 0;
                imageData.data[dataIndex + 2] = 0;
                imageData.data[dataIndex + 3] = 0xFF;
            }
            dataIndex += 4;
        }
    }
}

var Minion = Minion || {};

Minion.MotionDetector = function() {
    this.dataCapturedCallback = new Array();
    this.motionDetectedCallback = new Array();
    this.noMotionDetectedCallback = new Array();
    this.sourceWidth = 320;
    this.sourceHeight = 240;
    this.debug = false;
    this.referenceFrame = null;
    this.threshold = 64;
    this.pixelSize = 40;
};

/**
 * Update the reference frame with new data. Average the pixel values with
 * a preference for the existing one. This means that the reference frame will
 * adjust to new objects and lighting condition without causing false positives
 * for stationary objects.
 */
Minion.MotionDetector.prototype.updateReferenceFrame = function(newFrameData) {
    var oldRatio = 0.99;
    var newRatio = 0.01;
    var typical = this.referenceFrame;
    var index = 0;
    for (var x = 0; x < typical.width; x++) {
        for (var y = 0; y < typical.height; y++) {
            typical.data[index] = newRatio * newFrameData.data[index] + oldRatio * typical.data[index];
            typical.data[index + 1] = newRatio * newFrameData.data[index + 1] + oldRatio * typical.data[index + 1];
            typical.data[index + 2] = newRatio * newFrameData.data[index + 2] + oldRatio * typical.data[index + 2];
            index += 4;
        }
    }
};

Minion.MotionDetector.prototype.addFrame = function(currentImageData) {
    if (this.referenceFrame == null) {
        this.referenceFrame = currentImageData;
        return;
    }

    // Do the actual motion detection here

    this.motionArray = getFrameDiff(this.referenceFrame, currentImageData, this.threshold);
    this.downsampledArray = downsampleArray(this.motionArray, this.sourceWidth, this.sourceHeight, this.pixelSize);
    // TODO: Trigger events
    for (var i = 0; i < this.dataCapturedCallback.length; i++) {
        this.dataCapturedCallback[i](this.downsampledArray);
    }
    if (this.downsampledArray.indexOf(1) >= 0) {
        for (var i = 0; i < this.motionDetectedCallback.length; i++) {
            this.motionDetectedCallback[i](this.downsampledArray);
        }
    }
    else {
        for (var i = 0; i < this.motionDetectedCallback.length; i++) {
            this.noMotionDetectedCallback[i]();
        }
    }
    this.updateReferenceFrame(currentImageData);

};

Minion.MotionDetector.prototype.readFrame = function() {
    if (this.videoElement && this.videoElement.readyState == this.videoElement.HAVE_ENOUGH_DATA) {
        var camcontext = this.canvasElement.getContext('2d');
        camcontext.drawImage(this.videoElement, 0, 0, this.sourceWidth, this.sourceHeight);
        var newImageData = camcontext.getImageData(0, 0, this.sourceWidth, this.sourceHeight);
        this.addFrame(newImageData);
    }
};

function captureFrame(motionDetector) {
    motionDetector.readFrame();
}


Minion.MotionDetector.prototype.setup = function(containerElementId) {
    var containerElement = document.getElementById(containerElementId);
    if (containerElement == null) {
        console.debug('Could not find element with id ' + containerElementId);
        throw new Exception();
    }


    // Create canvas to grab frames
    var canvasElement = document.createElement('canvas');
    canvasElement.setAttribute("id", "mdCanvas");
    canvasElement.setAttribute("width", this.sourceWidth);
    canvasElement.setAttribute("height", this.sourceHeight);
    if (this.debug) {
        canvasElement.setAttribute("style", "position:absolute; bottom: 0; left: 0; border: solid 1px blue");
    }
    else {
        canvasElement.setAttribute("style", "visibility:hidden; position:absolute; bottom: 0; left: 0");
    }
    containerElement.appendChild(canvasElement);
    this.canvasElement = canvasElement;

    // Create video element, create canvas element
    var videoElement = document.createElement('video');
    videoElement.setAttribute("id", "mdVideo");
    if (this.debug) {
        videoElement.setAttribute("style", "position:absolute; bottom: 0; right: 0; border: solid 1px red");
    }
    else {
        videoElement.setAttribute("style", "visibility:hidden; position:absolute; bottom:0; right: 0");
    }
    videoElement.setAttribute("autoplay", "1");
    videoElement.setAttribute("width", this.sourceWidth);
    videoElement.setAttribute("height", this.sourceHeight);

    this.videoElement = videoElement;

    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

    var that = this;
    navigator.getUserMedia({ video: true, audio: false }, function(stream) {
        var url = window.URL.createObjectURL(stream);
        videoElement.src = url;
        videoElement.addEventListener('timeupdate', function() {
            captureFrame(that);
        });

    }, function(error) { console.debug('got error loading video: ' + error); });

    containerElement.appendChild(videoElement);
};

/**
 * Accepted events: 'DataCaptured', 'MotionDetected','NoMotionDetected'
 */
Minion.MotionDetector.prototype.addEventListener = function(eventId, callback) {
    if (eventId == 'DataCaptured' && callback) {
        this.dataCapturedCallback.push(callback);
    }

    if (eventId == 'MotionDetected' && callback) {
        this.motionDetectedCallback.push(callback);
    }

    if (eventId == 'NoMotionDetected' && callback) {
        this.noMotionDetectedCallback.push(callback);
    }
};

Minion.MotionDetector.prototype.getDifferenceWidth = function() {
    return this.sourceWidth/this.pixelSize;
};

Minion.MotionDetector.prototype.getDifferenceHeight = function() {
    return this.sourceHeight/this.pixelSize;
};

Minion.MotionDetector.prototype.getReferenceFram = function() {
    return this.referenceFrame;
};

Minion.MotionDetector.prototype.getLastDifference = function() {
    return this.downsampledArray;
};

Minion.MotionDetector.prototype.getMotionMatrix = function() {
    return this.motionArray;
};

Minion.MotionDetector.prototype.getMotionImage = function(imageData) {
    bitArrayToImageData(this.motionArray, imageData);;
};

