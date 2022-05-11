;const activateTracing = (function(){
    "use strict";

    // Configuration
    const BRUSH_RADIUS = 20;
    const REQUIRED_FILL_PERCENT = 0.90;
    const NUM_VALUES_IN_RGBA = 4;

    // Variables for bookkeeping (pun unintended)
    let totalPixelsToTrace = 0;
    let tracedPixels = new Set();
    let requiredPixels;

    let drawing = false;
    let imgData, pixels;

    /** Given an (x,y) coordinate, returns the corresponding index for
    * a 1D array representation of the same image.
    */
    function getPixelIndex(context, x, y) {
        const oneRow = context.canvas.width * NUM_VALUES_IN_RGBA;
        return (x*NUM_VALUES_IN_RGBA) + (y*oneRow);
    }

    /** Returns the rgba values of the pixel at the given coordinates
     * in the form: [r, g, b, a]
    */
    function getPixelColor(context, x, y) {
        const rIndex = getPixelIndex(context, x, y);

        const r = pixels[rIndex];
        const g = pixels[rIndex+1];
        const b = pixels[rIndex+2];
        const a = pixels[rIndex+3];

        return [r, g, b, a];
    }

    /** Changes the color of the pixel at the given coordinates.
     * Returns the new color.
     */
    function setPixelColor(context, x, y, rgba) {
        const rIndex = getPixelIndex(context, x, y);
        let [r,g,b,a] = rgba;

        pixels[rIndex] = r;
        pixels[rIndex+1] = g;
        pixels[rIndex+2] = b;
        pixels[rIndex+3] = a;

        context.putImageData(imgData, 0, 0, x, y, 1, 1);

        return rgba;
    }

    /** Draws a circle of given size to the given canvas context.
     * Note: the circle will only be drawn over pixels that have non-zero alpha.
    */
    function drawCircle(context, centerX, centerY, radius) {

        // Calculate a square that would perfectly contain the circle
        let left = centerX - radius;
        let top = centerY - radius;
        let right = centerX + radius;
        let bottom = centerY + radius;

        // Iterate over each pixel in that square
        for (let x = left; x < right; x++) {
            for (let y = top; y < bottom; y++) {

                let distFromCenter = utility.getDistance(x, y, centerX, centerY);
                let [r,g,b,a] = getPixelColor(context, x, y);

                // If this pixel would be within the circle, and
                // if this pixel is not transparent...
                if (distFromCenter <= radius && a > 0) {
                    
                    // Change the alpha value to darken the pixel
                    a = 200;
                    setPixelColor(context, x, y, [r,g,b,a]);

                    // Keep track of how many pixels we've colored in
                    tracedPixels.add(getPixelIndex(context, x, y));
                }
            }
        }
    }

    /** Calculates appropriate sizing of radiance animation */
    function initAnimation(animElement, containerWidth) {
        const spritesheetWidth = utility.cssVariableToNum(animElement, '--spritesheet-width')
        const tileSize = utility.cssVariableToNum(animElement, '--tile-size');

        const requiredScaling = containerWidth/tileSize;
        const newWidth = Math.round(requiredScaling*spritesheetWidth)+'px';
        const newHeight = Math.round(requiredScaling*tileSize)+'px';

        // Update CSS with new calculated size
        animElement.style.setProperty('--spritesheet-width', newWidth);
        
        animElement.style.backgroundSize = newWidth+' '+newHeight;
        animElement.style.width = newHeight;
        animElement.style.height = newHeight;
    }

    /** Sets up the given elements to enable the tracing minigame. */
    return function(gameContainer, completionAnimation, completionLink) {

        // Initialize the animation that shows upon completion of the minigame
        initAnimation(completionAnimation, gameContainer.clientWidth);

        // Variable setup
        const tracingGameCanvas = gameContainer.querySelector('canvas.tracing-game');
        const context = tracingGameCanvas.getContext('2d');

        const imgToTrace = tracingGameCanvas.querySelector('img');
        const imgHeight = imgToTrace.clientHeight;
        const imgWidth = imgToTrace.clientWidth;

        // Initialize canvas sizing and draw the image that needs to be traced
        tracingGameCanvas.height = imgHeight;
        tracingGameCanvas.width = imgWidth;
        context.drawImage(imgToTrace, 0, 0);

        // Get pixel info from the image
        imgData = context.getImageData(0, 0, imgWidth, imgHeight);
        pixels = imgData.data;

        // Record how many colored pixels there are
        for (let i = 3; i < pixels.length; i += NUM_VALUES_IN_RGBA) {
            const pixelAlpha = pixels[i];
            if (pixelAlpha > 0) {
                totalPixelsToTrace++;
            }
        }

        // Calculate the number of pixels that need to be colored to "win"
        requiredPixels = totalPixelsToTrace * REQUIRED_FILL_PERCENT;

        // On mousedown, immediately color in some pixels on the image wherever
        // the mouse currently is at
        tracingGameCanvas.addEventListener('mousedown', event => {
            const target = utility.getEventTarget(event);
            const {x, y} = utility.getRelativeCanvasCoords(target, event);
            drawing = true;
            drawCircle(context, x, y, BRUSH_RADIUS);
        });

        // On mouseup, check if the image has been colored in satisfactorily
        window.addEventListener('mouseup', ()=>{
            if (drawing && tracedPixels.size >= requiredPixels) {

                // Play the completion animation and show the "reward" (a link)
                completionAnimation.style.display = 'block';
                completionAnimation.style.animationPlayState = 'running';
                completionAnimation.addEventListener('animationend', ()=>{
                    completionAnimation.style.backgroundColor = 'white';
                    completionLink.style.visibility = 'visible';
                    completionLink.style.opacity = 1;
                });
            }

            drawing = false;
        });

        // When user clicks & drags over image, color in pixels as the
        // mouse moves
        tracingGameCanvas.addEventListener('mousemove', event => {
            if (drawing) {
                const target = utility.getEventTarget(event);
                const {x, y} = utility.getRelativeCanvasCoords(target, event);
                drawCircle(context, x, y, BRUSH_RADIUS);
            }
        });
    };


})();