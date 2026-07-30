/*
==========================================================
AI CORE BOOTSTRAP
Corporate AI Core Engine
Version : 1.0
==========================================================
*/
window.aiProvisionCompleted = false;

const aiCoreEngine = {

    initialized: false,

    provider: null,

    profile: null,

    systemPrompt: null

};

function initializeAiCore(userProfile){

    console.log("=================================");
    console.log("Initializing AI Core Engine...");
    console.log("=================================");

    // Load Learning Profile
    aiCoreEngine.profile =
        getLearningProfile(userProfile);

    // Load Default Provider
    const providers =
        getAiProviders();

    aiCoreEngine.provider =
        providers[0];

    // Generate System Prompt
    aiCoreEngine.systemPrompt =
        buildAiSystemPrompt(userProfile);

    aiCoreEngine.initialized = true;

    console.log("AI Provider :", aiCoreEngine.provider.name);
    console.log("Learning Style :", aiCoreEngine.profile.teachingStyle);
    console.log("AI Core Status : READY");

    return aiCoreEngine;

}

function getAiCore(){

    return aiCoreEngine;

}

function updateAiSummaryCard(aiCore, agent){ 

    if(!aiCore) return;

    document.getElementById("lblAiProvider").innerText =
        aiCore.provider?.name || "Not Assigned";

    document.getElementById("lblAiPersona").innerText =
        agent?.persona || "Corporate Trainer";

    document.getElementById("lblAiStatus").innerText =
        aiCore.initialized
            ? "🟢 READY"
            : "🔴 Not Ready";

}

function openAiProvisioningWizard(){

    window.aiProvisionCompleted = true;

    document.getElementById("aiProviderStatus").innerHTML =
        "✅ AI Provider Selected";

    document.getElementById("aiTemplateStatus").innerHTML =
        "✅ AI Template Assigned";

    document.getElementById("aiAgentStatus").innerHTML =
        "✅ Personal AI Ready";

    document.getElementById("aiProgressBar").style.width = "100%";

    document.getElementById("aiProgressText").innerText =
        "100% Completed";

    alert("AI Provisioning Completed.");

}