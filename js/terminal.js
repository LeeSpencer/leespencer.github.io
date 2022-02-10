;const terminal = (function() {
    "use strict";

    ////////////////////////
    // Global variables
    ////////////////////////

    const FONT_COLOR = "#00FF00";
    const BG_COLOR = "#000000";
    const FONT_SIZE = 46;
    const FONT_FAMILY = "Courier New";
    
    const START_PAGE = pages.intro;

    let _currentPage, _pageChars, _currentLine;

    // Starting point for letters
    const ORIGIN_X = 50;
    const ORIGIN_Y = 0;

    const LINE_SPACING = 1.5;

    // The number of frames it takes to type one character
    const TYPE_TIME = 2;
    
    // Grab the canvas and context
    let _canvas, _context;

    let _lines, _lineNumber, _lineY;
    let _skip;

    //////////////////////////
    // Classes
    //////////////////////////

    // Class representing one line of text
    function Line(str, canvas, x, y) {
        this.string = str;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;

        this.highlighted = false;

        this.highlightHandler = null;
        this.clickHandler = null;
    }

    // Draw the text
    Line.prototype.draw = function() {

        // Set normal font color
        this.context.fillStyle = FONT_COLOR;

        // Draw highlight rectangle
        if (this.highlighted) {
            this.context.fillRect(0, this.y-FONT_SIZE, this.canvas.width, FONT_SIZE*1.2);
            this.context.fillStyle = BG_COLOR;
        }
        
        // Set font size
        this.context.font = FONT_SIZE + "px " + FONT_FAMILY;

        // Render text
        this.context.fillText(this.string, this.x, this.y);
    };

    // Append text to the line
    Line.prototype.append = function (str) {
        this.string += str;
    };

    // Make the line "selectable" by the user
    Line.prototype.setSelectable = function(callback) {

        // Highlight line on hover
        this.highlightHandler = (function(event) {
            event.preventDefault();
            
            let mouseCoords = resizer.getRelativeEventCoords(event);
            this.highlighted = (this.y-FONT_SIZE <= mouseCoords.y && mouseCoords.y <= (this.y+FONT_SIZE*0.2));
        }).bind(this);
        

        // Execute callback on click
        this.clickHandler = (function (event) {
            event.preventDefault();

            if (this.highlighted) {
                callback();
            }
        }).bind(this);

        // Add handlers
        this.canvas.addEventListener("mousemove", this.highlightHandler, false);
        this.canvas.addEventListener("click", this.clickHandler, false);
    };    

    
    ////////////////////////
    // Helpful functions
    ////////////////////////
    
    // Initialize relevant terminal variables
    function _start() {

        _lines = [];
        _lineNumber = 1;

        _currentPage = START_PAGE;
        _pageChars = START_PAGE.text.split("");
        _currentLine = _newLine("");

        // Skips to the end of the typing animation on click
        _skip = false;
        _canvas.addEventListener("click", function() {
            _skip = true;
        }, false);

        // Begin rendering the terminal
        imports.requestAnimFrame(_update);
    }

    // Resets terminal state for a new page on the terminal
    function _reset() {
        let i = _lines.length - 1;

        // For clickable options, remove their event handlers
        for (i; i >= 0; i--) {
            if (_lines[i].highlightHandler) {
                _canvas.removeEventListener("mousemove", _lines[i].highlightHandler);
                _canvas.removeEventListener("click", _lines[i].clickHandler);
            }
        }

        _lines.length = 0;
        _lineNumber = 1;
        _currentLine = _newLine("");
    }

    // Appends a new line of text to the terminal screen
    function _newLine(str) {
        let newLine;

        _lineY = ORIGIN_Y + (FONT_SIZE * LINE_SPACING * _lineNumber);
        newLine = new Line(str, _canvas, ORIGIN_X, _lineY);
        _lines.push(newLine);
        _lineNumber++;

        return newLine;
    }

    // Draws each line on the terminal canvas
    function _drawLines() {
        let i = _lines.length - 1
        for (i; i >= 0; i--) {
            _lines[i].draw();
        }
    }

    // Goes to the next page
    function _nextPage(page) {
        _currentPage = pages[page];
        _pageChars = _currentPage.text.split("");
        _reset();
    }

    // Drives the terminal rendering
    let _update = (function() {
        let char = 0;

        // Counter of frames passed; rolls over after the type time
        let frame = 0;

        return function() {
            let i;

            _context.fillStyle = BG_COLOR;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            _drawLines();

            frame = (frame+1) % TYPE_TIME;

            // If skipping the typing animation, draw all the text at once
            if (_skip) {

                // Draw each character
                for (char; char < _pageChars.length; char++) {
                    if (_pageChars[char] === "\n") {
                        _currentLine = _newLine("");
                    }
                    else {
                        _currentLine.append(_pageChars[char]);
                    }

                    // Draw the clickable options last
                    if (char === _pageChars.length - 1) {
                        for (i = 0; i < _currentPage.options.length; i++) {
                            _currentLine = _newLine("> " + _currentPage.options[i]);
                            _currentLine.setSelectable(function(){
                                char = 0;
                                frame = 0;
                                _skip = false;
                                _nextPage(_currentPage.nextPages[i]);
                            });
                        }
                    }
                }
            }

            // Animate the typing of each character individually
            else if (frame === 0 && char < _pageChars.length) {

                if (_pageChars[char] === "\n") {
                    _currentLine = _newLine("");
                }
                else {
                    _currentLine.append(_pageChars[char]);
                }

                char++;
            }

            // Display clickable options after typing animation finishes
            else if (char === _pageChars.length) {
                _skip = true;
                for (i = 0; i < _currentPage.options.length; i++) {
                    _currentLine = _newLine("> " + _currentPage.options[i]);
                    _currentLine.setSelectable(function(){
                        char = 0;
                        frame = 0;
                        _skip = false;
                        _nextPage(_currentPage.nextPages[i]);
                    });
                }
            }

            imports.requestAnimFrame(_update);
        }
    })();


    // Public-facing function: initialize the terminal
    function _init() {
        // Initialize resizer
        resizer.init();

        _canvas = resizer.getCanvas();
        _context = _canvas.getContext("2d");

        // Begin the terminal when it scrolls into view
        let observer = new IntersectionObserver(function(entries) {
            let i;

            for (i = 0; i < entries.length; i++) {
                // isIntersecting is true when element and viewport are overlapping
                // isIntersecting is false when element and viewport don't overlap
                if(entries[i].isIntersecting === true) {
                    _start();
                    observer.unobserve(entries[i].target);
                }
            }
        }, { threshold: [0] });

        observer.observe(_canvas);
    }
    

    return { init: _init };
    
})();