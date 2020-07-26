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

    const FONT_COLOR = "#00FF00";
    const BG_COLOR = "#000000";
    const FONT_SIZE = 24;
    const FONT_FAMILY = "Courier New";

    function Line(str, canvas, x, y) {
        this.string = str;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;

        this.highlighted = false;
    }

    Line.prototype.draw = function() {
        this.context.fillStyle = FONT_COLOR;

        if (this.highlighted) {
            this.context.fillRect(0, this.y-FONT_SIZE, this.canvas.width, FONT_SIZE*1.2);
            this.context.fillStyle = BG_COLOR;
        }
        
        this.context.font = FONT_SIZE + "px " + FONT_FAMILY;
        this.context.fillText(this.string, this.x, this.y);
    };

    Line.prototype.append = function (str) {
        this.string += str;
    };

    Line.prototype.setSelectable = function(callback) {
        let thisLine = this;
        // create div with hover event?
        //let lineDiv = document.createElement("div");

        this.canvas.addEventListener("mousemove", function(event) {
            let mouseCoords = resizer.getRelativeEventCoords(event);

            thisLine.highlighted = (thisLine.y-FONT_SIZE <= mouseCoords.y && mouseCoords.y <= (thisLine.y+FONT_SIZE*0.2));
            
        }, false);
        this.canvas.addEventListener("click", function(event) {
            let mouseCoords = resizer.getRelativeEventCoords(event);

            if (thisLine.y-FONT_SIZE <= mouseCoords.y && mouseCoords.y <= (thisLine.y+FONT_SIZE*0.2)) {
                callback();
            }
            
        }, false);
        /*this.canvas.addEventListener("mouseleave", function() {
            thisLine.highlighted = false;
        }, false);*/

        //lineDiv.className = "terminal-line";
        //lineDiv.style.height = FONT_SIZE + "px";
        //lineDiv.style.top = this.y + "px";

        //this.canvas.parentElement.appendChild(lineDiv);
    };
    
    // "About Me" Terminal
    let aboutSection = document.getElementById("about");
    aboutSection.style.height = (window.innerHeight/3) + "px";

    // Initialize the resizer
    resizer.init();


    // Begin the terminal when it scrolls into view
    let observer = new IntersectionObserver(function(entries) {
        let i;

        for (i = 0; i < entries.length; i++) {
            // isIntersecting is true when element and viewport are overlapping
            // isIntersecting is false when element and viewport don't overlap
            if(entries[i].isIntersecting === true) {
                terminal.start();
                observer.unobserve(entries[i].target);
            }
        }
    }, { threshold: [0] });

    let terminal = (function() {

        const PAGE_1 = ("About Spencer [ver. 1.0.0]\n" +
                        "> Click Here")
                       .split("");
        const PAGE_2 = ("What would you like to know?\n" +
                        "> Basic Information\n" +
                        "> Fun Facts")
                        .split("");
        const BASIC_INFO = ("Age: 20\n"+
                            "Location: Charlotte, MI, USA\n"+
                            "Expertise: Software Engineering, Game Development\n"+
                            "Education: Vassar College | Junior, Computer Science Major (GPA: 3.92)\n"+
                            "Lansing Community College | Associate Degree, Computer Science (GPA: 3.78)\n")
                            .split("");
            
        const FUN_FACTS = ("Likes: marshmallows (for eating), guinea pigs (not for eating)\n"+
                           "Hobbies: ocarina, harmonica, e-sports (Super Smash Bros.)\n"+
                           "Currently learning: Japanese, Chinese")
                           .split("");
        const _pages = [PAGE_1];

        let _currentPage, _pageIndex, _currentLine;

        // Starting point for letters
        const ORIGIN_X = 24;
        const ORIGIN_Y = 12;

        const LINE_SPACING = 2;
        
        // Grab the canvas and context
        let _canvas = resizer.getCanvas();
        let _context = _canvas.getContext("2d");

        let _lines, _lineNumber, _lineY;

        function _start() {
            _lines = [];
            _lineNumber = 1;

            _currentPage = PAGE_1;
            _pageIndex = 0;
            _currentLine = _addLine("");

            requestAnimFrame(_update);
        }

        function _reset() {
            _lines.length = 0;
            _lineNumber = 1;
            _currentLine = _addLine("");
        }

        function _addLine(str) {
            let newLine;

            _lineY = ORIGIN_Y + (FONT_SIZE * LINE_SPACING * _lineNumber);
            newLine = new Line(str, _canvas, ORIGIN_X, _lineY);
            _lines.push(newLine);
            _lineNumber++;

            return newLine;
        }

        function _drawLines() {
            for (let i = _lines.length-1; i >= 0; i--) {
                _lines[i].draw();
            }
        }

        function _continueDrawing() {
            _context.fillStyle = BG_COLOR;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            _drawLines();

            requestAnimFrame(_continueDrawing);
        }

        let _update = (function() {
            
            // The number of frames it takes to type one character
            const TYPE_TIME = 4;
    
            // Counter of frames passed; rolls over after the type time
            let frame = 0;

            let i = 0;
                      

            return function() {
                _context.fillStyle = BG_COLOR;
                _context.fillRect(0, 0, _canvas.width, _canvas.height);
                _drawLines();

                frame = (frame+1) % TYPE_TIME;

                if (frame === 0 && i < _currentPage.length) {

                    switch(_currentPage[i]) {
                        case "\n":
                            _currentLine = _addLine("");
                            break;

                        case ">":
                           if (_pages[_pageIndex] === PAGE_1) {
                                _currentLine.setSelectable(function(){
                                    _pages.push(PAGE_2);
                                });
                            }
                            else if (_pages[_pageIndex] === PAGE_2 && !_pages.includes(BASIC_INFO)) {
                                _currentLine.setSelectable(function(){
                                    _pages.push(BASIC_INFO);
                                });
                            }
                            else if (_pages[_pageIndex] === PAGE_2) {
                                _currentLine.setSelectable(function(){
                                    _pages.push(FUN_FACTS);
                                });
                            }
                        default:
                            _currentLine.append(_currentPage[i]);
                    }


                    i++;
                }
                else if (_pageIndex < _pages.length-1) {
                    _pageIndex++;
                    _currentPage = _pages[_pageIndex];

                    _reset();
                    i = 0;
                    frame = 0;
                }

                requestAnimFrame(_update);
            }
        })();

        return {
            start: _start,
            reset: _reset,
            canvas: _canvas,

            addLine: _addLine
        };
    })();

    observer.observe(terminal.canvas);

    

})();