// ============================================
// NEW AI PROVISIONING WORKFLOW (MANUAL LINKING)
// ============================================

// Function para ipakita o itago ang instructions kapag kinlick ang "Generate"
function toggleGeminiInstructions() {
    const panel = document.getElementById("geminiInstructionsPanel");
    if (panel) {
        if (panel.classList.contains("hidden")) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    }
}

// Function para i-check kung may laman na yung input box bago mag-save
function isAiProvisioningComplete() {
    const linkInput = document.getElementById("inGeminiLink");
    if (!linkInput) return false;
    
    const linkValue = linkInput.value.trim();
    
    // Tinitingnan kung may nai-paste na link at kung nagsisimula ito sa "http"
    if (linkValue.length > 0 && linkValue.startsWith("http")) {
        return true;
    }
    return false;
}

// Function para kunin ang link (gagamitin natin ito pang-save sa database mamaya)
function getGeminiLink() {
    const linkInput = document.getElementById("inGeminiLink");
    return linkInput ? linkInput.value.trim() : "";
}

// Function para linisin ang input box kapag gumawa ng bagong user
function resetAiProvisioningPanel() {
    const linkInput = document.getElementById("inGeminiLink");
    const panel = document.getElementById("geminiInstructionsPanel");
    
    if (linkInput) linkInput.value = "";
    if (panel) panel.classList.add("hidden");
}


// ============================================
// MANLY PLASTIC A.I. CHAT LOGIC (INTERACTIVE)
// ============================================

// Kapag pinindot ang "Enter" key sa keyboard
function handleAiChatEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendManlyAiMessage();
    }
}

// Function para sa manual na pag-chat ng Admin
function sendManlyAiMessage() {
    const inputField = document.getElementById("inAiChatMessage");
    if (!inputField) return;

    const message = inputField.value.trim();
    if (!message) return;

    const chatBox = document.getElementById("aiChatBox");

    // 1. Ipakita ang message ng Admin
    chatBox.innerHTML += `
        <div style="background: #eff6ff; padding: 10px; border-radius: 8px 8px 0 8px; align-self: flex-end; max-width: 85%; border: 1px solid #bfdbfe; margin-left: 15px;">
            <strong style="color: #1d4ed8;">You:</strong> ${message}
        </div>
    `;
    
    // Clear the input and scroll down
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Ipakita ang "Typing..." indicator
    const typingId = "typing-" + Date.now();
    chatBox.innerHTML += `
        <div id="${typingId}" style="align-self: flex-start; color: #64748b; font-size: 11px; margin-top: 5px;">
            MPAI is typing...
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Simulated AI Response
    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove(); // Tanggalin ang "typing..."

        let aiReply = "I received your message. I am currently in simulation mode. Connect me to the Gemini API to enable full conversational capabilities!";
        
        // Simpleng logic para magmukhang matalino sa simulation
        if (message.toLowerCase().includes("kpi")) {
            aiReply = "I can definitely help with KPIs. Please provide the department and role, and I will draft a tracking matrix for you.";
        }

        chatBox.innerHTML += `
            <div style="background: white; padding: 10px; border-radius: 8px 8px 8px 0; border: 1px solid #e2e8f0; align-self: flex-start; max-width: 90%; margin-right: 15px;">
                <strong style="color: #0055aa;">MPAI:</strong> ${aiReply}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1200);
}

// Function para sa Quick Generate Button
function generateManlyAiPrompt() {
    const role = document.getElementById("inUserRole").value;
    const dept = document.getElementById("inUserDept").value;
    const firstEl = document.getElementById("inUserFirst");
    const firstName = (firstEl && firstEl.value.trim()) ? firstEl.value.trim() : "[Trainee Name]";
    
    const inputField = document.getElementById("inAiChatMessage");
    if (inputField) {
        // Ilagay ang text sa input field tapos i-send automatically
        inputField.value = `Please generate a KPI prompt for ${firstName} (${role} - ${dept}).`;
        sendManlyAiMessage();
    }
}