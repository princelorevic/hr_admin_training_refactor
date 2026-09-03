const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://hr-admin-training-refactor.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const sessionUser = JSON.parse(sessionStorage.getItem('user'));
    const supervisorId = sessionUser ? sessionUser.id : 1; 

    loadTeamReports(supervisorId);
});

async function loadTeamReports(supervisorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/supervisor/${supervisorId}/trainees`);
        const tbody = document.getElementById('reportsTableBody');
        
        if (response.ok) {
            const trainees = await response.json();
            tbody.innerHTML = ''; // Clear loading text

            if (trainees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b;">No trainees assigned to you currently.</td></tr>';
                return;
            }

            trainees.forEach(t => {
                // Formatting the KPI Status Badge
                let kpiBadgeClass = 'badge-kpi';
                let kpiStatusText = t.kpi_status || 'Not Started';
                if (kpiStatusText.toLowerCase() === 'active' || kpiStatusText.toLowerCase() === 'completed') {
                    kpiBadgeClass += ' active';
                }

                const row = `
                    <tr>
                        <td style="font-weight: 600;">${t.name}</td>
                        <td>${t.industry_assignment || '—'}</td>
                        <td><span class="badge-style">${t.style || 'Not Assessed'}</span></td>
                        <td><span class="${kpiBadgeClass}">${kpiStatusText}</span></td>
                        <td><button class="btn-view" onclick="viewTraineeDetails(${t.id})">View Progress</button></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Failed to load data.</td></tr>';
        }
    } catch (error) {
        console.error("Error loading team reports:", error);
        document.getElementById('reportsTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Connection error.</td></tr>';
    }
}

function viewTraineeDetails(traineeId) {
    // Dito natin ilalagay ang logic kung gusto mong magbukas ng modal o lumipat ng page 
    // para makita ang eksaktong courses na tapos na ng trainee
    alert(`Feature coming soon: View detailed progress for Trainee ID ${traineeId}`);
}