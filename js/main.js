;(function() {
    "use strict";


    // Variable declarations
    //----------------------
    const HTML = {
        noJSElements: document.querySelectorAll(".no-js"),
        jsElements: document.querySelectorAll(".js")
    };

    // Helper Functions
    //----------------------
    
    


    ///////////////////////
    // Event listeners
    ///////////////////////

    


    //////////////////////////////////
    // Mainline logic
    //////////////////////////////////

    // Hide all no-JS elements (because if we're here, obviously
    // JavaScript is enabled)
    for (let i = 0; i < HTML.noJSElements.length; i++) {
        HTML.noJSElements[i].style.display = "none";
    }

    // Show all JS elements
    for (let i = 0; i < HTML.jsElements.length; i++) {
        HTML.jsElements[i].style.display = "block";
    }

})();