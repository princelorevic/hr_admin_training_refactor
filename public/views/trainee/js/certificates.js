document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('certificatesContainer')) {
        loadCertificates();
    }
});

function loadCertificates() {
    const container = document.getElementById('certificatesContainer');
    // For now, let's simulate an empty state
    const hasCertificates = false;

    if (!hasCertificates) {
        container.innerHTML = `
            <div class="fs-1 mb-3 text-warning">🏆</div>
            <h5 class="text-muted fw-bold">No certificates earned yet</h5>
            <p class="text-secondary">Complete a training program and pass the evaluations to generate your certificate.</p>
        `;
    }
}