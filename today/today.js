;let gameAccessor = (function(){
"use strict";
let config = {

   /*
   ** The HTML id of the canvas for the game.
   **
   ** Options: any string, or the empty string ( "" ) if not using canvas
   */
   canvasId: "game-canvas",


   /*
   ** The HTML id of the canvas wrapper.
   ** The wrapper is resized while the canvas just fits the wrapper.
   **
   ** Options: any string, or the empty string ( "" ) if not using canvas wrapper and/or canvas
   */
  wrapperId: "canvas-wrapper",

   /*
   ** The HTML id of the container for the game.
   **
   ** Options: any string
   */
   containerId: "game-container",

   /*
    ** Minimum amount of time in milliseconds between each execution of resize code.
    ** This is particularly useful in performance when a window might be
    ** resized many times in a short time frame.
    **
    ** Options: any real number
    */
   resizeDelay: 250,

    /*
    ** The position of the canvas within the container (applicable to canvas only).
    **
    ** Options: "top left",     "top center",     "top right"
    **          "center left",  "center center",  "center right"
    **          "bottom left",  "bottom center",  "bottom right"
    */
    canvasPosition: "center center",

    
    /*
    ** Whether the canvas should stretch to fit the container
    ** or whether it should maintain aspect ratio (applicable to canvas only).
    **
    ** Options: true, false
    */
    stretchToFit: false,

    /*
    ** Whether the canvas should fill the entire container
    ** (some of it may be cropped off screen) (applicable to canvas only).
    **
    ** Options: true, false
    */
    fillScreen: true,

    /*
    ** Whether the canvas drawing operations should scale to look sharper
    ** on retina displays (which have high device pixel ratios (DPRs).
    ** WARNGING: may cause a decrease in performance.
    **
    ** Options: true, false
    */
   scaleByDPR: false,

    /*
    ** The orientation of the game (applicable to canvas only).
    **
    ** Options: "portrait", "landscape", "both"
    */
   orientation: "both",

    /*
    ** The width and height of the ingame field of play.
    ** It is thus also the ideal width and height of the canvas if it is to
    ** maintain aspect ratio (applicable to canvas only).
    **
    ** Options: any real number
    */
   gameFieldWidth: 1920,
   gameFieldHeight: 1080//936.56
    
};

;
;let resizer = (function() {
    "use strict";

    // This is all poot if config isn't loaded
    if (!config) {
        console.log("ERROR: unable to load config.js");
        return null;
    }
    
    // Private variables

    // Figure out if user device is android or ios
    //const _ua = navigator.userAgent.toLowerCase();
    //const _android = _ua.indexOf('android') > -1;
    //const _ios = /ipad|iphone|ipod/i.test(_ua) && !window.MSStream;
    let _isInitialized = false;
    let _resizeEvents = [];
    let _numResizeEvents = 0;

    let _canvasBoundingRect;
    let _context;


    let _heightPlusPadding, _widthPlusPadding;
    let _paddingLeft, _paddingRight, _paddingTop, _paddingBottom;


    // Exposed variables
    let _container, _canvas, _wrapper;
    let _currentHeight, _currentWidth;
    let _sizeMode;
    let _orientation;



    // Get left offset of element
    function _getOffsetLeft(elem) {
        let offsetLeft = 0;

        // Add px to left offset...
        do {
            if( !isNaN(elem.offsetLeft) ) {
                offsetLeft += elem.offsetLeft;
            }

            // for each elem until there's no more parent element
            elem = elem.offsetParent;
        } while(elem !== null);

        // Return left offset
        return offsetLeft;
    }

    // Get top offset of element
    function _getOffsetTop(elem) {
        let offsetTop = 0;

        do {
            if( !isNaN(elem.offsetTop) ) {
                offsetTop += elem.offsetTop;
            }

            elem = elem.offsetParent;
        } while(elem !== null);

        return offsetTop;
    }

    // Because events give coords in terms of the page,
    // this function converts those in terms of the actual game's
    // coordinate system.
    function _getRelativeEventCoords(event) {
        // Scale coords correctly
        let scale = _currentWidth / config.gameFieldWidth;

        // Get x and y values
        let x = event.pageX - _getOffsetLeft(_canvas);
        let y = event.pageY - _getOffsetTop(_canvas);

        return {
            x: x/scale,
            y: y/scale
        };
    }


    // Optimizes certain event listeners by only executing the callback
    // a certain amount of time after the event *stops* firing (useful for resize)
    function _debounce(func, delay, immediate) {
        let timeout;

        return function() {
            let context = this, args = arguments;

            let later = function() {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };

            let callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);

            if (callNow) 
                func.apply(context, args);
        };
    }

    // Resize the canvas
    function _resize() {
        const DPR = window.devicePixelRatio || 1;
        let ratio, i;

        if (_canvas) {

            // Get container's padding values
            _paddingLeft = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-left'));
            _paddingRight = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-right'));
            _paddingTop = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-top'));
            _paddingBottom = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-bottom'));

            // Calculate the inner dimensions with padding taken into account
            _heightPlusPadding = _container.clientHeight - (_paddingTop+_paddingBottom);
            _widthPlusPadding = _container.clientWidth - (_paddingLeft+_paddingRight);

            // Figure out orientation
            if (config.orientation === "both") {
                if (window.innerWidth >= window.innerHeight) {
                    _orientation = "landscape";
                }
                else {
                    _orientation = "portrait";
                }
            }
            else {
                _orientation = config.orientation;
            }

            // Stretch to fit?
            if (config.stretchToFit) {
                _currentHeight = _heightPlusPadding;
                _currentWidth = _widthPlusPadding;
            }

            // Fill the screen?
            // else if (config.fillScreen) {

            //     // Get aspect ratio
            //     ratio = config.gameFieldWidth / config.gameFieldHeight;

            //     _currentHeight = _heightPlusPadding;
            //     _currentWidth = _currentHeight * ratio;
            // }

            // Conform width to aspect ratio if not stretching to fit
            else {

                if (_orientation === "portrait") {
                    _sizeMode = "fitWidth";
                    
                    // Get aspect ratio
                    ratio = config.gameFieldWidth / config.gameFieldHeight;

                    _currentHeight = _heightPlusPadding;
                    _currentWidth = _currentHeight * ratio;

                    // Double check that the aspect ratio fits the container
                    if ( !config.fillScreen && Math.floor(_currentWidth) > _widthPlusPadding ) {

                        _sizeMode = "fitHeight";

                        // Resize to fit width
                        ratio = config.gameFieldHeight / config.gameFieldWidth;

                        // Get correct  dimensions
                        _currentWidth = _widthPlusPadding;
                        _currentHeight = _currentWidth * ratio;
                    }
                }
                else {
                    _sizeMode = "fitHeight";

                    // Resize to fit width
                    ratio = config.gameFieldHeight / config.gameFieldWidth;

                    // Get correct  dimensions
                    _currentWidth = _widthPlusPadding;
                    _currentHeight = _currentWidth * ratio;


                    // Double check that the aspect ratio fits the container
                    if ( !config.fillScreen && Math.floor(_currentHeight) > _heightPlusPadding ) {
                        _sizeMode = "fitWidth";
                    
                        // Get aspect ratio
                        ratio = config.gameFieldWidth / config.gameFieldHeight;

                        _currentHeight = _heightPlusPadding;
                        _currentWidth = _currentHeight * ratio;
                    }
                }
            }

            // For high-DPI display, increase the actual size of the canvas
            // THIS WAS CAUSING SLOW PERFORMANCE ON DEVICES WITH HIGH DPR VALUES

            if (config.scaleByDPR) {
                _canvas.width = Math.round(config.gameFieldWidth * DPR);
                _canvas.height = Math.round(config.gameFieldHeight * DPR);

                // Ensure all drawing operations are scaled
                _context.scale(DPR, DPR);
            }

            // Scale everything down using CSS
            _wrapper.style.width = Math.round(_currentWidth) + "px";
            _wrapper.style.height = Math.round(_currentHeight) + "px";

            // Position the canvas within the container according to config
            _positionCanvas();

            // Update bounding rect
            _canvasBoundingRect = _canvas.getBoundingClientRect();
        }

        // Call the resize event(s)
        for (i = 0; i < _numResizeEvents; i++) { 
            _resizeEvents[i]();
        }
    }

    // Center the canvas within the container
    function _positionCanvas() {
        let bodyRect, containerRect, cPageX, cPageY;

        // Get the requested positioning
        let position = config.canvasPosition.split(" ");

        // Determine container position style
        let containerPosition = window.getComputedStyle(_container).getPropertyValue("position");


        // If the container is absolute, canvas is positioned relative to document body
        if (containerPosition === "absolute") {

            // Get container coordinates relative to page (not viewport)
            bodyRect = document.body.getBoundingClientRect();
            containerRect = _container.getBoundingClientRect();

            cPageX = containerRect.left - bodyRect.left;
            cPageY = containerRect.top - bodyRect.top;
        }

        // If container is not absolute, canvas is positioned relative to parent
        else {
            cPageX = 0;
            cPageY = 0;
        }

        // Vertical positioning
        switch (position[0]) {
            default:
            case "center":
                _wrapper.style.top = Math.round(cPageY + _paddingTop + ( (_heightPlusPadding/2) - (_currentHeight/2) )) + "px";
                break;

            case "top":
                _wrapper.style.top = Math.round(cPageY + _paddingTop) + "px";
                break;

            case "bottom":
                _wrapper.style.top = Math.round(cPageY + _container.clientHeight - _currentHeight - _paddingBottom) + "px";
                break;
            
        }

        // Horizontal positioning
        switch(position[1]) {
            default:
            case "center":
                _wrapper.style.left = Math.round(cPageX + _paddingLeft + ( (_widthPlusPadding/2) - (_currentWidth/2) )) + "px";
                break;

            case "left":
                _wrapper.style.left = Math.round(cPageX + _paddingLeft) + "px";
                break;

            case "right":
                _wrapper.style.left = Math.round(cPageX + _container.clientWidth - _currentWidth - _paddingRight) + "px";
                break;
        }
    }

    // Initialize the resizer
    function _init() {
        // Begin loading once window is loaded
        if(!_isInitialized) {
            _isInitialized = true;

            // Get container
            _container = document.getElementById(config.containerId);

            if (config.canvasId !== "") {

                // Get the canvas/wrapper info
                _canvas = document.getElementById(config.canvasId);
                _context = _canvas.getContext("2d");

                // Set canvas width and height
                _currentWidth = config.gameFieldWidth;
                _currentHeight = config.gameFieldHeight;

                _canvas.width = _currentWidth;
                _canvas.height = _currentHeight;


                // Check if wrapper is being used
                if (config.wrapperId !== "") {
                    _wrapper = document.getElementById(config.wrapperId);

                    // The wrapper is resized while the canvas just fits to the wrapper
                    _canvas.style.width = "100%";
                    _canvas.style.height = "100%";
                }
                else {
                    _wrapper = _canvas;
                }
                
                // Wrapper must be absolutely positioned to position it correctly within container
                _wrapper.style.position = "absolute";
            }

            // Set resize events
            if (config.resizeDelay > 0) {
                window.addEventListener('resize', _debounce(_resize, config.resizeDelay, false), false);
            }
            else {
                window.addEventListener('resize', _resize, false);
            }

            // Do the first resize immediately
            _resize();

        }
        else {
            console.log("ERROR: resizer already initialized.");
        }
    }
    

    // Accessors

    function _getCanvasBoundingRect() {
        return _canvasBoundingRect;
    }

    function _getOrientation() {
        return _orientation;
    }

    function _getSizeMode() {
        return _sizeMode;
    }

    function _getCanvas() {
        if (_canvas) {
            return _canvas;
        }

        else {
            console.log("ERROR: canvas has been set to false in config.js");
            return null;
        }
    }

    function _getContainer() {
        return _container;
    }

    function _getGameWidth() {
        return config.gameFieldWidth;
    }

    function _getGameHeight() {
        return config.gameFieldHeight;
    }

    function _getCanvasWidth() {
        return _currentWidth;
    }

    function _getCanvasHeight() {
        return _currentHeight;
    }

    // Mutators

    function _addResizeEvent(func) {
        _resizeEvents.push(func);
        _numResizeEvents++;
    }

    function _removeResizeEvent(func) {
        let i = 0;
        
        // Look for the function in the array
        while (_resizeEvents[i] !== func && i < _numResizeEvents) {
            i++;
        }

        // If i is within the array length, we found the function to remove
        if (i < _numResizeEvents) {
            _resizeEvents[i] = _resizeEvents[_resizeEvents.length-1];
            _resizeEvents[_resizeEvents.length-1] = undefined;
        
            _resizeEvents.length = _resizeEvents.length-1;
        }
    }

    return {
        init: _init,
        resize: _resize,
        getOrientation: _getOrientation,
        getSizeMode: _getSizeMode,
        getCanvas: _getCanvas,
        getContainer: _getContainer,
        getGameHeight: _getGameHeight,
        getGameWidth: _getGameWidth,
        getCanvasWidth: _getCanvasWidth,
        getCanvasHeight: _getCanvasHeight,
        getCanvasBoundingRect: _getCanvasBoundingRect,
        addResizeEvent: _addResizeEvent,
        removeResizeEvent: _removeResizeEvent,
        getRelativeEventCoords: _getRelativeEventCoords
    };

})();;
resizer.init();

const GAME_FIELD_HEIGHT = resizer.getGameHeight();
const GAME_FIELD_WIDTH = resizer.getGameWidth();
const GAME_SPEED = 1.5;
const TIME = {
    DAY: 0,
    DUSK: 1,
    NIGHT: 2,
    DAWN: 3,
};
const numTimes = Object.keys(TIME).length;
const TIME_FADE = 0.01;
let currentTime = TIME.DAY;

///////////////////////////////////////
// Helper functions/objects
///////////////////////////////////////

// Clamp between two values
function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

// Random Integer, 0 thru max - 1
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Removes an element by replacing it with the last element,
// and then shortens the array
function mutableRemoveIndex(array, index) {

    if (index >= array.length) {
        console.error('ERROR: mutableRemoveIndex: index is out of range');
        return;
    }

    if (array.length <= 0) {
        console.error('ERROR: mutableRemoveIndex: empty array');
        return;
    }

    array[index] = array[array.length-1];
    array.pop();
}

// Cloneable Pool
function CloneablePool(template) {
    this.template = template;

    this.pool = [];
}

CloneablePool.prototype.take = function () {
    let obj;
    let i, len = this.pool.length;
    let poolItem = null;

    // If there is an available object, return it.
    for (i = 0; i < len; i++) {
        poolItem = this.pool[i];

        if(poolItem.available) {
            poolItem.available = false;
            poolItem.object.init();
            return poolItem.object;
        }
    }

    // Otherwise, create a new one and return it.
    obj = this.template.clone();
    obj.init();

    this.pool.push({
        available: false,
        object: obj
    });

    return obj;
};

CloneablePool.prototype.putBack = function (cloneable) {
    let poolItem;
    let i, len = this.pool.length;

    // Mark the object as available again.
    for ( i = 0; i < len; i++) {
        poolItem = this.pool[i];

        if (poolItem.object === cloneable) {
            poolItem.available = true;
            return;
        }
    }
};

// Rectangle object
function Rectangle (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rectangle.prototype.left = function () {
    return this.x;
};

Rectangle.prototype.right = function () {
    return this.x + this.width;
};

Rectangle.prototype.top = function () {
    return this.y;
};

Rectangle.prototype.bottom = function () {
    return this.y + this.height;
};

Rectangle.prototype.intersects = function (r2) {
    return this.right() >= r2.left() &&
           this.left() <= r2.right() &&

           this.top() <= r2.bottom() &&
           this.bottom() >= r2.top();
};

Rectangle.prototype.contains = function (x, y) {
    return this.left() <= x && x <= this.right() &&
           this.bottom() <= y && y <= this.top();
};

Rectangle.prototype.union = function (r2) {
    let x, y, width, height;

    if( r2 === undefined ) {
        return;
    }

    x = Math.min( this.x, r2.x );
    y = Math.min( this.y, r2.y );

    width = Math.max( this.right(), r2.right() ) -
            Math.min( this.left(), r2.left() );

    height = Math.max( this.bottom(), r2.bottom() ) -
             Math.min( this.top(), r2.top() );

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    return this;
};

Rectangle.prototype.intersection = function (r2) {
    let iLeft, iRight, iTop, iBottom;

    iLeft = Math.max(this.left(), r2.left());
    iBottom = Math.min(this.bottom(), r2.bottom());

    iRight = Math.min(this.right(), r2.right());
    iTop = Math.max(this.top(), r2.top());

    //  no intersection
    if (iLeft > iRight || iBottom < iTop) {
        this.x = -1;
        this.y = -1;
        this.width = 0;
        this.height = 0;
    }
    
    // intersection!
    else {
        this.x = iLeft;
        this.y = iTop;
        this.width = iRight - iLeft;
        this.height = iBottom - iTop;
    }


    return this;
};

Rectangle.prototype.getArea = function () {
    return (this.height * this.width);
};


// Sprite Object
function Sprite(image, width, height, frames, frameRate) {
    this.width = width;
    this.height = height;
    this.frames = frames;
    this.frameRate = frameRate;
    this.timer = 0;
    this.currentFrame = 0;
    this.image = image;
    this.animationEndEvent = null;
    this.layers = [];
    this.draw = true;
    this.foreground = false;
    this.alpha = 1;
    this.fadeAmt = 0;
}

// Constructor for event-based sprites
Sprite.prototype.eventDriven = function (imgPath, width, height, frameWidth, frameHeight, frames, frameRate, row, col, colorFilter) {
    let spriteImage = document.createElement("img");
    let image = document.createElement("img");

    spriteImage.addEventListener("load",  function myLoadHandler() {
        let spriteCanvas = document.createElement("canvas");
        let spriteContext = spriteCanvas.getContext('2d');

        spriteCanvas.width = width*frames;
        spriteCanvas.height = height;

        spriteContext.drawImage(spriteImage,
                                col*frameWidth, row*frameHeight,
                                frameWidth*frames, frameHeight,
                                0, 0,
                                width*frames, height);

        // Overlay a color filter
        if (colorFilter) {
            spriteContext.globalAlpha = 0.25;
            spriteContext.globalCompositeOperation="source-atop";
            spriteContext.fillStyle = colorFilter;
            spriteContext.fillRect(0, 0, width*frames, height);
        }

        spriteCanvas.toBlob(blob => {
            image.src = URL.createObjectURL(blob);

            image.onload = () => {
                // no longer need to read the blob so it's revoked
                URL.revokeObjectURL(image.src);
            };
        });

        spriteImage.removeEventListener("load", myLoadHandler);
    }, false);

    spriteImage.src = imgPath;

    this.width = width;
    this.height = height;
    this.frames = frames;
    this.frameRate = frameRate;
    this.image = image;

    return this;
};

// Constructor for a static, tiled image
Sprite.prototype.tiled = function (imgPath, width, height, frameWidth, frameHeight, row, col, xTiles, yTiles) {
    let spriteImage = document.createElement("img");
    let image = document.createElement("img");

    spriteImage.addEventListener("load",  function myLoadHandler() {
        let i, j;
        let spriteCanvas = document.createElement("canvas");
        let spriteContext = spriteCanvas.getContext('2d');
        
        spriteCanvas.width = width;
        spriteCanvas.height = height;

        for (i = 0; i < xTiles; i++) {
            for (j = 0; j < yTiles; j++) {
                spriteContext.drawImage(spriteImage,
                                        col*frameWidth, row*frameHeight,
                                        frameWidth, frameHeight,
                                        i*width/xTiles, j*height/yTiles,
                                        width/xTiles, height/yTiles);
            }
        }

        spriteCanvas.toBlob(blob => {
            image.src = URL.createObjectURL(blob);

            image.onload = () => {
                // no longer need to read the blob so it's revoked
                URL.revokeObjectURL(image.src);
            };
        });

        spriteImage.removeEventListener("load", myLoadHandler);
    }, false);

    spriteImage.src = imgPath;

    this.width = width;
    this.height = height;
    this.frameRate = 0;
    this.frames = 1;
    this.image = image;

    return this;
};

Sprite.prototype.resetAnimation = function () {
    this.currentFrame = 0;
};

Sprite.prototype.update = function (dt) {
    let i;

    // Fade in or out
    this.alpha = clamp(this.alpha+this.fadeAmt, 0, 1);

    // Update sprite layers
    for (i = 0; i < this.layers.length; i++) {
        this.layers[i].update(dt);
    }

    // While the sprite is animated...
    if (this.frameRate > 0) {
        this.timer += dt;
        
        // Increment the frame
        if (this.timer > 1/this.frameRate) {
            this.timer = 0;
            this.currentFrame++;

            // Run the callback after the animation finishes
            if (this.currentFrame > this.frames-1 && this.animationEndEvent !== null) {
                this.animationEndEvent();
            }
        }
    }
};

Sprite.prototype.init = function () {
    this.width = 0;
    this.height = 0;
    this.frameRate = 0;
    this.frames = 0;
    this.currentFrame = 0;
    this.timer = 0;
    this.alpha = 1;
    this.fadeAmt = 0;
    this.layers.length = 0;
    this.image = null;
    this.animationEndEvent = null;
    this.draw = true;
    this.foreground = false;
};

Sprite.prototype.clone = function () {
    return new Sprite(this.image, this.width, this.height, this.frames, this.frameRate);
};

Sprite.prototype.copyAttributes = function (otherSprite) {
    this.width = otherSprite.width;
    this.height = otherSprite.height;
    this.frameRate = otherSprite.frameRate;
    this.frames = otherSprite.frames;
    this.image = otherSprite.image;
    this.animationEndEvent = otherSprite.animationEndEvent;
    this.draw = otherSprite.draw;
    this.alpha = otherSprite.alpha;
    this.fadeAmt = otherSprite.fadeAmt;
    this.foreground = otherSprite.foreground;

    return this;
};

Sprite.prototype.addLayer = function (newSprite) {
    this.layers.push(newSprite);
};


///////////////////////////////////////
// Game entities
///////////////////////////////////////

// Entity superclass
function Entity(x, y, width, height, sprite) {
    this.x = x;
    this.y = y;

    this.xFraction = 0;
    this.yFraction = 0;

    this.time = 0;

    this.width = width;
    this.height = height;

    this.sprite = sprite;

    this.hitbox = new Rectangle(this.x - this.width/2,
                                        this.y - this.height/2,
                                        this.width,
                                        this.height);
}

Entity.prototype.init = function () {
    this.x = 0;
    this.y = 0;
    this.xFraction = 0;
    this.yFraction = 0;

    this.time = 0;
    this.sprite = null;
};

Entity.prototype.clone = function () {
    return new Entity(this.x, this.y, this.width, this.height, this.sprite);
};

// Update time step
Entity.prototype.update = function (dt) {
    let newX = this.x;
    let newY = this.y;
    let xFrac = this.xFraction;
    let yFrac= this.yFraction;

    this.time += dt;

    // Apply any fractions
    newX += xFrac;
    newY += yFrac;

    // Convert x and y to whole numbers and store leftover fractions
    xFrac = newX % 1;
    yFrac = newY % 1;

    newX -= xFrac;
    newY -= yFrac;

    // Finalize changes
    this.x = newX;
    this.y = newY;

    this.xFraction = xFrac;
    this.yFraction = yFrac;


};

// Entity rectangle collision
Entity.prototype.collisionRect = function () {
    this.hitbox.x = this.x;
    this.hitbox.y = this.y;
    this.hitbox.width = this.width;
    this.hitbox.height = this.height;

    return this.hitbox;
};

// Check collisions
Entity.prototype.isCollidingWith = function(entity2) {
    let myHitbox = this.collisionRect();
    let notMyHitbox = entity2.collisionRect();

    return myHitbox.intersects(notMyHitbox);
};


// Sound object
function Sound(filePath, audioContext, gainNode, loop=false) {
    let my = this;
    let testAudio;
    let xhr;
    
    // Initialize fields (constructor stuff)
    this.buffer = null;
    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.loop = loop;

    // Check for file type compatibility
    testAudio = document.createElement("audio");

    if (testAudio.canPlayType) {

        // Can we use a .mp4 file?
        if ( !!testAudio.canPlayType && testAudio.canPlayType('audio/mp4') !== "" ) {
            filePath += ".mp4";
        }

        // If we can't use .mp4, can we use a .ogg file?
        else if ( !!testAudio.canPlayType && testAudio.canPlayType('audio/ogg; codecs="vorbis"') !== "" ){
            filePath += ".ogg";
        }

        // Uh-oh! Neither are supported :(
        else {
            console.log("Error: MP4 and OGG files are unsupported on this device.");
            return;
        }
    }

    // Fetch the file
    xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(filePath), true);
    xhr.responseType = 'arraybuffer';

    // Oopsie doopsie, couldn't fetch the file
    xhr.addEventListener("error", function() {
        console.log('Error loading from server: ' + filePath);
    }, false);

    // On successful load, decode the audio data
    xhr.addEventListener("load", function() {

        audioContext.decodeAudioData(xhr.response,

            // Success
            function(audioBuffer) {
                my.buffer = audioBuffer;
            },

            // Error
            function(e) {
                console.log("Error decoding audio data: " + e.err);
            });
    }, false);

    xhr.send();
}

// Play function, for playing the sound
Sound.prototype.play = function() {
    let thisObject = this;

    // Play the sound only if it's been decoded already
    if (this.buffer) {
        let bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = this.buffer;
        bufferSource.connect(this.gainNode).connect(this.audioContext.destination);
        bufferSource.start(0);
        bufferSource.loop = this.loop;
    }

    // If it hasn't been decoded yet, check every 50ms to see if it's ready
    else {
        window.setTimeout(function() {
            thisObject.play();
        }, 50);
    }
};
///////////////////////////////////////
// Resources
///////////////////////////////////////
let resources = (function () {
    // Sprites
    const LANDSCAPE_WIDTH = 1920;
    const LANDSCAPE_HEIGHT = 1080;
    const FOLDER = "sprites/";

    let _spritePool = new CloneablePool(new Sprite(null, 0, 0, 0, 0));

    let _balloon = _spritePool.take().eventDriven(FOLDER+"balloon.png", 295, 470, 1180, 1880, 1, 0, 0, 0);
    let _dunes1 = _spritePool.take().eventDriven(FOLDER+"dunes1.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _dunes2 = _spritePool.take().eventDriven(FOLDER+"dunes2.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _dunes3 = _spritePool.take().eventDriven(FOLDER+"dunes3.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _dunes4 = _spritePool.take().eventDriven(FOLDER+"dunes4.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _cloudsfg = _spritePool.take().eventDriven(FOLDER+"day_fg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _cloudsbg = _spritePool.take().eventDriven(FOLDER+"day_bg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _sky = _spritePool.take().eventDriven(FOLDER+"day_sky.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);

    let _redBalloon = _spritePool.take().eventDriven(FOLDER+"balloon.png", 295, 470, 1180, 1880, 1, 0, 0, 0, "#f56342");
    let _redDunes1 = _spritePool.take().eventDriven(FOLDER+"dunes1.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "red");
    let _redDunes2 = _spritePool.take().eventDriven(FOLDER+"dunes2.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "red");
    let _redDunes3 = _spritePool.take().eventDriven(FOLDER+"dunes3.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "red");
    let _redDunes4 = _spritePool.take().eventDriven(FOLDER+"dunes4.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "red");
    let _redFg = _spritePool.take().eventDriven(FOLDER+"dawndusk_fg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _redBg = _spritePool.take().eventDriven(FOLDER+"dawndusk_bg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _redSky = _spritePool.take().eventDriven(FOLDER+"dawndusk_sky.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);

    let _blueBalloon = _spritePool.take().eventDriven(FOLDER+"balloon.png", 295, 470, 1180, 1880, 1, 0, 0, 0, "#6e7fe0");
    let _blueDunes1 = _spritePool.take().eventDriven(FOLDER+"dunes1.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "blue");
    let _blueDunes2 = _spritePool.take().eventDriven(FOLDER+"dunes2.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "blue");
    let _blueDunes3 = _spritePool.take().eventDriven(FOLDER+"dunes3.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "blue");
    let _blueDunes4 = _spritePool.take().eventDriven(FOLDER+"dunes4.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0, "blue");
    let _blueFg = _spritePool.take().eventDriven(FOLDER+"night_fg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _blueBg = _spritePool.take().eventDriven(FOLDER+"night_bg.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
    let _blueSky = _spritePool.take().eventDriven(FOLDER+"night_sky.png", LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT, GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT, 1, 0, 0, 0);
   
    // _tapIcon.animationEndEvent = _tapIcon.resetAnimation;

    // Audio
    let _audioContext;

    let _musicGainNode;
    let _sfxGainNode;

    let _masterVolume, _musicVolume, _sfxVolume;
    let _previousVolume;

    // Context
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    _audioContext = new AudioContext();
    
    // Volume control (1 = 100%)
    _masterVolume = 1;
    _musicVolume = 0.1;
    _sfxVolume = 0.15;

    // Music volume
    _musicGainNode = _audioContext.createGain();
    _musicGainNode.gain.value = _musicVolume;

    // Sound Effects volume
    _sfxGainNode = _audioContext.createGain();
    _sfxGainNode.gain.value = _sfxVolume;

    // SFX
    // let _valid = new Sound("audio/ding", _audioContext, _sfxGainNode);
    // let _error = new Sound("audio/error", _audioContext, _sfxGainNode);
    // let _bgm = new Sound("audio/bgm", _audioContext, _musicGainNode, true);

    function _initVolume() {
        let lastVol;

        // Retrieve previous session's volume
        if (typeof(Storage) !== "undefined") {
            try {
                lastVol = JSON.parse(localStorage.getItem("yao_masterVolume"));
            }
            catch(e) {
                console.log("Previous volume data is corrupted or missing.");
            }


            // Restore volume if loaded successfully
            if (lastVol || lastVol === 0) {
                _masterVolume = lastVol;
                this.setMasterVolume(lastVol);

                return lastVol;
            }
        }

        // Failed. Return null
        return null;
    }
    
    function _setMasterVolume(vol) {
        _masterVolume = vol;
            
        _sfxGainNode.gain.value = _sfxVolume * vol;
        _musicGainNode.gain.value = _musicVolume * vol;

        // Save the latest volume data
        if (typeof(Storage) !== "undefined") {
            try {
                localStorage.setItem('yao_masterVolume', JSON.stringify(_masterVolume));
            }
            catch (e) {
                console.log("Error: an issue occurred when saving volume data.");
            }
        }
    }

    function _mute() {
        _previousVolume = _masterVolume;
        _setMasterVolume(0);
    }

    function _unmute() {
        _setMasterVolume(_previousVolume);
    }

    function _putSpriteBack(spr) {
        let i;

        for (i = spr.layers.length; i >= 0; i--) {
            _spritePool.putBack(spr.layers[i]);
            //spr.layers.length--;
        }

        _spritePool.putBack(spr);
    }

    return {
        
        spr_sky: function() { return _spritePool.take().copyAttributes(_sky); },
        spr_dunes1: function() { return _spritePool.take().copyAttributes(_dunes1); },
        spr_dunes2: function() { return _spritePool.take().copyAttributes(_dunes2); },
        spr_dunes3: function() { return _spritePool.take().copyAttributes(_dunes3); },
        spr_dunes4: function() { return _spritePool.take().copyAttributes(_dunes4); },
        spr_cloudsfg: function() { return _spritePool.take().copyAttributes(_cloudsfg); },
        spr_cloudsbg: function() { return _spritePool.take().copyAttributes(_cloudsbg); },
        spr_balloon: function() { return _spritePool.take().copyAttributes(_balloon); },
        
        spr_redSky: function() { return _spritePool.take().copyAttributes(_redSky); },
        spr_redDunes1: function() { return _spritePool.take().copyAttributes(_redDunes1); },
        spr_redDunes2: function() { return _spritePool.take().copyAttributes(_redDunes2); },
        spr_redDunes3: function() { return _spritePool.take().copyAttributes(_redDunes3); },
        spr_redDunes4: function() { return _spritePool.take().copyAttributes(_redDunes4); },
        spr_redCloudsfg: function() { return _spritePool.take().copyAttributes(_redFg); },
        spr_redCloudsbg: function() { return _spritePool.take().copyAttributes(_redBg); },
        spr_redBalloon: function() { return _spritePool.take().copyAttributes(_redBalloon); },

        spr_blueSky: function() { return _spritePool.take().copyAttributes(_blueSky); },
        spr_blueDunes1: function() { return _spritePool.take().copyAttributes(_blueDunes1); },
        spr_blueDunes2: function() { return _spritePool.take().copyAttributes(_blueDunes2); },
        spr_blueDunes3: function() { return _spritePool.take().copyAttributes(_blueDunes3); },
        spr_blueDunes4: function() { return _spritePool.take().copyAttributes(_blueDunes4); },
        spr_blueCloudsfg: function() { return _spritePool.take().copyAttributes(_blueFg); },
        spr_blueCloudsbg: function() { return _spritePool.take().copyAttributes(_blueBg); },
        spr_blueBalloon: function() { return _spritePool.take().copyAttributes(_blueBalloon); },


        // snd_valid: _valid,
        // snd_error: _error,
        // snd_bgm: _bgm,

        initVolume: _initVolume,
        setMasterVolume: _setMasterVolume,

        mute: _mute,
        unmute: _unmute,

        putSpriteBack: _putSpriteBack,
    };
})();;
///////////////////////////////////////
// Renderer
///////////////////////////////////////

let renderer = (function () {
    // Variables
    let _canvas = resizer.getCanvas();
    let _context = _canvas.getContext("2d", { alpha: false });

    let _fgObjects = [];

    // Draw a sprite to the context
    function _drawSprite(sprite, x, y) {
        let layers = sprite.layers;
        let original = sprite;
        let i;

        // Draw the sprite and each layer
        for(i = 0; i <= layers.length; i++) {
            sprite = layers[i];

            if (i === layers.length) {
                sprite = original;
            }

            // If the image is static or the animation reached its end,
            // only draw the last frame (sometimes the only frame)
            if (sprite.draw &&
                (sprite.frameRate <= 0 || sprite.currentFrame >= sprite.frames)) {

                // Apply opacity
                _context.save();
                _context.globalAlpha = sprite.alpha;
                
                // Draw the image
                _context.drawImage(sprite.image,
                                    sprite.width*(sprite.frames-1), 0,
                                    sprite.width, sprite.height,
                                    x, y,
                                    sprite.width, sprite.height);

                // Restore to normal opacity for everything else
                _context.restore();
            }

            // Otherwise, draw the correct frame of the animated sprite
            else if (sprite.draw) {

                // Apply opacity
                _context.save();
                _context.globalAlpha = sprite.alpha;

                // Draw the image
                _context.drawImage(sprite.image,
                                    sprite.width*sprite.currentFrame, 0,
                                    sprite.width, sprite.height,
                                    x, y,
                                    sprite.width, sprite.height);

                // Restore to normal opacity for everything else
                _context.restore();
            }
        }
        
    }

    // Draw moving parallax background
    let _drawBG = (function () {
        let movingSpeed = GAME_SPEED;
        let sky = resources.spr_sky();
        let dunes1 = resources.spr_dunes1();
        let dunes2 = resources.spr_dunes2();
        let dunes3 = resources.spr_dunes3();
        let dunes4 = resources.spr_dunes4();
        let cloudsfg = resources.spr_cloudsfg();
        let cloudsbg = resources.spr_cloudsbg();

        let redSky = resources.spr_redSky();
        let redDunes1 = resources.spr_redDunes1();
        let redDunes2 = resources.spr_redDunes2();
        let redDunes3 = resources.spr_redDunes3();
        let redDunes4 = resources.spr_redDunes4();
        let redCloudsfg = resources.spr_redCloudsfg();
        let redCloudsbg = resources.spr_redCloudsbg();

        let blueSky = resources.spr_blueSky();
        let blueDunes1 = resources.spr_blueDunes1();
        let blueDunes2 = resources.spr_blueDunes2();
        let blueDunes3 = resources.spr_blueDunes3();
        let blueDunes4 = resources.spr_blueDunes4();
        let blueCloudsfg = resources.spr_blueCloudsfg();
        let blueCloudsbg = resources.spr_blueCloudsbg();
        
        let bgs = [cloudsbg, cloudsfg, dunes4, dunes3, dunes2, dunes1];
        let redBgs = [redCloudsbg, redCloudsfg, redDunes4, redDunes3, redDunes2, redDunes1];
        let blueBgs = [blueCloudsbg, blueCloudsfg, blueDunes4, blueDunes3, blueDunes2, blueDunes1];
        let bgSpds = [0.1, 0.2, 0.25, 0.35, 0.6, 1];
        let bgPos = new Array(bgs.length).fill(0);

        for (let i = 0; i < bgs.length; i++) {
            redBgs[i].alpha = 0;
            blueBgs[i].alpha = 0;
        }
        redSky.alpha = 0;
        blueSky.alpha = 0;

        let previousTime = currentTime;
        let skyToDraw, bgsToDraw;

        return function () {
            if (previousTime !== currentTime) {
                skyToDraw.fadeAmt = -TIME_FADE;
                for (const bg of bgsToDraw) {
                    bg.fadeAmt = -TIME_FADE;
                }
            }

            switch(currentTime) {
                case TIME.DAY:
                    skyToDraw = sky;
                    bgsToDraw = bgs;
                    break;
                case TIME.DUSK:
                    skyToDraw = redSky;
                    bgsToDraw = redBgs;
                    break;
                case TIME.NIGHT:
                    skyToDraw = blueSky;
                    bgsToDraw = blueBgs;
                    break;
                case TIME.DAWN:
                    skyToDraw = redSky;
                    bgsToDraw = redBgs;
                    break;
            }

            if (previousTime !== currentTime) {
                previousTime = currentTime;
                skyToDraw.fadeAmt = TIME_FADE;
                for (const bg of bgsToDraw) {
                    bg.fadeAmt = TIME_FADE*4; // fade in faster than previous fades out
                }
            }

            sky.update();
            blueSky.update();
            redSky.update();

            _drawSprite(sky, 0, 0);
            _drawSprite(blueSky, 0, 0);
            _drawSprite(redSky, 0, 0);

            let moveRatio = 0;
            for (let i = 0; i < bgs.length; i++) {
                let x = Math.round(bgPos[i]);

                bgs[i].update();
                redBgs[i].update();
                blueBgs[i].update();

                _drawSprite(bgs[i], x+GAME_FIELD_WIDTH, 0);
                _drawSprite(bgs[i], x, 0);

                _drawSprite(redBgs[i], x+GAME_FIELD_WIDTH, 0);
                _drawSprite(redBgs[i], x, 0);

                _drawSprite(blueBgs[i], x+GAME_FIELD_WIDTH, 0);
                _drawSprite(blueBgs[i], x, 0);

                moveRatio = bgSpds[i];//+= 1/bgs.length;
                if (game.accelerating()) {
                    bgPos[i] = (bgPos[i]-(movingSpeed*moveRatio)) % GAME_FIELD_WIDTH;
                }
            }
            
        };
    })();

    // Render game elements and entities
    function _render(dt) {
        let entity;
        let entities = game.entities();
        let i, len;

        // Fill background
        _drawBG();


        if (entities) {
            len = entities.length;

            // Draw every game entity and update their sprites
            for (i = 0; i < len; i++) {
                entity = entities[i];

                // Only render the enemy if it actually has a sprite to render
                if (entity.sprite) {
                    // Update the sprite animation if the game is not paused
                    if (game.accelerating() || entity.sprite.fadeAmt !== 0) {
                        entity.sprite.update(dt);
                    }

                    // Save foreground sprites for drawing after everyone else
                    if (entity.sprite.foreground) {
                        _fgObjects.push(entity);
                    }

                    // Otherwise draw normally
                    else {
                        _drawSprite(entity.sprite, entity.x/*-(entity.width/4)*/, entity.y/*-(entity.height/2)*/);
                    }
                }
            }

            for (i = 0; i < _fgObjects.length; i++) {
                entity = _fgObjects[i];
                _drawSprite(entity.sprite, entity.x, entity.y);
            }
            _fgObjects.length = 0;
        }
    }


    return {
        render: _render,
        canvas: _canvas
    };

})();;
///////////////////////////////////////
// Game
///////////////////////////////////////

let game = (function() {

    let _entities;

    let _lastFrameTime;
    
    let _accelerating;

    let _started = false;

    let _updateFunc;

    let _balloon, _ogX, _ogY;
    let _baseAcc = 0.001;
    let _balloonAcc = _baseAcc;
    let _balloonVelocity = _balloonAcc;
    const _balloonOscillation = 60;// will only oscillate x pixels
    const _maxVelocity = 0.1;
    const _balloonSprite = resources.spr_balloon();
    const _redBalloonSprite = resources.spr_redBalloon();
    const _blueBalloonSprite = resources.spr_blueBalloon();
    const _balloonSprites = new Array(numTimes);
    _balloonSprites[TIME.DAY] = _balloonSprite;
    _balloonSprites[TIME.DUSK] = _redBalloonSprite;
    _balloonSprites[TIME.NIGHT] = _blueBalloonSprite;
    _balloonSprites[TIME.DAWN] = _redBalloonSprite;



    // Speed up wave until past player; player cannot move during this time
    function _toggleAcceleration() {
        _accelerating = !_accelerating;
    }


    // Start game
    function _start() {
        if (_entities) { 
            _removeEntities(_entities);
        }
        _entities = [];
        _accelerating = true;
        _lastFrameTime = 0;

        const midX = Math.round(GAME_FIELD_WIDTH/2 - _balloonSprite.width/2);
        const midY = Math.round(GAME_FIELD_HEIGHT/2 - _balloonSprite.height/2);
        let balloonSprite = _balloonSprites[currentTime];
        _balloon = new Entity(midX, midY, balloonSprite.width, balloonSprite.height, balloonSprite);
        
        _ogX = _balloon.x;
        _ogY = _balloon.y;
        _addEntity(_balloon);

        // Begin game loop
        if (!_started) {
            _started = true;
            _updateFunc = this.update.bind(this);

            window.requestAnimationFrame(_updateFunc);
        }
    }

    // Add an entity into the game
    function _addEntity(entity) {
        _entities.push(entity);
    }

    // Remove entities from game
    function _removeEntities(entitiesToRemove) {
        let i, j, len = entitiesToRemove.length;

        // Don't do anything if no entities to remove
        if (len === 0) {
            return;
        }
        
        // Go through the arrays and remove those in the kill list
        // (note: because of mutableRemoveIndex, we have to count down
        //  to 0; if counting up to len, i will surpass the length of
        //  the array due to length changing as entities are removed)
        for (i = len-1; i >= 0; i--) {
            let entityToRemove = entitiesToRemove[i];
            let idxToRemove;

            // Put back the entity's sprite (and each of its layers)
            if (entityToRemove.sprite !== null) {

                // Original sprite
                resources.putSpriteBack(entityToRemove.sprite);
            }

            // General entities array
            idxToRemove = _entities.indexOf(entityToRemove);
            
            // Only remove if it's actually there
            if (idxToRemove >= 0) {
                mutableRemoveIndex(_entities, idxToRemove);
            }
        }
    }

    // Update game
    function _update(time) {
        let entity;
        let i, len = _entities.length;

        // Smooth FPS
        let dt = Math.min((time - _lastFrameTime) / 1000, 3/60);

        _lastFrameTime = time;

        // Update all entities
        for (i = 0; i < len; i++) {
            entity = _entities[i];

            if (_accelerating) {
                entity.update(dt);

                _balloon.sprite = _balloonSprites[currentTime];

                _balloonVelocity += _balloonAcc;
                _balloonVelocity = clamp(_balloonVelocity, -_maxVelocity, _maxVelocity);
                _balloon.y += _balloonVelocity;

                // reverse directions
                if (_balloon.y >= _ogY+_balloonOscillation) {

                    _balloonAcc = -_baseAcc;
                }
                else if (_balloon.y <= _ogY-_balloonOscillation) {
                    _balloonAcc = _baseAcc;
                }
            }
        }

        // pause
        // _toggleAcceleration();

        // Render frame
        renderer.render(dt);

        // Loop
        window.requestAnimationFrame(_updateFunc);
    }

    

    return {
        start: _start,
        update: _update,
        toggleAcceleration: _toggleAcceleration,
        addEntity: _addEntity,
        accelerating: function() { return _accelerating; },
        started: function() { return _started; },
        entities: function () { return _entities; },
    };


})();




///////////////////////////////////////
// Main Logic
///////////////////////////////////////

const changeNextVerse = (()=>{
    const verses = document.querySelectorAll("#poem-modal p");
    const verseTimes = [
        TIME.DAY,
        TIME.DAY,
        TIME.DUSK,
        TIME.DUSK,
        TIME.NIGHT,
        TIME.NIGHT,
        TIME.DAWN,
        TIME.DAWN
    ];
    let currentVerse = -1;

    return function() {
        if (currentVerse >= 0) {
            verses[currentVerse].classList.remove("show");
        }
        currentVerse = (currentVerse+1)%verses.length;
        verses[currentVerse].classList.add("show");

        currentTime = verseTimes[currentVerse];//(currentTime+1)%numTimes;
    };
})();


// Prevent stuff like user scrolling
// Passive: false is required for it to register
document.body.addEventListener("touchmove", function (e) {
    e.preventDefault();
}, { passive: false });

//todo: add loaders

window.addEventListener("load", ()=>{

     // Wait for 5 seconds to see the loader epicly
     window.setTimeout(()=>{
        const nextBtn = document.getElementById("next-btn");
        const nextBtnArrow = nextBtn.querySelector("div");
        const loader = document.querySelector("#loader");
        const canvasWrapper = document.querySelector("#canvas-wrapper");
        const canvas = document.querySelector("#game-canvas");
        const title = document.querySelector("#poem-modal p");

        // animate button clicks
        nextBtn.addEventListener("animationend", ()=>{
            nextBtnArrow.classList.remove("bounce-animation");
        });
        nextBtn.addEventListener("click", ()=>{
            changeNextVerse();
            nextBtnArrow.classList.add("bounce-animation");
            // nextBtn.style.animationPlayState = "running";
        });

        // remove loading class from #canvas-wrapper and .side-btn
        // add loaded class to loader svg
        
        loader.classList.add("loaded");
        loader.addEventListener("animationend", function load() {
            loader.removeEventListener("animationend", load);
            canvasWrapper.classList.remove("loading");
            
            changeNextVerse();
            title.addEventListener("transitionend", function showCanvas(){
                title.removeEventListener("transitionend", showCanvas);
                canvasWrapper.classList.add("loaded");
            });

            canvas.addEventListener("transitionend", function showSideBtn() {
                canvas.removeEventListener("transitionend", showSideBtn);
                nextBtn.classList.remove("loading");
            });

            game.start();
        });

    }, 3000);
    
}, false);


})();