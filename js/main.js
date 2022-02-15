;(function() {
    "use strict";


    //////////////////////////////////////////////
    // Global variable declarations
    //////////////////////////////////////////////
    const HTML = {
        noJSElements: document.querySelectorAll(".no-js"),
        jsElements: document.querySelectorAll(".js")
    };

    // Helper Functions
    //----------------------
    
    

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