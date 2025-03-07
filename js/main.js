;(() => {
    "use strict";

    function moveElementTowardMouse(element, mouseX, mouseY) {
        const maxOffset = 20;

        const rect = element.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        
        let offsetX = mouseX - originX;
        let offsetY = mouseY - originY;

        let angle = Math.atan2(offsetY, offsetX);
        let distance = Math.sqrt(offsetX*offsetX + offsetY*offsetY);

        let moveX = Math.min(distance, maxOffset) * Math.cos(angle);
        let moveY = Math.min(distance, maxOffset) * Math.sin(angle);

        element.setAttribute("transform", `translate(${moveX} ${moveY}) scale(1,-1)`);
    }

    function animateLogoEyes() {
        const eyes = document.querySelectorAll(".logo ellipse");

        for (const eye of eyes) {
            document.addEventListener("mousemove", event => {
                moveElementTowardMouse(eye, event.clientX, event.clientY);
            });
            document.addEventListener("touchmove", event => {
                moveElementTowardMouse(eye, event.touches[0].clientX, event.touches[0].clientY);
            });
        }
    }

    function setupThemeButton() {
        let themeBtn = document.querySelector(".theme-button");

        themeBtn.querySelector("input").ariaPressed = "false"

        themeBtn.addEventListener("click", event => {
            let themeBtnInput = event.currentTarget.querySelector("input");

            document.documentElement.classList.toggle("light-mode");

            if (themeBtnInput.ariaPressed === "true") {
                themeBtnInput.ariaPressed = "false";
            }
            else {
                themeBtnInput.ariaPressed = "true";
            }
        });
    }

    if(document.readyState === "interactive" || document.readyState === "complete") {
        animateLogoEyes();
        setupThemeButton();
    }
    else {
        window.addEventListener("DOMContentLoaded", animateLogoEyes);
        window.addEventListener("DOMContentLoaded", setupThemeButton);
    }
})();