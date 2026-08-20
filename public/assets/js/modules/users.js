let isEditing = false;
let editId = null;


// ==========================================
// 1. ADD / CREATE NEW USER (WITH AI REQUIREMENT)
// ==========================================
async function handleUserCrudSubmissionPipeline(event) {
    event.preventDefault();

    // 1. KUNIN ANG BUTTON AT I-SAVE ANG ORIGINAL TEXT NITO
    const btnSubmit = document.getElementById('btnUserFormAction');
    const originalBtnText = btnSubmit.innerText;

    const firstName = document.getElementById('inUserFirst').value.trim();
    const middleName = document.getElementById('inUserMiddle').value.trim();
    const lastName = document.getElementById('inUserLast').value.trim();
    const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;

    const username = document.getElementById('inUsername').value.trim();
    const password = document.getElementById('inUserPass').value;
    const role = document.getElementById('inUserRole').value;
    const department = document.getElementById('inUserDept').value;

    const supervisorElement = document.getElementById('inUserSupervisor');
    let supervisor_id = null;
    if (supervisorElement && supervisorElement.value && supervisorElement.value !== "null") {
        supervisor_id = parseInt(supervisorElement.value) || null; 
    }

    // AI REQUIREMENT VALIDATION BLOCK (BYPASS KAPAG EDITING)
    const geminiLinkInput = document.getElementById('inGeminiLink');
    const geminiLink = geminiLinkInput ? geminiLinkInput.value.trim() : '';

    if (!isEditing && role === 'Trainee' && geminiLink === '') {
        const aiPanel = document.getElementById('traineeAiRequirementPanel');
        if(aiPanel) {
            aiPanel.style.border = "2px solid red";
            setTimeout(() => aiPanel.style.border = "1px solid #e2e8f0", 3000);
        }
        return; 
    }

    // KUNIN ANG VALUES NG LEARNING TAG CHECKBOXES
    let selectedStyles = [];
    let checkboxes = document.querySelectorAll('.chk-learning-style:checked');
    checkboxes.forEach((cb) => {
        selectedStyles.push(cb.value);
    });

    const learningTagResult = selectedStyles.length > 0 ? selectedStyles.join(', ') : 'Not Assessed';

    let googleFormLink = '';
    const chkLearningTag = document.getElementById('chkLearningTag');
    if (chkLearningTag && chkLearningTag.checked) {
        const linkInput = document.getElementById('inGoogleFormLink');
        googleFormLink = linkInput ? linkInput.value.trim() : '';
    }

    const learningStyleRequired = (chkLearningTag && chkLearningTag.checked) ? 1 : 0;

    const userData = {
        name: fullName,
        username: username,
        password: password,
        role: role,
        supervisor_id: supervisor_id,
        google_form_url: document.getElementById('inGoogleFormLink') ? document.getElementById('inGoogleFormLink').value : null
    };

console.log("========== NEW USERS.JS LOADED ==========");
console.log("USER DATA BEING SENT:", userData);

    const url = isEditing ? `${API_BASE_URL}/api/users/${editId}`: `${API_BASE_URL}/api/users`;
    const method = isEditing ? 'PUT' : 'POST';

    // 2. I-ACTIVATE ANG LOADING ANIMATION SA BUTTON
    btnSubmit.innerText = '⏳ Saving... Please wait';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    btnSubmit.style.opacity = '0.7';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {

    // ==========================================
    // ==========================================
// ASSIGN / UPDATE KPI AGENT GEM LINK
// ==========================================
if (role === 'Trainee' && geminiLink !== '') {

    const editTargetElement = document.getElementById('editUserTargetIdx');
    const safeEditId = editTargetElement ? editTargetElement.value : editId;
    const traineeId = isEditing ? safeEditId : result.userId;

    const kpiResponse = await fetch(
        `${API_BASE_URL}/api/trainee/${traineeId}/kpi-agent`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gem_link: geminiLink
            })
        }
    );

    const kpiResult = await kpiResponse.json();

    if (!kpiResponse.ok) {
        console.error("KPI Agent assignment failed:", kpiResult);

        alert(
            `Trainee account was saved, but the KPI Agent could not be assigned.\n\n${kpiResult.error || 'Unknown error'}`
        );

        resetUserFormStateDefault();
        fetchAndDisplayUsers();
        return;
    }

    console.log("KPI Agent assigned/updated successfully:", kpiResult);
};

    resetUserFormStateDefault();
    fetchAndDisplayUsers();

} else {
    alert(`Error: ${result.error}`);
}

    } catch (error) {
        console.error('Error creating user:', error);
        alert('Server is offline or starting up. Please try again in a few seconds.');
    } finally {
        // 3. IBALIK SA NORMAL ANG BUTTON KAHIT SUCCESS O ERROR
        btnSubmit.innerText = originalBtnText;
        btnSubmit.disabled = false;
        btnSubmit.style.cursor = 'pointer';
        btnSubmit.style.opacity = '1';
    }
}

