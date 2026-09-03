const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://hr-admin-training-refactor.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // 1. GET DATA FROM LOCALSTORAGE
    const supervisorId = localStorage.getItem('userId') || 1; 
    const supervisorDept = localStorage.getItem('userDept') || 'No Department Found';
    const supervisorName = localStorage.getItem('userName') || 'Angelene Mae Bantola Posadas';

    // 2. DISPLAY TO DASHBOARD
    document.getElementById('lblSupervisorName').innerText = supervisorName;
    document.getElementById('lblSupervisorType').innerText = supervisorDept;

    loadHandleMetrics(supervisorId);
    loadEnrolledTrainings(supervisorId);
    loadSuggestedTrainings(supervisorDept, supervisorId);
});

async function loadHandleMetrics(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/supervisor/${id}/metrics`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('metricActive').innerText = data.active_trainees || 0;
            document.getElementById('metricOngoing').innerText = data.ongoing_trainings || 0;
            document.getElementById('metricFinished').innerText = data.finished_trainings || 0;
        }
    } catch (error) {
        console.error("Error loading metrics:", error);
    }
}

async function loadEnrolledTrainings(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/supervisor/${id}/enrolled`);
        if (response.ok) {
            const courses = await response.json();
            const container = document.getElementById('enrolledContainer');
            container.innerHTML = '';
            
            if (courses.length === 0) {
                container.innerHTML = '<span style="color:#64748b; font-style:italic;">No active enrollments.</span>';
                return;
            }

            courses.forEach(c => {
                container.innerHTML += `<div class="enrolled-box">${c.title}</div>`;
            });
        }
    } catch (error) {
        console.error("Error loading enrolled courses:", error);
    }
}

async function loadSuggestedTrainings(dept, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/courses/suggested/${encodeURIComponent(dept)}`);
        if (response.ok) {
            const suggestions = await response.json();
            const container = document.getElementById('suggestedContainer');
            container.innerHTML = '';

            suggestions.forEach(course => {
                container.innerHTML += `
                    <div class="suggested-card">
                        <div class="suggested-content">${course.title}</div>
                        <button class="btn-request" onclick="requestEnrollment(${userId}, ${course.course_id}, this)">
                            + Request to enroll
                        </button>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading suggestions:", error);
    }
}

async function requestEnrollment(userId, courseId, btnElement) {
    btnElement.innerText = "⏳ Requesting...";
    btnElement.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/supervisor/request-enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, course_id: courseId })
        });

        if (response.ok) {
            btnElement.innerText = "✓ Requested";
            btnElement.style.color = "#10b981";
        } else {
            btnElement.innerText = "Error!";
            btnElement.disabled = false;
        }
    } catch (error) {
        console.error("Error requesting enrollment:", error);
        btnElement.innerText = "+ Request to enroll";
        btnElement.disabled = false;
    }
}

// --- LOGOUT MODAL FUNCTIONS ---
window.openLogoutModal = function() {
    document.getElementById('logoutModalOverlay').classList.remove('hidden');
};

window.closeLogoutModal = function() {
    document.getElementById('logoutModalOverlay').classList.add('hidden');
};

window.confirmLogout = function() {
    localStorage.clear(); 
    window.location.href = '../../website/login.html';
};