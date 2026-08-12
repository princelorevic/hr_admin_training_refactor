async function handleLogin(event) {
    event.preventDefault(); // Pipigilan nito ang page na mag-refresh

    // Kukunin natin ang values mula sa input fields ng login form mo
    // Gagamitin natin ang employeeId as "email" base sa backend setup natin
    const email = document.getElementById('employeeId').value.trim();
    const password = document.getElementById('password').value;

    try {
        // Iko-connect natin ito sa Port 3000 Backend natin
        const response = await fetch('https://hr-admin-training-refactor.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();

        // Kapag successful ang login
        if (response.ok) {
            // I-save ang user details sa browser (LocalStorage) para magamit sa Dashboard
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userRole', data.user.role);

            alert(`Welcome back, ${data.user.name}!`);

            // I-redirect ang user sa tamang dashboard base sa kanilang Role
            if (data.user.role === 'Admin') {
                window.location.href = '../hr_admin_training_refactor/public/index_admin.html';
            } else if (data.user.role === 'Trainee') {
                window.location.href = '../hr_admin_training_refactor/public/views/trainee/index_trainee.html';
            } else if (data.user.role === 'Supervisor') {
                // Titiyakin nitong mapupunta rin ang supervisor sa tamang path
                window.location.href = '../hr_admin_training_refactor/public/views/supervisor/index_supervisor.html'; 
            } else {
                alert('Role access not configured yet.');
            }
        } else {
            // Kapag mali ang email o password
            alert(`Login Failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Cannot connect to the server. Please ensure the backend is running.');
    }
}