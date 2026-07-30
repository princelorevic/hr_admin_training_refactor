/*
==========================================================
AI PROVIDER MANAGER
Corporate AI Core Engine
Version : 1.0
==========================================================
*/

const aiProviderRegistry = [

    {
        id: "gemini",
        name: "Google Gemini",
        enabled: true
    },

    {
        id: "chatgpt",
        name: "OpenAI ChatGPT",
        enabled: true
    },

    {
        id: "claude",
        name: "Anthropic Claude",
        enabled: true
    },

    {
        id: "copilot",
        name: "Microsoft Copilot",
        enabled: true
    }

];

function getAiProviders(){

    return aiProviderRegistry;

}

function getProviderById(providerId){

    return aiProviderRegistry.find(provider=>provider.id===providerId);

}