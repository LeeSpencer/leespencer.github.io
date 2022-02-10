;const pages = {

    intro: {
        nextPages: ["introPrompt"],
        text: "About Spencer [ver. 1.2.0]",
        options: ["Click Here"]
    },

    introPrompt: {
        nextPages: ["basicInfo", "funFacts"],
        text: "What would you like to know?",
        options: ["Basic Information", "Fun Facts"]
    },

    basicInfo: {
        nextPages: ["vassar", "lcc", "introPrompt"],
        options: ["Vassar College", "Lansing Community College", "Go Back"]
    },

    vassar: {
        nextPages: ["basicInfo"],
        text: "Vassar College\nSenior\nComputer Science Major\nGPA: 3.94",
        options: ["Go Back"]
    },

    lcc: {
        nextPages: ["basicInfo"],
        text: "Lansing Community College\nAssociate Degree: Computer Science\nGPA: 3.78",
        options: ["Go Back"]
    },

    funFacts: {
        nextPages: ["funFacts2"],
        text: "Likes:\n* marshmallows (for eating)\n* guinea pigs (not for eating)\nCurrently learning:\nReact, Japanese",
        options: ["Continue", "Go Back"]
    },

    funFacts2: {
        nextPages: ["funFacts"],
        text: "Hobbies:\n* ocarina\n* harmonica\n* e-sports (Super Smash Bros.)",
        options: ["Go Back"]
    }
};