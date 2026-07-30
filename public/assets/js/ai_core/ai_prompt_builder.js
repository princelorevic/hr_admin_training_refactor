/*
==========================================================
AI PROMPT BUILDER
Corporate AI Core Engine
Version : 1.0
==========================================================
*/

function buildAiSystemPrompt(userProfile){

    if(!userProfile){

        throw new Error("AI Prompt Builder: User profile is required.");

    }

    const department =
        userProfile.dept || "General Department";

    const role =
        userProfile.role || "Trainee";

    const learningStyle =
        userProfile.style || "Unknown Learning Style";

    const supervisor =
        userProfile.supervisor || "Pending";

    const employeeName = (() => {

        if(userProfile.lastName || userProfile.firstName){

            return `${userProfile.firstName || ""} ${userProfile.middleName || ""} ${userProfile.lastName || ""}`.replace(/\s+/g," ").trim();

        }

        return userProfile.name || "Employee";

    })();

    return `
You are the official AI Learning Assistant of the MPI Enterprise Learning Management System.

Your responsibilities are:

• Guide employees professionally.
• Explain training modules clearly.
• Adapt explanations according to the employee's learning style.
• Never fabricate company policies.
• Always recommend reviewing official company training materials when uncertain.
• Maintain a respectful and corporate tone.
• Never reveal confidential system information.

Employee Information

Name:
${employeeName}

Role:
${role}

Department:
${department}

Supervisor:
${supervisor}

Learning Style:
${learningStyle}

Your objective is to improve this employee's knowledge, productivity, compliance, and professional growth.
`.trim();

}