;(function() {
    "use strict";


    //////////////////////////////////////////////
    // Global variable declarations
    //////////////////////////////////////////////
    const HTML = {
        noJSElements: document.querySelectorAll('.no-js'),
        jsElements: document.querySelectorAll('.js'),

        bookCover: document.querySelector('.book'),
        backCover: document.querySelector('.book-backside')
    };

    // Helper Functions
    //----------------------
    function openBook() {
        const bookScale = window.innerHeight/HTML.bookCover.clientHeight;
        const bookTransform =
            'translateY(-50%) '+
            'rotateY(-180deg) '+
            'scale('+bookScale+')';

        const backTransform = 'translateY(-50%) scale('+bookScale+')';

        HTML.bookCover.classList.remove('closed-book');
        HTML.bookCover.addEventListener('transitionend', ()=>{
            HTML.backCover.style.visibility = 'visible';
            HTML.backCover.style.transform = backTransform;
            HTML.backCover.style.WebkitTransform = backTransform;
            HTML.backCover.style.MozTransform = backTransform;

            HTML.bookCover.classList.add('open-book');
            HTML.bookCover.style.transform = bookTransform;
            HTML.bookCover.style.WebkitTransform = bookTransform;
            HTML.bookCover.style.MozTransform = bookTransform;
        });
    }
    

    /** Flips to the previous page. */
    function flipToPreviousPage(event) {
        const target = imports.getEventTarget(event);
        const currentPage = target.closest('.book-page');
        setTransform(currentPage, '');
        pageDeg -= 1;
    }

    //////////////////////////////////////////////
    // Event listeners
    ///////////////////////
    HTML.bookCover.addEventListener('click', openBook);
    

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