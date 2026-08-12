async function handleLogin(event) {
    event.preventDefault(); // Pipigilan nito ang page na mag-refresh

    // Kukunin natin ang values mula sa input fields
    const email = document.getElementById('employeeId').value.trim();
    const password = document.getElementById('password').value;

    // 🛡️ SAFETY CHECK: Para hindi mag-400 Error, pipigilan na natin agad kung blangko
    if (!email || !password) {
        alert("Please enter both your Employee ID and Password.");
        return;
    }

    try {
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
            // I-save ang user details sa browser (LocalStorage)
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userRole', data.user.role);

            alert(`Welcome back, ${data.user.name}!`);

            // 🚀 FIXED REDIRECTS FOR RENDER LIVE SERVER
            if (data.user.role === 'Admin') {
                window.location.href = '/public/index_admin.html';
            } else if (data.user.role === 'Trainee') {
                window.location.href = '/public/views/trainee/index_trainee.html';
            } else if (data.user.role === 'Supervisor') {
                window.location.href = '/public/views/supervisor/index_supervisor.html'; 
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