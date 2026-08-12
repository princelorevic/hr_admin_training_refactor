// Variable para i-store ang link na galing sa database
let googleFormLinkFromAdmin = "";

document.addEventListener('DOMContentLoaded', async () => {
    const traineeId = localStorage.getItem('userId');
    // const userRole = localStorage.getItem('userRole'); // Pwede mong i-uncomment kung gusto mong higpitan sa Trainee lang

    if (!traineeId) {
        window.location.href = '/hr_admin_training_refactor/public/website/login.html'; 
        return;
    }

    try {
        const response = await fetch(`https://hr-admin-training-refactor.onrender.com/api/trainee/${traineeId}`);
        const traineeData = await response.json();

        if (response.ok) {

            // ============================================================
            // LOAD KPI AGENT REQUIREMENT
            // ============================================================

            // console.log("========== TRAINING REQUIREMENTS ==========");
            // console.log("Trainee ID:", traineeId);
            // console.log("Learning Style Required:", traineeData.learning_style_required);
            // console.log("Learning Style:", traineeData.style);
            // console.log("KPI Agent:", kpiAgentData);

            // 1. I-display sa UI
            if(document.getElementById('userGreeting')) document.getElementById('userGreeting').innerText = `Welcome, ${traineeData.name}!`;
            if(document.getElementById('profileName')) document.getElementById('profileName').value = traineeData.name;
            if(document.getElementById('profileEmail')) document.getElementById('profileEmail').value = traineeData.email;
            if(document.getElementById('traineeName')) document.getElementById('traineeName').innerText = traineeData.name;
            
            if(document.getElementById('productAssignment')) document.getElementById('productAssignment').innerText = traineeData.product_assignment || 'None';
            if(document.getElementById('industryAssignment')) document.getElementById('industryAssignment').innerText = traineeData.industry_assignment || 'None';

            // 2. I-load ang mga dashboard stats natin
            if(document.getElementById('dashboardStatsContainer')) {
                loadDashboardData(); 
            }

            // ============================================================
            // 3. TRAINING REQUIREMENTS
            // ============================================================

            googleFormLinkFromAdmin =
                traineeData.google_form_url ||
                traineeData.assessment_link ||
                '';

            // ------------------------------------------------------------
            // LEARNING STYLE REQUIREMENT
            // ------------------------------------------------------------

            const hasLearningTag =
                traineeData.style &&
                traineeData.style !== 'Not Assessed' &&
                traineeData.style.trim() !== '';

            // 1. I-check kung may valid na Google Form link
            const hasGoogleFormLink = googleFormLinkFromAdmin && googleFormLinkFromAdmin.trim() !== '';

            // 2. Kung may link at wala pang learning style result, pending siya!
            const learningStylePending = hasGoogleFormLink && !hasLearningTag;
            
            // Re-assign natin itong variable para tama ang log sa console
            const isLearningStyleRequired = hasGoogleFormLink;

            // ------------------------------------------------------------
            // KPI AGENT REQUIREMENT
            // ------------------------------------------------------------

            const kpiAgentData =
                await loadTraineeKpiAgent(traineeId);

            const kpiAgentPending =
                !kpiAgentData.assigned;

            // ------------------------------------------------------------
            // DEBUG
            // ------------------------------------------------------------

            console.log("========== TRAINING REQUIREMENTS ==========");
            console.log("Trainee ID:", traineeId);
            console.log("Learning Style Required:", isLearningStyleRequired);
            console.log("Learning Style:", traineeData.style);
            console.log("Learning Style Pending:", learningStylePending);
            console.log("KPI Agent:", kpiAgentData);

            console.log("KPI Agent Pending:", kpiAgentPending);
            // ============================================================
            // 4. BIND GEMINI LINK TO UI BUTTON
            // ============================================================
            if (kpiAgentData && kpiAgentData.gem_link) {
                const btnOpenGemini = document.getElementById('btnOpenGemini');
                if (btnOpenGemini) {
                    btnOpenGemini.href = kpiAgentData.gem_link;
                }
            }

            // ------------------------------------------------------------
            // SHOW POPUP ONLY IF SOMETHING IS PENDING
            // ------------------------------------------------------------
            if (learningStylePending || kpiAgentPending) {

                const modalElement =
                    document.getElementById('onboardingModal');

                if (modalElement) {

                    const modalTitle =
                        document.getElementById('onboardingModalTitle');

                    const modalHeading =
                        document.getElementById('onboardingModalHeading');

                    const modalDescription =
                        document.getElementById('onboardingModalDescription');

                    const modalInfo =
                        document.getElementById('onboardingModalInfo');

                    const modalAction =
                        document.getElementById('onboardingModalAction');


                    // ====================================================
                    // CASE 1: LEARNING STYLE IS PENDING
                    // ====================================================
                    if (learningStylePending) {

                        modalTitle.innerText =
                            "👋 Welcome to your Trainee Portal!";

                        modalHeading.innerText =
                            "Setup Your Learning Profile";

                        modalDescription.innerHTML =
                            `Before you begin your courses, let's determine your
                            <strong>Learning Tag</strong>. This quick assessment helps
                            us personalize your training based on how you learn best
                            (Visual, Auditory, or Kinesthetic).`;

                        modalInfo.innerHTML =
                            `⏳ <strong>Estimated time:</strong> 3-5 minutes only.`;

                        modalAction.style.display = "inline-block";

                        modalAction.innerText =
                            "Start Assessment Now";

                        modalAction.onclick =
                            startLearningAssessment;
                    }


                    // ====================================================
                    // CASE 2: KPI AGENT IS PENDING
                    // ====================================================
                    else if (kpiAgentPending) {

                        modalTitle.innerText =
                            "🤖 Training Requirement";

                        modalHeading.innerText =
                            "AI KPI Agent Setup";

                        modalDescription.innerHTML =
                            `Your Learning Style assessment is already complete.
                            Your next training requirement is the
                            <strong>AI KPI Agent</strong>.`;

                        modalInfo.innerHTML =
                            `⏳ <strong>Status:</strong> Waiting for Admin assignment.`;

                        // Walang action muna habang Pending pa ang KPI Agent
                        modalAction.style.display = "none";
                    }


                    // ====================================================
                    // SHOW MODAL
                    // ====================================================
                    const onboardingModal =
                        new bootstrap.Modal(modalElement);

                    onboardingModal.show();
                }
            }
        }
    } catch (error) {
        console.error("Hindi maka-connect sa server:", error);
    }
});

