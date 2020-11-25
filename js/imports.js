;let imports = (function() {
    "use strict";

    /////////////////////////////////////////////////
    // Imported code from scrollTo.js:
    // https://gist.github.com/james2doyle/5694700
    /////////////////////////////////////////////////

    // easing functions http://goo.gl/5HLl8
    function easeInOutQuad(t, b, c, d) {
        t /= d/2;
        if (t < 1) {
        return c/2*t*t + b
        }
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }
    
    function easeInCubic(t, b, c, d) {
        let tc = (t/=d)*t*t;
        return b+c*(tc);
    };

    // requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
    let requestAnimFrame = (function(){
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
    })();
    
    function scrollTo(to, callback, duration) {
        // because it's so difficult to detect the scrolling element, just move them all
        function move(amount) {
            document.documentElement.scrollTop = amount;
            document.body.parentNode.scrollTop = amount;
            document.body.scrollTop = amount;
        }
        function position() {
            return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
        }

        let start = position(),
        change = to - start,
        currentTime = 0,
        increment = 20;
        duration = (typeof(duration) === 'undefined') ? 500 : duration;
        let animateScroll = function() {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            let val = easeInOutQuad(currentTime, start, change, duration);
            // move the document.body
            move(val);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimFrame(animateScroll);
            }
            else if (callback && typeof(callback) === 'function') {
                    // the animation is done so lets callback
                    callback();
            }
        };


        animateScroll();
    }

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
        easeInOutQuad: easeInOutQuad,
        easeInCubic: easeInCubic,
        requestAnimFrame: requestAnimFrame.bind(window),
        scrollTo: scrollTo,
        getEventTarget: getEventTarget,
        cumulativeOffset: cumulativeOffset
    };
})();