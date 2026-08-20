document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('profileSettingsForm')) {
        loadProfileData();
        
        // Logic para sa Profile Update Request
        const btnUpdate = document.getElementById('btnUpdateSettings');
        if (btnUpdate) {
            btnUpdate.addEventListener('click', () => {
                alert('A request has been sent to your Admin/Supervisor to update your profile details.');
            });
        }

        // Logic para sa Direct Change Password (May Safety Check)
        const btnChangePass = document.getElementById('btnChangePassword');
        if (btnChangePass) {
            btnChangePass.addEventListener('click', handlePasswordChange);
        }

        // Logic para sa Show/Hide Password (May Safety Check)
        const toggleButtons = document.querySelectorAll('.toggle-password');
        if (toggleButtons.length > 0) {
            toggleButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    const inputField = document.getElementById(targetId);
                    
                    if (inputField) {
                        if (inputField.type === 'password') {
                            inputField.type = 'text';
                            this.innerText = 'Hide';
                        } else {
                            inputField.type = 'password';
                            this.innerText = 'Show';
                        }
                    }
                });
            });
        }
    }
});

function loadProfileData() {
    // Mock Data reflecting admin setup
    const userData = {
        name: "Juan Dela Cruz", // Nilagyan ko muna ng sample name para hindi mag-error ang split()
        supervisor: "Admin User",
        product: "Injection Molding",
        industry: "Manufacturing"
    };

    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        // Para iwas error kung sakaling walang space ang pangalan
        const firstName = userData.name ? userData.name.split(' ')[0] : "Trainee";
        userGreeting.innerText = `Hello, ${firstName}!`;
    }

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.value = userData.name;

    const requirementsContainer = document.getElementById('adminRequirementsContainer');
    if (requirementsContainer) {
        requirementsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-12 mb-3">
                    <label class="form-label text-muted">Assigned Supervisor</label>
                    <input type="text" class="form-control bg-light" value="${userData.supervisor}" readonly>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Product Assignment</label>
                    <input type="text" class="form-control bg-light" value="${userData.product}" readonly>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Industry Focus</label>
                    <input type="text" class="form-control bg-light" value="${userData.industry}" readonly>
                </div>
            </div>
        `;
    }
}

function handlePasswordChange() {
    const currentPassEl = document.getElementById('currentPassword');
    const newPassEl = document.getElementById('newPassword');
    const confirmPassEl = document.getElementById('confirmPassword');

    // Basic Validation kung nag-exist na ang mga fields sa HTML
    if (!currentPassEl || !newPassEl || !confirmPassEl) return;

    const currentPass = currentPassEl.value;
    const newPass = newPassEl.value;
    const confirmPass = confirmPassEl.value;

    if (!currentPass || !newPass || !confirmPass) {
        alert('Please fill out all password fields.');
        return;
    }

    if (newPass !== confirmPass) {
        alert('New password and Confirm password do not match!');
        return;
    }

    if (newPass.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
    }

    // Simulate Success
    alert('Success! Your password has been updated.');
    
    // Clear fields and reset buttons after success
    currentPassEl.value = '';
    newPassEl.value = '';
    confirmPassEl.value = '';
    
    // Ibalik sa "Show" ang lahat ng buttons kung sakaling naiwang naka-"Hide"
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        const targetId = button.getAttribute('data-target');
        const inputField = document.getElementById(targetId);
        if (inputField) {
            inputField.type = 'password';
            button.innerText = 'Show';
        }
    });
}