// ==========================================
// 2. FETCH AND DISPLAY USERS (DATABASE)
// ==========================================
async function fetchAndDisplayUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const users = await response.json();

        // ============================
        // NEW: BRIDGE TO ADMIN SYSTEM
        // ============================
        window.globalUserMemoryArray = users;
        console.log("Global Users Loaded:", window.globalUserMemoryArray);

        if (typeof recalculateLmsStateTablesCanvas === "function") {
            recalculateLmsStateTablesCanvas();
        }
        // ============================

        const tbody = document.getElementById('tbodyUserRegistryRows');
        if (!tbody) return;

        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            const createdDate = new Date(user.created_at).toLocaleDateString();
            const supervisorText = user.supervisor_id ? `ID: ${user.supervisor_id}` : 'None';

            tr.innerHTML = `
                <td><strong>${user.name || 'N/A'}</strong></td>
                <td>${user.username || 'N/A'}</td>
                <td><span class="badge-role">${user.role || 'N/A'}</span></td>
                <td>${user.industry_assignment || 'N/A'}</td>
                <td>${supervisorText}</td>
                <td><span class="course-chip">Pending AI</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-action-sm btn-edit"
                        onclick="triggerUserEditModeSetup(${user.id})">
                        Edit
                    </button>

                    <button class="btn-action-sm btn-delete"
                        onclick="deleteUser(${user.id})">
                        Delete
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // ✨ 1. UPDATE SA TABLE REGISTRY COUNT ("Showing X users")
        const countElement = document.getElementById('userRegistryShowingCount');
        if (countElement) {
            countElement.innerText = users.length;
        }

        // ✨ 2. UPDATE SA DASHBOARD WIDGET ("Total Headcount Index")
        const dashCountElement = document.getElementById('lbl-dash-count');
        if (dashCountElement) {
            dashCountElement.innerText = users.length;
        }

    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// ==========================================
// 3. UI TOGGLES, DROPDOWNS, AND OVERRIDES
// ==========================================
function onRoleTypeChanged() {
    const role = document.getElementById('inUserRole').value;
    const aiPanel = document.getElementById('traineeAiRequirementPanel');
    const supervisorPanel = document.getElementById('supervisorPanel');
    const learningTagWrapper = document.getElementById('traineeLearningTagRequirementPanel'); 
    
    if (role === 'Trainee') {
        if(aiPanel) aiPanel.classList.remove('hidden');
        if(supervisorPanel) supervisorPanel.classList.remove('hidden');
        if(learningTagWrapper) learningTagWrapper.classList.remove('hidden'); 
        
        loadSupervisorDropdown(); 
    } else {
        if(aiPanel) aiPanel.classList.add('hidden');
        if(supervisorPanel) supervisorPanel.classList.add('hidden');
        if(learningTagWrapper) {
            learningTagWrapper.classList.add('hidden'); 
            
            
            const chk = document.getElementById('chkLearningTag');
            if(chk) chk.checked = false;
            
            const linkPanel = document.getElementById('learningTagPanel');
            if(linkPanel) linkPanel.classList.add('hidden');
            
            const inLink = document.getElementById('inGoogleFormLink');
            if(inLink) inLink.value = '';
        }
    }
}

// ITO ANG HINAHANAP NG HTML KANINA PARA HINDI MAG-ERROR
async function loadSupervisorDropdown() {
    try {
        const department = document.getElementById('inUserDept').value;
        const dropdown = document.getElementById('inUserSupervisor');
        if(!dropdown) return;

        const response = await fetch(`${API_BASE_URL}/api/users`);
        const users = await response.json();
        
        dropdown.innerHTML = '<option value="">Select Supervisor</option>';
        
        // Hahanapin natin yung mga totoong supervisor sa database na ka-department niya
        const supervisors = users.filter(u => u.role === 'Supervisor' && u.industry_assignment === department);
        
        supervisors.forEach(sup => {
            dropdown.innerHTML += `<option value="${sup.id}">${sup.name}</option>`;
        });
        
        dropdown.innerHTML += '<option value="null">None / Pending</option>';
    } catch (error) {
        console.error('Error loading supervisors', error);
    }
}

function toggleGeminiInstructions() {
    const instructionPanel = document.getElementById('geminiInstructionsPanel');
    if(instructionPanel) instructionPanel.classList.toggle('hidden');
}

function resetUserFormStateDefault() {
    const form = document.getElementById('userFormSubmitBlock');
    if(form) form.reset();
    
    // 🔥 DITO ANG FIX: I-reset ang edit state pabalik sa default
    isEditing = false;
    editId = null;
    const editTarget = document.getElementById('editUserTargetIdx');
    if(editTarget) editTarget.value = "-1";

    document.getElementById('inUserRole').value = 'Trainee'; 
    onRoleTypeChanged(); 
    
    // Ibalik ang UI sa "Add User" mode
    const titleElement = document.getElementById('userFormTitle');
    if(titleElement) titleElement.innerHTML = `📋 Provision New User Account`;
    
    const actionBtn = document.getElementById('btnUserFormAction');
    if(actionBtn) actionBtn.innerText = "Add User";
    
    const cancelBtn = document.getElementById('btnCancelUserEdit');
    if(cancelBtn) cancelBtn.classList.add('hidden');
}

// Papatayin natin ang lumang dummy function ng "Show Password"
window.togglePasswords = function() {
    const chk = document.getElementById('chkShowPasswords');
    const table = document.getElementById('tbodyUserRegistryRows');
    if(!table || !chk) return;
    
    const masks = table.querySelectorAll('.password-mask');
    const hashes = table.querySelectorAll('.password-hash');
    
    if(chk.checked) {
        masks.forEach(m => m.classList.add('hidden'));
        hashes.forEach(h => h.classList.remove('hidden'));
    } else {
        masks.forEach(m => m.classList.remove('hidden'));
        hashes.forEach(h => h.classList.add('hidden'));
    }
};

// ==========================================
// 4. AUTO-LOAD ON START
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayUsers();
    onRoleTypeChanged(); // Siguraduhing tama ang itsura ng form pagka-load
});

// ==========================================
// 5. EDIT USER SETUP (SINGLE PAGE MODE)
// ==========================================
window.triggerUserEditModeSetup = function(userId) {
    const user = window.globalUserMemoryArray.find(u => u.id == userId);
    
    if(!user) return;

    isEditing = true;
    editId = user.id;

    // Fill Basic Info
    const nameParts = user.name.split(' ');
    document.getElementById('inUserLast').value = nameParts.pop() || '';
    document.getElementById('inUserFirst').value = nameParts.join(' ') || '';


    // Load existing username during edit
    const usernameInput = document.getElementById('inUsername');

    if (usernameInput) {
        usernameInput.value = user.username || '';
        usernameInput.removeAttribute('required');
    }
    
    // NOTE: Blank ang password dahil hindi kailangan palitan kung edit lang.
    const passInput = document.getElementById('inUserPass');
    if (passInput) {
        passInput.value = ''; 
        passInput.removeAttribute('required'); // ✨ Pinatay ang HTML validation para sa password
    }

    // Patayin din ang HTML validation sa Gemini Link para hindi magloko ang form
    const geminiInput = document.getElementById('inGeminiLink');
    if (geminiInput) {
        geminiInput.removeAttribute('required');
        geminiInput.value = ''; // i-clear muna bago mag-load
        
        // I-fetch ang existing KPI Agent Gemini Link kung siya ay Trainee
        if (user.role === 'Trainee') {
            // GAGAMITIN NATIN ANG userId PARAMETER PARA HINDI MAGING BLANKO
            fetch(`${API_BASE_URL}/api/trainee/${userId}/kpi-agent`)
                .then(res => {
                    if (res.ok) return res.json();
                    return null; 
                })
                .then(data => {
                    if (data && data.gem_link) {
                        geminiInput.value = data.gem_link;
                    }
                })
                .catch(err => console.error("Error fetching KPI Agent:", err));
        }
    }

    document.getElementById('inUserRole').value = user.role;
    document.getElementById('inUserDept').value = user.industry_assignment || 'Sales Operations Division';
    
    if (typeof onRoleTypeChanged === "function") {
        onRoleTypeChanged();
    }

    // Load Supervisor
    setTimeout(() => { 
        if (document.getElementById('inUserSupervisor')) {
            document.getElementById('inUserSupervisor').value = user.supervisor_id || 'null';
        }
    }, 100); 

    // --- LEARNING TAG AT GOOGLE FORM LINK ---
    if (document.getElementById('inLearningTagResult')) {
        document.getElementById('inLearningTagResult').value = user.style && user.style !== '' ? user.style : 'Not Assessed';
    }

    const chkLearningTag = document.getElementById('chkLearningTag');
    const linkPanel = document.getElementById('learningTagPanel');
    const inGoogleFormLink = document.getElementById('inGoogleFormLink');
    const savedFormUrl = user.assessment_link;

    if (savedFormUrl && savedFormUrl.trim() !== '') { 
        if (chkLearningTag) chkLearningTag.checked = true;
        if (linkPanel) linkPanel.classList.remove('hidden');
        if (inGoogleFormLink) {
            inGoogleFormLink.value = savedFormUrl;
            inGoogleFormLink.removeAttribute('required'); // ✨ Pinatay ang HTML validation para sa link
        }
    } else { 
        if (chkLearningTag) chkLearningTag.checked = false;
        if (linkPanel) linkPanel.classList.add('hidden');
        if (inGoogleFormLink) {
            inGoogleFormLink.value = '';
            inGoogleFormLink.removeAttribute('required');
        }
    }

    // Set UI Mode
    const editTarget = document.getElementById('editUserTargetIdx');
    if(editTarget) editTarget.value = user.id;

    const titleElement = document.getElementById('userFormTitle');
    if(titleElement) titleElement.innerHTML = `✏️ Edit User Account: <span style="color:#0055aa;">${user.name}</span>`;
    
    const actionBtn = document.getElementById('btnUserFormAction');
    if(actionBtn) actionBtn.innerText = "Update User";
    
    const cancelBtn = document.getElementById('btnCancelUserEdit');
    if(cancelBtn) cancelBtn.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function toggleLearningTagPanel() {
    const isChecked = document.getElementById('chkLearningTag').checked;
    const panel = document.getElementById('learningTagPanel');
    
    if (isChecked) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
        document.getElementById('inGoogleFormLink').value = ''; // i-clear pag inuncheck
    }
}

async function deleteUser(userId) {

    const user = window.globalUserMemoryArray.find(u => u.id == userId);

    if (!user) {
        showError(
            "User Not Found",
            "The selected user could not be found."
        );
        return;
    }

    showConfirm(
        "Delete User",
        `Are you sure you want to permanently delete "${user.name}"?`,
        async function() {

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/users/${userId}`,
                    {
                        method: 'DELETE'
                    }
                );

                const result = await response.json();

                if (!response.ok) {

                    console.error("Delete user failed:", result);

                    showError(
                        "Delete Failed",
                        result.error || "Unable to delete the user."
                    );

                    return;
                }

                // Refresh table from database
                await fetchAndDisplayUsers();

                showSuccess(
                    "User Deleted",
                    `${user.name} has been permanently deleted.`
                );

            } catch (error) {

                console.error("Error deleting user:", error);

                showError(
                    "Server Error",
                    "The server is offline or unavailable. Please try again."
                );

            }

        }
    );
}

// --- LOGOUT CONFIRMATION FUNCTIONS ---

function promptLogoutConfirmation() {
    // Ipakita ang pop-up
    document.getElementById('logoutModalOverlay').classList.remove('hidden');
}

function closeLogoutModal() {
    // Itago ang pop-up kung pinindot ang Cancel
    document.getElementById('logoutModalOverlay').classList.add('hidden');
}

function executeLogout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/website/login.html';
}

function generateUsername() {

    const first = document.getElementById("inUserFirst").value
        .trim()
        .toLowerCase();

    const last = document.getElementById("inUserLast").value
        .trim()
        .toLowerCase();

    const usernameInput = document.getElementById("inUsername");

    if (!usernameInput) return;

    usernameInput.value = (first + last)
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
}