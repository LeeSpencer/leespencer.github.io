;const imports = (function() {
    "use strict";

    // requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
    let requestAnimFrame = (function(){
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
    })();

    ////////////////////////////////////
    // Imported snippets from elsewhere
    ////////////////////////////////////

    function getEventTarget(e) {
        e = e || window.event;
        return e.target || e.srcElement;
    }

    function getcumulativeOffset(element) {
        let top = 0, left = 0;
        do {
            top += element.offsetTop   || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);
    
        return {
            top: top,
            left: left
        };
    }

    function getRelativeCanvasCoords(canvas, event) {
        // Scale coords correctly
        let canvasRect = canvas.getBoundingClientRect();
        let scale = canvasRect.width / canvas.width;

        // Get x and y values
        let x = event.pageX - canvasRect.x;
        let y = event.pageY - canvasRect.y;

        return {
            x: Math.round(x/scale),
            y: Math.round(y/scale)
        };
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
    }

    return {
        requestAnimFrame: requestAnimFrame.bind(window),
        getEventTarget: getEventTarget,
        getcumulativeOffset: getcumulativeOffset,
        getRelativeCanvasCoords: getRelativeCanvasCoords,
        getDistance: getDistance
    };
})();