// Function kapag pinindot ang "Start Assessment Now" sa popup
function startLearningAssessment() {
    if (googleFormLinkFromAdmin) {
        // Buksan ang Google Form sa bagong tab
        window.open(googleFormLinkFromAdmin, '_blank');
        
        // Isara ang popup modal sa system natin
        const modalEl = document.getElementById('onboardingModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
    } else {
        alert("Walang Google Form link na nai-set ang Admin para sa account na ito.");
    }
}

// Function para sa Dashboard Stats (Mock Data)
function loadDashboardData() {
    const traineeData = {
        stats: { enrolled: 4, completed: 1, pending: 2 },
        assignment: {
            product: "120L Black Series Mobile Bin",
            industry: "Waste Management and Recycling",
            supervisor: "Maria Clara"
        }
    };

    const statsContainer = document.getElementById('dashboardStatsContainer');
    if(statsContainer) {
        statsContainer.innerHTML = `
            <div class="col-md-4">
                <div class="card bg-primary text-white shadow-sm border-0 h-100">
                    <div class="card-body py-4">
                        <h6 class="text-uppercase fw-semibold mb-1">Enrolled Courses</h6>
                        <h1 class="display-4 fw-bold mb-0">${traineeData.stats.enrolled}</h1>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-success text-white shadow-sm border-0 h-100">
                    <div class="card-body py-4">
                        <h6 class="text-uppercase fw-semibold mb-1">Completed</h6>
                        <h1 class="display-4 fw-bold mb-0">${traineeData.stats.completed}</h1>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-warning text-dark shadow-sm border-0 h-100">
                    <div class="card-body py-4">
                        <h6 class="text-uppercase fw-semibold mb-1">Pending Evaluations</h6>
                        <h1 class="display-4 fw-bold mb-0">${traineeData.stats.pending}</h1>
                    </div>
                </div>
            </div>
        `;
    }

    const focusCard = document.getElementById('trainingFocusCard');
    if(focusCard) {
        focusCard.innerHTML = `
            <div class="card-header bg-white border-bottom border-light">
                <h5 class="mb-0 text-primary fw-bold">🎯 Your Training Focus</h5>
            </div>
            <div class="card-body bg-light">
                <p class="mb-2">Your current assignments and evaluation metrics will be focused on the following areas:</p>
                <ul class="list-group list-group-flush rounded shadow-sm">
                    <li class="list-group-item"><strong>Product Masterclass:</strong> ${traineeData.assignment.product}</li>
                    <li class="list-group-item"><strong>Target Industry:</strong> ${traineeData.assignment.industry}</li>
                    <li class="list-group-item"><strong>Evaluating Supervisor:</strong> ${traineeData.assignment.supervisor}</li>
                </ul>
            </div>
        `;
    }
}

async function loadTraineeKpiAgent(traineeId) {
    try {
        const response = await fetch(
            `https://hr-admin-training-refactor.onrender.com/api/trainee/${traineeId}/kpi-agent`
        );

        if (response.status === 404) {
            return {
                assigned: false,
                status: 'Pending',
                gem_link: null
            };
        }

        if (!response.ok) {
            throw new Error(`KPI Agent request failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            assigned: data.status === 'Assigned' && !!data.gem_link,
            status: data.status,
            gem_link: data.gem_link || null
        };

    } catch (error) {
        console.error('Error loading KPI Agent:', error);

        return {
            assigned: false,
            status: 'Unavailable',
            gem_link: null
        };
    }
}