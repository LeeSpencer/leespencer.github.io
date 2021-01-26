;(function() {
    "use strict";


    // Variable declarations
    //----------------------
    const HTML = {
        mobileNavBar: document.getElementById("mobile-nav"),
        desktopNavBar: document.getElementById("topnav"),
        hamburger: document.getElementById("hamburger-icon"),
        viewResume: document.getElementById("view-resume"),

        noJSElements: document.querySelectorAll(".no-js"),
        jsElements: document.querySelectorAll(".js"),

        projectTabs: (function(){
            let tabButtons = document.querySelectorAll(".tabs button");
            return [...tabButtons];
        })(),
    };

    let isNavVisible = false;

    // Helper Functions
    //----------------------
    
    // Toggle between adding and removing the "responsive" class 
    // to topnav when the user clicks on the icon
    function toggleNav() {
        let mobileNavBar = HTML.mobileNavBar;

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
        let target = imports.getEventTarget(event);

        if (target.tagName.toLowerCase() === "a" && target.dataset.targetelement) {
            let elementToScrollTo = document.getElementById(target.dataset.targetelement);
            let elementPos = imports.cumulativeOffset(elementToScrollTo).top - 40;
            imports.scrollTo(elementPos, null, 750);
        }
    }

    // Opens the correct project tab
    function openProjectTab(event, tabId) {
        // Declare all variables
        let i, tabContent, tabs;
      
        // Get all elements with class="tab-content" and hide them
        tabContent = document.querySelectorAll(".tab-content");
        for (i = tabContent.length-1; i >= 0; i--) {
            tabContent[i].style.display = "none";
        }
      
        // Get all elements with class="tab" and remove the class "active"
        tabs = document.querySelectorAll(".tab");
        for (i = tabs.length-1; i >= 0; i--) {
          tabs[i].classList.remove("active");
          tabs[i].classList.add("inactive");
        }
      
        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabId).style.display = "block";
        event.currentTarget.classList.remove("inactive");
        event.currentTarget.classList.add("active");
    }


    ///////////////////////
    // Event listeners
    ///////////////////////

    HTML.hamburger.addEventListener("click", toggleNav, false);
    HTML.mobileNavBar.addEventListener("click", function(e) {
        samePageLinkHandler(e);
        toggleNav();
    }, false);
    HTML.desktopNavBar.addEventListener("click", samePageLinkHandler, false);
    HTML.viewResume.addEventListener("click", samePageLinkHandler, false);

    // Add tab-switching functionality to each project tab
    for (let i = HTML.projectTabs.length-1; i >= 0; i--) {

        HTML.projectTabs[i].addEventListener("click", function(event) {
            let contentId, tabId;
            // Get the id of the tab's content element
            tabId = HTML.projectTabs[i].id.toLowerCase();
            contentId = (tabId.substr(0, tabId.indexOf("-tab")) + "-content").toLowerCase();

            // Switch to that tab's content
            openProjectTab(event, contentId);
        }, false);
    }



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

    // Show first tab by default
    HTML.projectTabs[0].click();

    // Initialize the terminal
    terminal.init();

})();