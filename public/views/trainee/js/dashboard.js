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
        const response = await fetch(`http://localhost:3000/api/trainee/${traineeId}`);
        const traineeData = await response.json();

        if (response.ok) {
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

            // 3. ✨ LOGIC PARA SA FIRST-TIME POPUP
            googleFormLinkFromAdmin = traineeData.google_form_url || traineeData.assessment_link; 
            
            // I-check kung may learning tag na siya (tulad ng Visual, Auditory, etc.)
            const hasLearningTag = traineeData.style && traineeData.style !== 'Not Assessed' && traineeData.style !== '';
            
            // TINANGGAL NATIN YUNG LINK REQUIREMENT DITO PARA LUMABAS ULIT ANG POPUP
            if (!hasLearningTag) {
                
                // Kung walang nakuhang link sa database (dahil test account), gagamit muna tayo ng dummy link
                if (!googleFormLinkFromAdmin) {
                    console.log("Walang link sa database. Gumagamit ng test link...");
                    googleFormLinkFromAdmin = "https://docs.google.com/forms/"; 
                }

                const onboardingModal = new bootstrap.Modal(document.getElementById('onboardingModal'));
                onboardingModal.show();
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