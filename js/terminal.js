;let terminal = (function() {
    "use strict";

    ////////////////////////
    // Global variables
    ////////////////////////

    const FONT_COLOR = "#00FF00";
    const BG_COLOR = "#000000";
    const FONT_SIZE = 46;
    const FONT_FAMILY = "Courier New";

    const PAGE_1 = ("About Spencer [ver. 1.2.0]\n" +
                        "\n"+
                        "> Click Here")
                       .split("");
    const PAGE_2 = ("What would you like to know?\n" +
                    "\n"+
                    "> Basic Information\n" +
                    "> Fun Facts")
                    .split("");

    const BASIC_INFO = ("Age: 20\n"+
                        "Location: Charlotte, MI, USA\n"+
                        "Expertise: Web, game development\n"+
                        "\n"+
                        "> Education\n"+
                        "> Go Back\n")
                        .split("");
    const EDUCATION = ("> Vassar College\n"+
                        "> Lansing Community College\n"+
                        "> Go Back")
                        .split("");
    const VASSAR =  ("Vassar College\n"+
                        "Junior\n"+
                        "Computer Science Major\n"+
                        "GPA: 3.92\n"+
                        "\n"+
                        "> Go Back")
                        .split("");
    const LCC = ("Lansing Community College\n"+
                    "Associate Degree: Computer Science\n"+
                    "GPA: 3.78\n"+
                    "\n"+
                    "> Go Back")
        
    const FUN_FACTS = ("Likes:\n"+
                        "* marshmallows (for eating)\n"+
                        "* guinea pigs (not for eating)\n"+
                        "Currently learning:\n"+
                        "Japanese, Chinese\n"+
                        "\n"+
                        "> Continue\n"+
                        "> Go Back")
                        .split("");
    const FUN_FACTS_CONT = ("Hobbies:\n"+
                            "* ocarina\n"+
                            "* harmonica\n"+
                            "* e-sports (Super Smash Bros.)\n"+
                            "\n"+
                            "> Go Back")
                            .split("");

                            
    const _pages = [PAGE_1];

    let _currentPage, _pageIndex, _currentLine;

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
            let mouseCoords = resizer.getRelativeEventCoords(event);
            this.highlighted = (this.y-FONT_SIZE <= mouseCoords.y && mouseCoords.y <= (this.y+FONT_SIZE*0.2));
        }).bind(this);
        

        // Execute callback on click
        this.clickHandler = (function () {
            if (this.highlighted) {
                callback();
            }
        }).bind(this);

        // Add handlers
        this.canvas.addEventListener("mousemove", this.highlightHandler, false);
        this.canvas.addEventListener("click", this.clickHandler, false);
    };    

    

    function _start() {

        _lines = [];
        _lineNumber = 1;

        _currentPage = PAGE_1;
        _pageIndex = 0;
        _currentLine = _addLine("");

        _skip = false;

        _canvas.addEventListener("click", function() {
            _skip = true;
        }, false);

        imports.requestAnimFrame(_update);
    }

    function _reset() {
        for (let i = _lines.length-1; i >= 0; i--) {
            if (_lines[i].highlightHandler) {
                _canvas.removeEventListener("mousemove", _lines[i].highlightHandler);
                _canvas.removeEventListener("click", _lines[i].clickHandler);
            }
        }

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

    let _update = (function() {
        // Counter of frames passed; rolls over after the type time
        let frame = 0;

        let i = 0;

        let lineCount = 1;
                    

        return function() {
            _context.fillStyle = BG_COLOR;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            _drawLines();

            frame = (frame+1) % TYPE_TIME;

            if (_skip) {
                // function for finite state machine here
                for (i; i < _currentPage.length; i++) {
                    switch(_currentPage[i]) {
                        case "\n":
                            _currentLine = _addLine("");
                            lineCount++;
                            break;

                        case ">":
                            let nextPage;

                            switch(_pages[_pageIndex]) {
                                case PAGE_1:
                                    nextPage = PAGE_2;
                                    break;

                                case PAGE_2:
                                    if (lineCount === 3) {
                                        nextPage = BASIC_INFO;
                                    }
                                    else if (lineCount === 4) {
                                        nextPage = FUN_FACTS;
                                    }
                                    break;

                                case BASIC_INFO:
                                    if (lineCount === 5) {
                                        nextPage = EDUCATION;
                                    }
                                    else if (lineCount === 6) {
                                        nextPage = PAGE_2;
                                    }
                                    break;
                                
                                case EDUCATION:
                                    if (lineCount === 1) {
                                        nextPage = VASSAR;
                                    }
                                    else if (lineCount === 2) {
                                        nextPage = LCC;
                                    }
                                    else if (lineCount === 3) {
                                        nextPage = BASIC_INFO;
                                    }
                                    break;
                                
                                case VASSAR:
                                case LCC:
                                    nextPage = EDUCATION;
                                    break;

                                case FUN_FACTS:
                                    if (lineCount === 7) {
                                        nextPage = FUN_FACTS_CONT;
                                    }
                                    else if (lineCount === 8) {
                                        nextPage = PAGE_2;
                                    }
                                    break;

                                case FUN_FACTS_CONT:
                                    nextPage = FUN_FACTS;
                                    break;
                            }

                            _currentLine.setSelectable(function(){
                                _pages.push(nextPage);
                                _skip = false;
                            });

                        default:
                            _currentLine.append(_currentPage[i]);
                    }
                }
            }

            else if (frame === 0 && i < _currentPage.length) {

                switch(_currentPage[i]) {
                    case "\n":
                        _currentLine = _addLine("");
                        lineCount++;
                        break;

                    case ">":
                        let nextPage;

                        switch(_pages[_pageIndex]) {
                            case PAGE_1:
                                nextPage = PAGE_2;
                                break;

                            case PAGE_2:
                                if (lineCount === 3) {
                                    nextPage = BASIC_INFO;
                                }
                                else if (lineCount === 4) {
                                    nextPage = FUN_FACTS;
                                }
                                break;

                            case BASIC_INFO:
                                if (lineCount === 5) {
                                    nextPage = EDUCATION;
                                }
                                else if (lineCount === 6) {
                                    nextPage = PAGE_2;
                                }
                                break;
                            
                            case EDUCATION:
                                if (lineCount === 1) {
                                    nextPage = VASSAR;
                                }
                                else if (lineCount === 2) {
                                    nextPage = LCC;
                                }
                                else if (lineCount === 3) {
                                    nextPage = BASIC_INFO;
                                }
                                break;
                            
                            case VASSAR:
                            case LCC:
                                nextPage = EDUCATION;
                                break;

                            case FUN_FACTS:
                                if (lineCount === 7) {
                                    nextPage = FUN_FACTS_CONT;
                                }
                                else if (lineCount === 8) {
                                    nextPage = PAGE_2;
                                }
                                break;

                            case FUN_FACTS_CONT:
                                nextPage = FUN_FACTS;
                                break;
                        }

                        _currentLine.setSelectable(function(){
                            _pages.push(nextPage);
                            _skip = false;
                        });

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
                lineCount = 1;
            }

            imports.requestAnimFrame(_update);
        }
    })();


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