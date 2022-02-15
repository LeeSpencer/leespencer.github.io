;let imports = (function() {
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

    function cumulativeOffset(element) {
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

    return {
        requestAnimFrame: requestAnimFrame.bind(window),
        scrollTo: scrollTo,
        getEventTarget: getEventTarget,
        cumulativeOffset: cumulativeOffset
    };
})();