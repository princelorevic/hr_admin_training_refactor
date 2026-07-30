/*
==========================================================
AI LEARNING PROFILE ENGINE
Corporate AI Core Engine
Version : 1.0
==========================================================
*/

const aiLearningProfiles = {

    "Visual Module": {

        teachingStyle: "Visual",

        instruction:
        "Use diagrams, tables, flowcharts, illustrations, and visual examples whenever possible."

    },

    "Auditory Module": {

        teachingStyle: "Auditory",

        instruction:
        "Explain concepts conversationally and encourage verbal reasoning and discussion."

    },

    "Reading/Writing Module": {

        teachingStyle: "Reading",

        instruction:
        "Provide detailed written explanations with documentation and structured notes."

    },

    "Kinesthetic Module": {

        teachingStyle: "Kinesthetic",

        instruction:
        "Teach through practical exercises, simulations, hands-on examples, and step-by-step demonstrations."

    }

};

function getLearningProfile(userProfile){

    if(!userProfile){

        throw new Error("Learning profile cannot be empty.");

    }

    const style = userProfile.style || "";

    for(const profile in aiLearningProfiles){

        if(style.includes(profile.replace(" Module",""))){

            return aiLearningProfiles[profile];

        }

    }

    return{

        teachingStyle:"General",

        instruction:
        "Provide balanced explanations using visual, written, conversational and practical teaching techniques."

    };

}