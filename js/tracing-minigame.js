;const activateTracing = (function(){
    "use strict";

    const RESUME_URL = 'https://drive.google.com/file/d/1htR4nr4oxCVCmspR5BA6zkn4cuJyZVc8/preview';

    const BRUSH_RADIUS = 20;
    const RGBA_VALUES = 4;
    const REQUIRED_FILL_PERCENT = 0.90;

    let totalPixelsToTrace = 0;
    let tracedPixels = new Set();
    let requiredPixels;

    let drawing = false;
    let imgData, pixels;

    function getPixelIndex(context, x, y) {
        const oneRow = context.canvas.width * RGBA_VALUES;
        return (x*RGBA_VALUES) + (y*oneRow);
    }

    function getPixelColor(context, x, y) {
        const rIndex = getPixelIndex(context, x, y);

        const r = pixels[rIndex];
        const g = pixels[rIndex+1];
        const b = pixels[rIndex+2];
        const a = pixels[rIndex+3];

        return [r, g, b, a];
    }

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

    function drawCircle(context, centerX, centerY, radius) {
        let left = centerX - radius;
        let top = centerY - radius;
        let right = centerX + radius;
        let bottom = centerY + radius;

        // let startIndex = getPixelIndex(left, top);
        // let endIndex = getPixelIndex(right, bottom);
        // const imgDataCopy = new ImageData(
        //     new Uint8ClampedArray(imgData),
        //     radius*2, radius*2
        // );

        for (let x = left; x < right; x++) {
            for (let y = top; y < bottom; y++) {
                let distFromCenter = imports.getDistance(x, y, centerX, centerY);
                let [r,g,b,a] = getPixelColor(context, x, y);
                if (distFromCenter <= radius &&
                    a > 0) {
                    // change alpha of the pixel at (x,y)
                    a = 200;
                    setPixelColor(context, x, y, [r,g,b,a]);
                    tracedPixels.add(getPixelIndex(context, x, y));
                }
            }
        }
    }

    window.addEventListener('load', () => {
        const tracingGameCanvas = document.querySelector('canvas.tracing-game');

        const imgToTrace = tracingGameCanvas.querySelector('img');
        const imgHeight = imgToTrace.clientHeight;
        const imgWidth = imgToTrace.clientWidth;

        tracingGameCanvas.height = imgHeight;
        tracingGameCanvas.width = imgWidth;

        const context = tracingGameCanvas.getContext('2d');
        context.drawImage(imgToTrace, 0, 0);

        imgData = context.getImageData(0, 0, imgWidth, imgHeight);
        pixels = imgData.data;

        // check how many color pixels there are
        for (let i = 3; i < pixels.length; i += RGBA_VALUES) {
            const pixelAlpha = pixels[i];
            if (pixelAlpha > 0) {
                totalPixelsToTrace++;
            }
        }
        requiredPixels = totalPixelsToTrace * REQUIRED_FILL_PERCENT;

        tracingGameCanvas.addEventListener('mousedown', event => {
            
            const target = imports.getEventTarget(event);

            // Get x and y values
            const {x, y} = imports.getRelativeCanvasCoords(target, event);
            drawCircle(context, x, y, BRUSH_RADIUS);

            drawing = true;
        });

        window.addEventListener('mouseup', ()=>{
            drawing = false;
            if (tracedPixels.size >= requiredPixels) {
                window.open(RESUME_URL, '_blank') ||
                alert('Oops! Some protective charms are preventing us from opening a new tab. Use the following link to view my resume instead: '+RESUME_URL);
                // show modal with link to resume "oops tabs not enabled plz click this link"
                // OR show the sparkly animation
                // OR flip page to error page
            }
        });

        tracingGameCanvas.addEventListener('mousemove', event => {
            if (drawing) {
                const target = imports.getEventTarget(event);

                // Get x and y values
                const {x, y} = imports.getRelativeCanvasCoords(target, event);
                drawCircle(context, x, y, BRUSH_RADIUS);
            }
        });
    });


})();