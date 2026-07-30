document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('coursesListContainer')) {
        loadCourses();
    }
});

function loadCourses() {
    const container = document.getElementById('coursesListContainer');
    
    // Mock Enrolled Courses
    const courses = [
        { title: "Sales Onboarding Fundamentals", progress: 80, desc: "Learn the basics of identifying customer operational needs." },
        { title: "Product Features & Business Value", progress: 45, desc: "Master the feature-benefit-advantage framework." }
    ];

    container.innerHTML = '';
    
    courses.forEach(course => {
        container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="bg-secondary text-white d-flex align-items-center justify-content-center rounded-top" style="height: 140px;">
                        <span class="fs-1">📚</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark">${course.title}</h5>
                        <p class="card-text text-muted small">${course.desc}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between small fw-semibold mb-1">
                                <span class="text-secondary">Progress</span>
                                <span class="text-primary">${course.progress}%</span>
                            </div>
                            <div class="progress mb-3" style="height: 8px;">
                                <div class="progress-bar bg-primary" style="width: ${course.progress}%;"></div>
                            </div>
                            <button class="btn btn-outline-primary w-100 fw-semibold">Resume Learning</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}