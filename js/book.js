;(function() {
    "use strict";


    //////////////////////////////////////////////
    // Global variable declarations
    //////////////////////////////////////////////
    const HTML = {
        noJSElements: document.querySelectorAll('.no-js'),
        jsElements: document.querySelectorAll('.js'),

        quickLinks: document.querySelector('.quick-links'),

        book: document.querySelector('.book'),
        bookCover: document.querySelector('.book-front'),
        backCover: document.querySelector('.book-backside'),
        bookPages: document.querySelectorAll('.book-page'),
        flipPages: document.querySelectorAll(
                    '.flip-page-1, '+
                    '.flip-page-2, '+
                    '.flip-page-3'
                ),

        nextButtons: document.querySelectorAll('.next-page-btn'),
        previousButtons: document.querySelectorAll('.previous-page-btn'),

        resumeAnimation: document.querySelector('.resume-game > .completion-animation'),
        resumeGameContainer: document.querySelector('.resume-game.tracing-game-container'),
        resumeLink: document.querySelector('.resume-link')
    };

    const setTransform = utility.setTransform;
    let pageDeg = -173;



    //////////////////////////////////////////////
    // Helper functions
    //////////////////////////////////////////////

    /** Handles the book-flipping-open animation. */
    function openBook() {

        // Calculate how much to scale the book to fill the screen
        const bookScaleAmount = window.innerHeight/HTML.book.clientHeight;
        const bookScale = 'scale('+bookScaleAmount+')';

        // Remove closed-book class so that the book "slides" to the right
        HTML.book.classList.remove('closed-book');

        // Flip the book open when it's done "sliding" to the right
        HTML.book.addEventListener('transitionend', function animate() {
            HTML.book.removeEventListener('transitionend', animate);

            for (const page of HTML.bookPages) {
                page.style.visibility = 'visible';
            }
            HTML.backCover.style.visibility = 'visible';

            // (ZOOM, ENHANCE, ENHANCE, ENHANCE)
            setTransform(HTML.book, 'translateY(-50%) '+bookScale);

            // Flip the front cover open to reveal book contents
            HTML.book.classList.add('open-book');
            setTransform(HTML.bookCover, 'rotateY(-180deg)');

            // Flip inside pages animation
            for (const flipPage of HTML.flipPages) {
                pageDeg += 3;
                setTransform(flipPage, 'rotateY('+pageDeg+'deg)');
            }

            
        });
    }
    
    /** Flips to the next page. */
    function flipToNextPage(event) {
        const target = utility.getEventTarget(event);
        const currentPage = target.closest('.book-page');

        pageDeg++;
        setTransform(currentPage, 'rotateY('+pageDeg+'deg)');
    }

    /** Flips to the previous page. */
    function flipToPreviousPage(event) {
        const target = utility.getEventTarget(event);
        const currentPage = target.closest('.book-page');
        setTransform(currentPage, '');
        pageDeg -= 1;
    }

    //////////////////////////////////////////////
    // Event listeners
    //////////////////////////////////////////////
    HTML.book.addEventListener('click', function handleOpen() {
        openBook();

        HTML.quickLinks.style.visibility = 'hidden';
        HTML.quickLinks.style.opacity = 0;

        HTML.book.removeEventListener('click', handleOpen);
    });

    for (const nextBtn of HTML.nextButtons) {
        nextBtn.addEventListener('click', flipToNextPage);
    }
    for (const prevBtn of HTML.previousButtons) {
        prevBtn.addEventListener('click', flipToPreviousPage);
    }

    window.addEventListener('load',()=>
        activateTracing(
            HTML.resumeGameContainer,
            HTML.resumeAnimation,
            HTML.resumeLink
        )
    );
    

    //////////////////////////////////////////////
    // Accessibility
    //////////////////////////////////////////////

    // Hide all no-JS elements (because if we're here, obviously
    // JavaScript is enabled)
    for (let i = 0; i < HTML.noJSElements.length; i++) {
        HTML.noJSElements[i].style.display = 'none';
    }

    // Show all JS elements
    for (let i = 0; i < HTML.jsElements.length; i++) {
        HTML.jsElements[i].style.display = 'block';
    }

})();