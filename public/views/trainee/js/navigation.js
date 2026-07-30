document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#sidebarNav .nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow logout to redirect normally
            if(this.innerText === 'Logout') return; 
            
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            this.classList.add('active');
            
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            pageTitle.innerText = this.innerText;
        });
    });
});