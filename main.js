;(function() {
    "use strict";

    /////////////////////////////////////////////////
    // Imported code from scrollTo.js:
    // https://gist.github.com/james2doyle/5694700
    /////////////////////////////////////////////////

    // easing functions http://goo.gl/5HLl8
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) {
        return c/2*t*t + b
        }
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }
    
    Math.easeInCubic = function(t, b, c, d) {
        let tc = (t/=d)*t*t;
        return b+c*(tc);
    };
    
    Math.inOutQuintic = function(t, b, c, d) {
        let ts = (t/=d)*t,
        tc = ts*t;
        return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
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
            let val = Math.easeInOutQuad(currentTime, start, change, duration);
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

    let cumulativeOffset = function(element) {
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
    };

    /////////////////////////////////
    // Spencer's Code
    /////////////////////////////////

    let isNavVisible = false;
    let mobileNavBar = document.getElementById("mobile-nav");
    let desktopNavBar = document.getElementById("topnav");
    let hamburger = document.getElementById("hamburger-icon");
    let viewResume = document.getElementById("view-resume");

    // Hide all no-JS elements (because if we're here, obviously
    // JavaScript is enabled)
    let noJSElements = document.querySelectorAll(".no-js");

    for (let i = 0; i < noJSElements.length; i++) {
        noJSElements[i].style.display = "none";
    }

    // Show all JS elements
    let jsElements = document.querySelectorAll(".js");

    for (let i = 0; i < jsElements.length; i++) {
        jsElements[i].style.display = "block";
    }


    // Toggle between adding and removing the "responsive" class 
    // to topnav when the user clicks on the icon
    function toggleNav() {
        isNavVisible = !isNavVisible;

        if (isNavVisible) {
            mobileNavBar.style.visibility = "visible";
            mobileNavBar.style.transition = "height 1s ease, opacity 2s ease";
            mobileNavBar.style.height = window.innerHeight + "px";
            mobileNavBar.style.top = "100%";
            mobileNavBar.style.opacity = "1";
        }
        else {
            mobileNavBar.style.visibility = "hidden";
            mobileNavBar.style.transition = "height 1s ease, opacity 0.5s ease, visibility 0.5s ease";
            mobileNavBar.style.height = "0px";
            mobileNavBar.style.top = -1 * window.innerHieght + "px";
            mobileNavBar.style.opacity = "0";
        }
    }


    // Handler function when user clicks on an <a> link--scrolls down on page
    function samePageLinkHandler(event) {
        let target = getEventTarget(event);

        if (target.tagName.toLowerCase() === "a" && target.dataset.targetelement) {
            let elementToScrollTo = document.getElementById(target.dataset.targetelement);
            let elementPos = cumulativeOffset(elementToScrollTo).top - 40;
            scrollTo(elementPos, null, 750);
        }
    }

    // Add event listeners
    hamburger.addEventListener("click", toggleNav, false);
    mobileNavBar.addEventListener("click", function(e) {
        samePageLinkHandler(e);
        toggleNav();
    }, false);
    desktopNavBar.addEventListener("click", samePageLinkHandler, false);
    viewResume.addEventListener("click", samePageLinkHandler, false);


    function Line(str, canvas, x, y, fontSize) {
        this.string = str;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
    }

    Line.prototype.draw = function() {
        this.context.fillText(this.string, this.x, this.y);
    };

    Line.prototype.highlight = function() {
        this.context.fillRect(this.x, this.y, this.canvas.width, this.fontSize);
    };
    
    // "About Me" Terminal
    let aboutSection = document.getElementById("about");
    aboutSection.style.height = (window.innerHeight/3) + "px";

    // Initialize the resizer
    resizer.init();

    // Grab the canvas and context
    let aboutCanvas = resizer.getCanvas();
    let aboutContext = aboutCanvas.getContext("2d");

    const FONT_COLOR = "#00FF00";
    const FONT = "40px Courier New";

    // Begin the terminal when it scrolls into view
    let observer = new IntersectionObserver(function(entries) {
        let i;

        for (i = 0; i < entries.length; i++) {
            // isIntersecting is true when element and viewport are overlapping
            // isIntersecting is false when element and viewport don't overlap
            if(entries[i].isIntersecting === true) {
                aboutContext.font = FONT;
                aboutContext.fillStyle = FONT_COLOR;
                typeLine("About Spencer [ver. 1.0.0]\n\n"+
                         "> Click Here", aboutContext, 50, 50);
                observer.unobserve(entries[i].target);
            }
        }
    }, { threshold: [0] });
    
    observer.observe(aboutCanvas);

    let typeLine = (function() {
        // The number of frames it takes to type one character
        const TYPE_TIME = 4;
        
        // Overall font size
        const FONT_SIZE = 40;

        // Spacing (px) between each character
        const SPACE = 0;

        // Counter of frames passed; rolls over after the type time
        let frame = 1;

        let isTyping = false;

        let theCharacters, theContext, theX, theY, originX, originY;
        let i;
        
        return function (str, context, x, y) {
            if (!isTyping) {
                isTyping = true;

                theCharacters = str.split("");
                theContext = context;
                theX = x;
                originX = x;
                theY = y;
                originY = y;

                i = 0;
            }

            
            if (frame === TYPE_TIME) {

                if (theCharacters[i] === "\n") {
                    theY += FONT_SIZE;
                    theX = originX;
                }
                else {
                    theContext.fillText(theCharacters[i], theX, theY);
                    theX += Math.round((FONT_SIZE * (5/8)) + SPACE);
                }
                
                if (++i >= theCharacters.length) {
                    isTyping = false;
                    return;
                }
            }

            frame = (frame%TYPE_TIME) + 1;

            requestAnimFrame(typeLine);
        };
    })();

})();