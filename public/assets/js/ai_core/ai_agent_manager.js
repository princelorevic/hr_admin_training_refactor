/*
==========================================================
AI AGENT MANAGER
Corporate AI Core Engine
Version : 1.0
==========================================================
*/

const aiAgentRegistry = [];

function createAiAgent(userProfile){

    if(!userProfile){

        throw new Error("User profile is required.");

    }

    const agent = {

        agentId:
            "AI-" + Date.now(),

        owner:
            userProfile.username ||

            userProfile.gmail ||

            userProfile.name ||

            "Unknown",

        fullName:
            userProfile.lastName

            ? `${userProfile.lastName}, ${userProfile.firstName} ${userProfile.middleName || ""}`.trim()

            : userProfile.name,

        role:
            userProfile.role,

        department:
            userProfile.dept,

        supervisor:
            userProfile.supervisor || "Pending",

        learningStyle:
            userProfile.style,

        provider:
            getAiProviders()[0].id,

        persona:
            "Corporate Trainer",

        prompt:
            buildAiSystemPrompt(userProfile),

        status:
            "READY",

        createdDate:
            new Date().toISOString(),

        lastUpdated:
            new Date().toISOString()

    };

    aiAgentRegistry.push(agent);

    return agent;

}

function getAiAgent(owner){

    return aiAgentRegistry.find(

        agent=>agent.owner===owner

    );

}

function updateAiAgent(owner,data){

    const agent=getAiAgent(owner);

    if(!agent) return null;

    Object.assign(agent,data);

    agent.lastUpdated=new Date().toISOString();

    return agent;

}

function deleteAiAgent(owner){

    const index=aiAgentRegistry.findIndex(

        agent=>agent.owner===owner

    );

    if(index===-1) return false;

    aiAgentRegistry.splice(index,1);

    return true;

}

function getAllAiAgents(){

    return aiAgentRegistry;

}