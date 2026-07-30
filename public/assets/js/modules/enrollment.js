    function openEnrollUserInteractiveModal() { 
        document.getElementById("selEnrollDeptFilter").value = "ALL"; 
        document.getElementById("enrollUserModalOverlay").classList.remove("hidden"); 
        renderEnrollmentModalUsersListCanvas("ALL"); 
    }

    function closeEnrollUserInteractiveModal() { 
        document.getElementById("enrollUserModalOverlay").classList.add("hidden"); 
    }

    function filterEnrollmentUsersListByDept(val) { 
        renderEnrollmentModalUsersListCanvas(val); 
    }

    function renderEnrollmentModalUsersListCanvas(deptFilterKeyword) {
      const tbody = document.getElementById("tbodyModalEnrollUserRows"); tbody.innerHTML = "";
      globalUserMemoryArray.forEach(user => {
        if (deptFilterKeyword !== "ALL" && user.dept !== deptFilterKeyword) return; 
        let currentCourseEnrollments = courseEnrollmentDatabaseMap[currentSelectedCourseTitle] || [];
        let isAlreadyEnrolled = currentCourseEnrollments.some(e => e.name === user.name);
        let actionButtonString = isAlreadyEnrolled ? `<span style="color:#64748b; font-size:11px; font-weight:700;">ENROLLED</span>` : `<button class="btn-talent-blue" style="padding:4px 8px; font-size:10px;" onclick="executeEnrollUserActionToActiveCourse('${user.name}', '${user.role}', '${user.dept}')">Enroll</button>`;
        tbody.innerHTML += `<tr><td><strong>${user.name}</strong></td><td><span class="badge-role">${user.role}</span></td><td>${user.dept}</td><td>${actionButtonString}</td></tr>`;
      });
    }

    function executeEnrollUserActionToActiveCourse(name, role, dept) {
      if (!courseEnrollmentDatabaseMap[currentSelectedCourseTitle]) courseEnrollmentDatabaseMap[currentSelectedCourseTitle] = [];
      let dateStamp = new Date().toISOString().split('T')[0];
      courseEnrollmentDatabaseMap[currentSelectedCourseTitle].push({ name: name, role: role, dept: dept, status: "<span style='color:#10b981; font-weight:700;'>ACTIVE</span>", date: dateStamp, end: "--" });
      renderCourseSubUsersTableData(); renderEnrollmentModalUsersListCanvas(document.getElementById("selEnrollDeptFilter").value);
    }
