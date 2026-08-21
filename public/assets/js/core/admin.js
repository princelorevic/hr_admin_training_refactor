    let learningStylesPool = ["Visual", "Auditory", "Kinesthetic"];
    let currentUserPage = 1;
    const usersPerPage = 10;
  window.globalUserMemoryArray = window.globalUserMemoryArray || [];
    let globalCourseMemoryArray = [
      { title: "Sales Velocity Foundational Training", dept: "Sales Operations Division", prereq: "None (Core Entry Track)" },
      { title: "HR Dashboard Analytics Looker Studio", dept: "Human Resources Cluster", prereq: "None (Core Entry Track)" },
      { title: "Injection Molding Machine Protocol Alpha", dept: "Manufacturing Fleet Node", prereq: "None (Core Entry Track)" },
      { title: "Supply Chain Management Protocols", dept: "Manufacturing Fleet Node", prereq: "None (Core Entry Track)" },
      { title: "Office Ergonomics and Workplace Safety", dept: "Human Resources Cluster", prereq: "None (Core Entry Track)" }
    ];

    let courseEnrollmentDatabaseMap = {
      "Sales Velocity Foundational Training": [
        { name: "Juan Dela Cruz", role: "Trainee", dept: "Sales Operations Division", status: "<span style='color:#f59e0b; font-weight:700;'>IN PROGRESS (45%)</span>", date: "2026-03-15", end: "--" }
      ]
    };

    let currentCoursePage = 1; const coursesPerPage = 5;
    let dynamicCourseContentsSyllabusMap = {}; let dynamicCourseImageThumbnailsMap = {}; 

    let activeModalStateStep = 1; let activeTargetDeleteType = ""; let activeTargetDeleteIndex = -1;
    let currentSelectedCourseTitle = "";

    // Temporary storage buffer for active quiz build
    let activeQuizQuestionsBuffer = [];

    window.onload = function () {
      recalculateLmsStateTablesCanvas();
      activateBuilderLessonType('Content'); // Set Default Workspace Form
    };
    
    // ---------- TAB ROUTER FUNCTION ENGINE ----------
    

    function evaluatePrerequisiteConditionalVisibility(chk) { const w = document.getElementById("wrapper-prereq-selector"); w.classList.toggle("hidden", !chk); if(chk) populatePrerequisiteDropdownNodeSelector(); }
    function populatePrerequisiteDropdownNodeSelector() { const s = document.getElementById("inCoursePrereqSelectNode"); s.innerHTML = ""; globalCourseMemoryArray.forEach(c => { s.innerHTML += `<option value="${c.title}">${c.title}</option>`; }); }

    // 2-STEP PURGE SAFETY ENGINE
    function triggerSecurePurgeModalPipeline(typeString, indexNumber) {
      activeModalStateStep = 1; activeTargetDeleteType = typeString; activeTargetDeleteIndex = indexNumber;
      document.getElementById("modalTitleText").innerText = "⚠️ Security Verification (Step 1 of 2)";
      document.getElementById("modalTitleText").style.color = "#dc2626";
      document.getElementById("modalBodyText").innerText = "Are you sure you want to proceed with purging this record? This action cannot be undone.";
      document.getElementById("btnModalConfirmAction").innerText = "Yes, Proceed";
      document.getElementById("purgeModalSystemOverlay").classList.remove("hidden");
    }

    async function processActiveModalConfirmationTrigger() {
  if (activeModalStateStep === 1) {
    activeModalStateStep = 2;
    document.getElementById("modalTitleText").innerText = "🚨 Final Verification Required. (Step 2 of 2)";
    document.getElementById("modalTitleText").style.color = "#cc0000";
    document.getElementById("modalBodyText").innerText = "This action is irreversible. Confirm deletion only if verified.";
    document.getElementById("btnModalConfirmAction").innerText = "CONFIRM DELETE";
  } else if (activeModalStateStep === 2) {
    
    if (activeTargetDeleteType === 'USER') {
      // BAGONG DATABASE-DRIVEN DELETE LOGIC
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${activeTargetDeleteIndex}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log("User successfully deleted from database.");
            // Tawagin ang fetch para mag-refresh ang data mula sa MySQL
            if (typeof fetchAndDisplayUsers === "function") {
                fetchAndDisplayUsers(); 
            }
        } else {
            const errorData = await response.json();
            alert(`Error deleting user: ${errorData.error}`);
        }
      } catch (error) {
        console.error("API Error during deletion:", error);
      }
      
      closePurgeModalSystemPipeline();

    } else if (activeTargetDeleteType === 'COURSE') {
      // I-keep muna natin yung dating logic para sa COURSE hanggang sa dumating tayo sa Sprint 4
      globalCourseMemoryArray.splice(activeTargetDeleteIndex, 1);
      const maxPage = Math.ceil(globalCourseMemoryArray.length / coursesPerPage) || 1;
      if (currentCoursePage > maxPage) currentCoursePage = maxPage;
      closePurgeModalSystemPipeline();
      recalculateLmsStateTablesCanvas();
    }
  }
}

    function closePurgeModalSystemPipeline() { document.getElementById("purgeModalSystemOverlay").classList.add("hidden"); activeModalStateStep = 1; }

    function openEnrollUserInteractiveModal() { document.getElementById("selEnrollDeptFilter").value = "ALL"; document.getElementById("enrollUserModalOverlay").classList.remove("hidden"); renderEnrollmentModalUsersListCanvas("ALL"); }
    function closeEnrollUserInteractiveModal() { document.getElementById("enrollUserModalOverlay").classList.add("hidden"); }
    function filterEnrollmentUsersListByDept(val) { renderEnrollmentModalUsersListCanvas(val); }

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

    function openCourseSubManagementPanel(courseTitle) {
      currentSelectedCourseTitle = courseTitle;
      document.getElementById("lbl-metrics-view-course-title").innerText = `📘 Course Node Matrix: [${courseTitle}]`;
      SwitchTalentLmsTab('view-course-metrics', null);
      switchMetricsInnerPane('pane-metrics-users', document.getElementById('tab-btn-users'));
      renderCourseSubUsersTableData();
    }

    // UPDATE NOTE: Kapag idudugtong na ang AI data sa graphs, 
    // mag-append ng hook function dito sa switch pane para mag-refresh ang UI metrics!
    function switchMetricsInnerPane(panelElementId, buttonNode) {
      document.querySelectorAll('.metrics-inner-panel-block').forEach(p => p.classList.add('hidden'));
      document.getElementById(panelElementId).classList.remove('hidden');
      document.querySelectorAll('.btn-icon-tab').forEach(b => b.classList.remove('active-icon'));
      buttonNode.classList.add('active-icon');
    }

    function renderCourseSubUsersTableData() {
      const tbody = document.getElementById("tbodyCourseUsersSubMetrics"); tbody.innerHTML = "";
      let activeCourseEnrollmentsList = courseEnrollmentDatabaseMap[currentSelectedCourseTitle] || [];
      if (activeCourseEnrollmentsList.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; font-style:italic;">No corporate users enrolled inside this track yet.</td></tr>`; return; }
      activeCourseEnrollmentsList.forEach(t => { tbody.innerHTML += `<tr><td><strong>👤 ${t.name}</strong></td><td><span class="badge-role">${t.role}</span></td><td>${t.dept}</td><td>${t.status}</td><td>${t.date}</td><td>${t.end}</td></tr>`; });
    }

    function navigateToCourseBuilderScreen() {
      document.getElementById("lbl-builder-hero-title").innerText = currentSelectedCourseTitle;
      document.getElementById("lbl-builder-hero-subtitle").innerText =
        courseSubtitleMap[currentSelectedCourseTitle] || "MPI Training Content Engine Management Framework Terminal";

      SwitchTalentLmsTab('view-course-builder', null);
      refreshCourseHeroImageStatePreview();
      renderCourseDynamicTimelineUnitsCanvas();
    }   
    function handleCourseHeroImageUploadStream(f) { if (f.files && f.files[0]) { const reader = new FileReader(); reader.onload = function(e) { dynamicCourseImageThumbnailsMap[currentSelectedCourseTitle] = e.target.result; refreshCourseHeroImageStatePreview(); }; reader.readAsDataURL(f.files[0]); } }
    function refreshCourseHeroImageStatePreview() { const box = document.getElementById("div-hero-avatar-box"); const textLabel = document.getElementById("lbl-hero-avatar-placeholder"); let urlData = dynamicCourseImageThumbnailsMap[currentSelectedCourseTitle]; if(urlData) { textLabel.classList.add("hidden"); box.style.backgroundImage = `url('${urlData}')`; } else { textLabel.classList.remove("hidden"); box.style.backgroundImage = "none"; } }

    // ==========================================================================
    // 👑 ENHANCED LMS ENGINE: DYNAMIC FORM WORKSPACE ROUTER
    // ==========================================================================
    function activateBuilderLessonType(typeCode) {
      document.querySelectorAll('.builder-sidebar-menu .builder-sidebar-item').forEach(item => item.classList.remove('active-item'));
      const activeBtn = document.getElementById(`item-type-${typeCode}`);
      if(activeBtn) activeBtn.classList.add('active-item');
      
      document.getElementById("lbl-active-editor-heading").innerText = `Construct ${typeCode} Module Element`;
      document.getElementById("cacheSelectedTypeToken").value = typeCode;
      
      const formFieldsContainer = document.getElementById("dynamicFormFieldsWorkspace");
      const durationBlock = `
      <div class="form-group-block">
        <label>Estimated Training Duration Minutes</label>
        <input type="number" id="inUnitDuration" min="1" value="15" placeholder="15">
      </div>`;
      
      if (typeCode === 'Content') {
        formFieldsContainer.innerHTML = `
        ${durationBlock}
          <div class="form-group-block">
            <label>Write Core Material Body Text Paragraphs</label>
            <textarea id="inUnitBodyText" rows="6" placeholder="Type module documents details here..."></textarea>
          </div>`;
      } 
      else if (typeCode === 'Webcontent') {
        formFieldsContainer.innerHTML = `
        ${durationBlock}
          <div class="form-group-block">
            <label>Input External Source Web URL Path</label>
            <input type="url" id="inUnitBodyText" placeholder="https://example.com/resource-node">
          </div>`;
      } 
      else if (typeCode === 'Video') {
        formFieldsContainer.innerHTML = `
        ${durationBlock}
          <div class="form-group-block">
            <label>Select Stream Provider / File Node</label>
            <select id="inVideoProvider" style="margin-bottom:12px;">
              <option value="YouTube">YouTube Embed Stream</option>
              <option value="Vimeo">Vimeo Enterprise Cloud</option>
              <option value="Direct">Direct MP4 Source URL</option>
            </select>
            <label>Stream Engine Target Video Source Link</label>
            <input type="text" id="inUnitBodyText" placeholder="Paste embed link / URL path...">
          </div>`;
      } 
      else if (typeCode === 'Test') {
        activeQuizQuestionsBuffer = []; // Reset sub-buffer
        formFieldsContainer.innerHTML = `
        ${durationBlock}
          <div style="background:#f1f5f9; padding:15px; border-radius:6px; margin-bottom:15px; border:1px solid #cbd5e1;">
            <h4 style="font-size:11px; text-transform:uppercase; color:#003366; margin-bottom:10px;">➕ Add Question Node to Quiz</h4>
            <div class="form-group-block"><label>Question Text Prompt</label><input type="text" id="quizQuestionPrompt" placeholder="What is standard procedure for machine calibration?"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
              <div><label style="font-size:10px;">Option A</label><input type="text" id="optA" style="padding:6px;"></div>
              <div><label style="font-size:10px;">Option B</label><input type="text" id="optB" style="padding:6px;"></div>
              <div><label style="font-size:10px;">Option C</label><input type="text" id="optC" style="padding:6px;"></div>
              <div><label style="font-size:10px;">Option D</label><input type="text" id="optD" style="padding:6px;"></div>
            </div>
            <div class="form-group-block">
              <label>Correct Choice Option Key</label>
              <select id="quizCorrectKey" style="padding:6px;">
                <option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option><option value="D">Option D</option>
              </select>
            </div>
            <button type="button" class="btn-talent-blue" style="background:#10b981; width:100%; font-size:11px;" onclick="addQuestionNodeToCurrentBuffer()">Inject Question</button>
          </div>
          <label>Questions Staged Pipeline Area</label>
          <div id="quizQuestionsStagingArea" style="max-height:180px; overflow-y:auto; margin-bottom:15px;">
            <p style="font-size:12px; color:#64748b; font-style:italic;">No questions injected yet inside this test.</p>
          </div>`;
      } 
      else if (typeCode === 'Survey') {
        formFieldsContainer.innerHTML = `
        ${durationBlock}
          <div class="form-group-block">
            <label>Survey Questionnaire Evaluation Metric Header</label>
            <input type="text" id="surveyQuestionPrompt" placeholder="Rate your confidence level on this operating protocol.">
          </div>
          <div class="form-group-block">
            <label>Evaluation Scale Configuration Matrix</label>
            <select id="inUnitBodyText">
              <option value="1-5 Scale">Likert Scale (1 - 5: Strongly Disagree to Strongly Agree)</option>
              <option value="Yes/No Binary">Binary Format Node (Yes / No Responses)</option>
              <option value="Text Feedback">Open-Ended Written Text Assessment Logs</option>
            </select>
          </div>`;
      }
    }

    function addQuestionNodeToCurrentBuffer() {
      const qText = document.getElementById("quizQuestionPrompt").value.trim();
      const a = document.getElementById("optA").value.trim(); const b = document.getElementById("optB").value.trim();
      const c = document.getElementById("optC").value.trim(); const d = document.getElementById("optD").value.trim();
      const key = document.getElementById("quizCorrectKey").value;
      if(!qText || !a || !b) {
          showWarning(
              "Incomplete Question",
              "Please complete the question and at least the first two answer choices."
          );
          return;
      }      
      activeQuizQuestionsBuffer.push({ question: qText, options: {A:a, B:b, C:c, D:d}, correct: key });
      document.getElementById("quizQuestionPrompt").value = ""; document.getElementById("optA").value = "";
      document.getElementById("optB").value = ""; document.getElementById("optC").value = ""; document.getElementById("optD").value = "";
      renderQuizBufferStagingAreaUI();
    }

    function renderQuizBufferStagingAreaUI() {
      const container = document.getElementById("quizQuestionsStagingArea"); container.innerHTML = "";
      if(activeQuizQuestionsBuffer.length === 0) { container.innerHTML = `<p style="font-size:12px; color:#64748b; font-style:italic;">No questions injected yet.</p>`; return; }
      activeQuizQuestionsBuffer.forEach((q, idx) => {
        container.innerHTML += `<div class="quiz-question-card"><strong>Q${idx+1}: ${q.question}</strong> <span style="color:#10b981;">(Key: ${q.correct})</span></div>`;
      });
    }

    function commitNewUnitToCourseTimeline() {
      const title = document.getElementById("inUnitTitle").value.trim(); const type = document.getElementById("cacheSelectedTypeToken").value;
      if(title === "") {
          showWarning(
              "Unit Heading Required",
              "Please enter a title for this unit."
          );
          return;
      }      

      let payloadData = null;
      if(type === 'Test') {
      if(activeQuizQuestionsBuffer.length === 0) {
          showWarning(
              "Quiz is Empty",
              "Please add at least one question before saving."
          );
          return;
      }        payloadData = [...activeQuizQuestionsBuffer];
      } else if (type === 'Video') {
        const provider = document.getElementById("inVideoProvider").value;
        const link = document.getElementById("inUnitBodyText").value.trim();
        payloadData = { provider: provider, streamUrl: link };
      } else {
        payloadData = document.getElementById("inUnitBodyText").value.trim();
      }
      
      if(!payloadData) {
          showError(
              "Invalid Request",
              "Unable to process the submitted form data."
          );
          return;
      }    
      if(!dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle]) dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle] = [];
      
      const durationValue = document.getElementById("inUnitDuration") ? document.getElementById("inUnitDuration").value.trim() : "15";
      dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle].push({
        title: title,
        type: type,
        bodyData: payloadData,
        duration: durationValue
      });      

      // Reset Default Form States
      document.getElementById("inUnitTitle").value = "";
      activateBuilderLessonType(type);
      renderCourseDynamicTimelineUnitsCanvas();
    }

    function getVideoPreviewHtml(url) {
      if (!url) return "";
      const cleanUrl = url.trim();
      let embedUrl = "";

      if (cleanUrl.includes("youtube.com/watch?v=")) {
        const videoId = cleanUrl.split("v=")[1].split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (cleanUrl.includes("youtu.be/")) {
        const videoId = cleanUrl.split("youtu.be/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (cleanUrl.includes("youtube.com/embed/")) {
        embedUrl = cleanUrl;
      } else if (cleanUrl.includes("vimeo.com/")) {
        const videoId = cleanUrl.split("vimeo.com/")[1].split("?")[0].split("/")[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      } else if (cleanUrl.includes("drive.google.com/file/d/")) {
        const fileId = cleanUrl.split("/d/")[1].split("/")[0];
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }

      if (cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
        return `
          <div style="margin-top:12px;border:1px solid #dbeafe;border-radius:6px;overflow:hidden;background:#000;">
            <video controls style="width:100%;height:190px;display:block;background:#000;">
              <source src="${cleanUrl}">
            </video>
          </div>`;
      }

      if (embedUrl) {
        return `
          <div style="margin-top:12px;border:1px solid #dbeafe;border-radius:6px;overflow:hidden;background:#000;">
            <iframe src="${embedUrl}" style="width:100%;height:190px;border:0;display:block;" allowfullscreen></iframe>
          </div>`;
      }

      return `
        <div style="margin-top:12px;border:1px solid #dbeafe;border-radius:6px;overflow:hidden;background:#fff;">
          <iframe src="${cleanUrl}" style="width:100%;height:190px;border:0;display:block;" allowfullscreen></iframe>
        </div>
        <div style="margin-top:6px;font-size:11px;color:#64748b;">Some providers may block embedded preview.</div>`;
    }

    function renderCourseDynamicTimelineUnitsCanvas() {
      const container = document.getElementById("courseUnitsTimelineContainer");
      container.innerHTML = "";

      let list = dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle] || [];

      if(list.length === 0) {
        container.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;"><span style="font-size:12px;font-style:italic;color:#64748b;">No modules drafted inside this course.</span></div>`;
        return;
      }

      list.forEach((u, i) => {
        let pre = "📄";
        if(u.type === "Webcontent") pre = "☁️";
        if(u.type === "Video") pre = "🎥";
        if(u.type === "Test") pre = "📝";
        if(u.type === "Survey") pre = "📊";

        let previewHtml = "";

        if (u.type === "Video") {
          const videoUrl = typeof u.bodyData === "object" ? u.bodyData.streamUrl : u.bodyData;
          previewHtml = getVideoPreviewHtml(videoUrl);
        }

        if (u.type === "Webcontent") {
          previewHtml = `<div style="margin-top:10px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;"><a href="${u.bodyData}" target="_blank" style="color:#0055aa;font-weight:700;">Open web resource</a></div>`;
        }

        if (u.type === "Content") {
          previewHtml = `<div style="margin-top:10px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;color:#475569;line-height:1.5;">${u.bodyData || "No content body added."}</div>`;
        }

        container.innerHTML += `
          <div style="padding:12px 16px;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;font-weight:600;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span>${pre}</span>
                <span>${u.title}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:10px;padding:2px 6px;background:#eff6ff;color:#1d4ed8;border-radius:4px;text-transform:uppercase;">${u.type}</span>
                <span style="font-size:10px;padding:2px 6px;background:#f0fdf4;color:#166534;border-radius:4px;text-transform:uppercase;">${u.duration || 15} min</span>
                <button onclick="removeSpecificSyllabusUnitNode(${i})" style="background:none;border:none;color:#ef4444;font-weight:700;cursor:pointer;">×</button>
              </div>
            </div>
            ${previewHtml}
          </div>`;
      });
    }

    function removeSpecificSyllabusUnitNode(idx) { dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle].splice(idx, 1); renderCourseDynamicTimelineUnitsCanvas(); }
    function closeFileUploadModalSubNode() { document.getElementById("fileUploadModalOverlay").classList.add("hidden"); }
    function openFileUploadModalSubNode() { document.getElementById("fileUploadModalOverlay").classList.remove("hidden"); }
    function handleManualFileSelect(n) {
      if(n.files && n.files.length > 0) {
        processUploadedAssetFileRow(n.files[0].name, "Manual File Resource", "Local upload");
        n.value = "";
      }
    }    
    function processUploadedAssetFileRow(n, t, u = "Local stream node") { document.getElementById("tbodyCourseFilesSubMetrics").innerHTML += `<tr><td style="color:#0055aa; font-weight:600;">📄 ${n}</td><td><span class="badge-role">${t}</span></td><td>${u}</td></tr>`; closeFileUploadModalSubNode(); }

    function changeCoursePageGrid(offset) {
      const rows = typeof getFilteredCourseRows === "function" ? getFilteredCourseRows() : globalCourseMemoryArray;
      const maxPage = Math.ceil(rows.length / coursesPerPage) || 1;

      currentCoursePage += offset;
      if(currentCoursePage < 1) currentCoursePage = 1;
      if(currentCoursePage > maxPage) currentCoursePage = maxPage;

      renderCourseTableRowsPagedCanvas();
    }

    function renderCourseTableRowsPagedCanvas() {
      const tbody = document.getElementById("tbodyCourseRegistryRows"); tbody.innerHTML = "";
      const maxPage = Math.ceil(globalCourseMemoryArray.length / coursesPerPage) || 1;
      let start = (currentCoursePage - 1) * coursesPerPage; let slice = globalCourseMemoryArray.slice(start, start + coursesPerPage);
      slice.forEach((course, localIdx) => {
        let globalIdx = start + localIdx;
        tbody.innerHTML += `<tr onclick="openCourseSubManagementPanel('${course.title}')" style="cursor: pointer;"><td><strong>📘 ${course.title}</strong></td><td><span style="color:#003366; font-weight:700;">${course.dept}</span></td><td><span style="font-family:monospace; font-size:11px; color:#475569;">${course.prereq}</span></td><td><button class="btn-action-sm btn-edit" onclick="event.stopPropagation(); triggerCourseEditModeSetup(${globalIdx})">✏️ Edit</button><button class="btn-action-sm btn-duplicate" onclick="event.stopPropagation(); executeCourseDuplicatePipeline(${globalIdx})">📋 Duplicate</button><button class="btn-action-sm btn-delete" onclick="event.stopPropagation(); triggerSecurePurgeModalPipeline('COURSE', ${globalIdx})">🗑️ Delete</button></td></tr>`;
      });
      document.getElementById("lbl-page-indicator").innerText = `Page ${currentCoursePage} of ${maxPage}`;
      document.getElementById("btn-page-prev").disabled = (currentCoursePage === 1); document.getElementById("btn-page-next").disabled = (currentCoursePage === maxPage);
    }

    function recalculateLmsStateTablesCanvas() {
    // 1. KUNIN ANG EXACT VALUES MULA SA SEARCH BAR AT DROPDOWN
    const searchInput = document.getElementById('searchNameInput');
    const filterSelect = document.getElementById('filterRoleSelect');
    
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : (window.keyword || "");
    const roleFilter = filterSelect ? filterSelect.value.toUpperCase() : (window.selectedRoleFilter || "");

    const userTbody = document.getElementById("tbodyUserRegistryRows");
    if (!userTbody) return;

    userTbody.innerHTML = "";

    // 2. SORTING ENGINE (Alphabetical base sa Name)
    globalUserMemoryArray.sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
    });

    // 3. FILTERING ENGINE (Hahanapin sa Name OR Username)
    const filteredUsers = globalUserMemoryArray.filter(user => {
        const fullName = (user.name || "").toLowerCase();
        const username = (user.username || "").toLowerCase();

        // Mag-match kung nag-type sa Name O Username
        const matchesSearch = keyword === "" || fullName.includes(keyword) || username.includes(keyword);

        const userRoleType = (user.role || "").toUpperCase();
        // Mag-match base sa napiling Role sa dropdown
        const matchesRole = roleFilter === "" || roleFilter === "ALL" || userRoleType.includes(roleFilter);

        return matchesSearch && matchesRole;
    });

    // 4. PAGINATION ENGINE
    const totalFiltered = filteredUsers.length;
    const maxPages = Math.ceil(totalFiltered / usersPerPage) || 1;
    
    // Proteksyon sa paglipat-lipat ng pages
    if (currentUserPage > maxPages) currentUserPage = maxPages;
    if (currentUserPage < 1) currentUserPage = 1;

    const startIndex = (currentUserPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedSlice = filteredUsers.slice(startIndex, endIndex);

    // Update Label Counters sa UI
    const showingCountEl = document.getElementById("userRegistryShowingCount");
    if (showingCountEl) {
        showingCountEl.innerText = totalFiltered > 0 
            ? `${startIndex + 1}-${Math.min(endIndex, totalFiltered)} of ${totalFiltered}`
            : "0";
    }
    
    const lblDashCount = document.getElementById("lbl-dash-count");
    if (lblDashCount) lblDashCount.innerText = globalUserMemoryArray.length;

    // 5. RENDER ROWS TO TABLE (EXACTLY 8 COLUMNS PARA SA BAGONG HEADERS)
    paginatedSlice.forEach((user) => {
        const fullName = user.name || "Unknown User";
        const username = user.username || "—";
        
        // Format Supervisor Assignment
        let supervisor = "—";
        if (user.role === "Trainee" || user.role === "TRAINEE") {
            supervisor = user.supervisor_id ? `ID: ${user.supervisor_id}` : "Pending";
        }

        // Format Date string
        const dateStr = user.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

        // Column Order: Name | Username | Role Type | Department | Supervisor | Learning Style Tag | Created | Actions
        userTbody.innerHTML += `
            <tr>
                <td><strong>${fullName}</strong></td>
                <td><span style="color:#0055aa; font-weight:600;">${username}</span></td>
                <td><span class="badge-role">${user.role || "—"}</span></td>
                <td>${user.industry_assignment || "—"}</td>
                <td>${supervisor}</td>
                <td><span class="badge-role" style="background:#fef3c7; color:#92400e;">${user.style || "Not Assessed"}</span></td>
                <td>${dateStr}</td>
                <td>
                    <button class="btn-action-sm btn-edit" onclick="triggerUserEditModeSetup(${user.id})">✏️ Edit</button>
                    <button class="btn-action-sm btn-delete" onclick="triggerSecurePurgeModalPipeline('USER', ${user.id})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });

    // 6. RENDER PAGE BUTTONS
    if (typeof renderUserPaginationControls === "function") {
        renderUserPaginationControls(maxPages);
    }
}

// ALAY NA FUNCTION PARA SA DYNAMIC NUMBERS AT PAGE NAVIGATION LIFECYCLE
function renderUserPaginationControls(maxPages) {
    const prevBtn = document.getElementById("btnUserPrev");
    const nextBtn = document.getElementById("btnUserNext");
    const container = document.getElementById("userPageNumbersContainer");

    if (!prevBtn || !nextBtn || !container) return;

    // Set disabled states para sa Edge boundary indicators
    prevBtn.disabled = (currentUserPage === 1);
    nextBtn.disabled = (currentUserPage === maxPages);

    container.innerHTML = "";
    
    // Bumuo ng numbered loops base sa max pages
    for (let i = 1; i <= maxPages; i++) {
        const isCurrent = (i === currentUserPage);
        const activeStyle = isCurrent 
            ? "background: #0055aa; color: white; font-weight: bold; border-color: #0055aa;" 
            : "background: white; color: #475569; border: 1px solid #cbd5e1;";

        container.innerHTML += `
            <button class="btn-page-number" style="padding: 4px 10px; cursor: pointer; border-radius: 4px; ${activeStyle}" onclick="goToUserPage(${i})">
                ${i}
            </button>
        `;
    }
}

function goToUserPage(pageNumber) {
    currentUserPage = pageNumber;
    recalculateLmsStateTablesCanvas();
}

    function togglePasswords() {
    recalculateLmsStateTablesCanvas();
  }

    function executeCourseDuplicatePipeline(idx) {
      const sourceCourse = globalCourseMemoryArray[idx];
      const newTitle = sourceCourse.title + " (Copy)";

      globalCourseMemoryArray.push({
        title: newTitle,
        dept: sourceCourse.dept,
        prereq: sourceCourse.prereq,
        status: "Draft"
      });

      if (dynamicCourseContentsSyllabusMap[sourceCourse.title]) {
        dynamicCourseContentsSyllabusMap[newTitle] = JSON.parse(JSON.stringify(dynamicCourseContentsSyllabusMap[sourceCourse.title]));
      }

      currentCoursePage = 1;
      recalculateLmsStateTablesCanvas();
    } 
    function resetCourseFormStateDefault() { document.getElementById("courseFormSubmitBlock").reset(); document.getElementById("editCourseTargetIdx").value = "-1"; document.getElementById("wrapper-prereq-selector").classList.add("hidden"); document.getElementById("courseFormTitle").innerText = "📖 Register Curriculum Track"; document.getElementById("btnCourseFormAction").innerText = "Add Course"; document.getElementById("btnCancelCourseEdit").classList.add("hidden"); }
    
    document.addEventListener("DOMContentLoaded", function () {
      const courseTable = document.getElementById("tbodyCourseRegistryRows");
      if (!courseTable) return;

      const addCourseRowTitles = function () {
        courseTable.querySelectorAll("tr").forEach(function (row) {
          if (!row.title) row.title = "Open course management panel";
        });
      };

      addCourseRowTitles();
      new MutationObserver(addCourseRowTitles).observe(courseTable, { childList: true });
    });
    
    let courseRegistrySearchText="",courseRegistryDeptFilter="ALL",courseRegistryStatusFilter="ALL",selectedCourseRegistryIdx=-1;

    function getCourseRegistryMeta(course,idx){
      const statuses=["Published","Draft","Needs Review","Archived"];
      const status=course.status||statuses[idx%statuses.length];
      return{status:status,modules:course.modules||(idx+4),enrolled:course.enrolled||(18+(idx*7)%43),completion:course.completion||(55+(idx*9)%40)};
    }

    function ensureCourseRegistryToolbar(){
      const tbody=document.getElementById("tbodyCourseRegistryRows");
      if(!tbody) return;

      const table=tbody.closest("table");
      if(!table) return;

      const tableWrap=table.closest(".scrollable-table-container") || table;
      const card=tableWrap.closest(".enterprise-data-card-wrapper");
      if(!card) return;

      if(document.getElementById("courseRegistryToolbar")) return;

      table.querySelector("thead").innerHTML=`<tr>
        <th>Curriculum Track</th>
        <th>Department</th>
        <th>Prerequisite</th>
        <th>Status</th>
        <th>Quick Metrics</th>
        <th>Actions</th>
      </tr>`;

      const toolbar=document.createElement("div");
      toolbar.id="courseRegistryToolbar";
      toolbar.className="course-registry-toolbar";
      toolbar.innerHTML=`
        <input id="courseRegistrySearch" type="text" placeholder="Search curriculum, department, prerequisite...">
        <select id="courseRegistryDept"><option value="ALL">All Departments</option></select>
        <select id="courseRegistryStatus">
          <option value="ALL">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Needs Review">Needs Review</option>
          <option value="Archived">Archived</option>
        </select>
        <button type="button" class="btn-pagination-nav" onclick="resetCourseRegistryFilters()">Reset</button>`;

      card.insertBefore(toolbar,tableWrap);

      document.getElementById("courseRegistrySearch").oninput=e=>{
        courseRegistrySearchText=e.target.value.toLowerCase();
        currentCoursePage=1;
        renderCourseTableRowsPagedCanvas();
      };

      document.getElementById("courseRegistryDept").onchange=e=>{
        courseRegistryDeptFilter=e.target.value;
        currentCoursePage=1;
        renderCourseTableRowsPagedCanvas();
      };

      document.getElementById("courseRegistryStatus").onchange=e=>{
        courseRegistryStatusFilter=e.target.value;
        currentCoursePage=1;
        renderCourseTableRowsPagedCanvas();
      };
    }
    function refreshCourseDeptFilter(){
      const sel=document.getElementById("courseRegistryDept");
      if(!sel) return;
      const current=sel.value;
      const depts=[...new Set(globalCourseMemoryArray.map(c=>c.dept))];
      sel.innerHTML=`<option value="ALL">All Departments</option>`+depts.map(d=>`<option value="${d}">${d}</option>`).join("");
      sel.value=depts.includes(current)?current:"ALL";
    }

    function getFilteredCourseRows(){
      return globalCourseMemoryArray.map((course,idx)=>({course,idx,meta:getCourseRegistryMeta(course,idx)})).filter(row=>{
        const haystack=`${row.course.title} ${row.course.dept} ${row.course.prereq}`.toLowerCase();
        return (!courseRegistrySearchText||haystack.includes(courseRegistrySearchText))
          && (courseRegistryDeptFilter==="ALL"||row.course.dept===courseRegistryDeptFilter)
          && (courseRegistryStatusFilter==="ALL"||row.meta.status===courseRegistryStatusFilter);
      });
    }

    function statusClassName(status){
      return "status-"+status.toLowerCase().replace("needs review","review").replace(/\s+/g,"-");
    }

    function resetCourseRegistryFilters(){
      courseRegistrySearchText="";courseRegistryDeptFilter="ALL";courseRegistryStatusFilter="ALL";currentCoursePage=1;
      document.getElementById("courseRegistrySearch").value="";
      document.getElementById("courseRegistryDept").value="ALL";
      document.getElementById("courseRegistryStatus").value="ALL";
      renderCourseTableRowsPagedCanvas();
    }

    function openCourseFromRegistry(idx){
      selectedCourseRegistryIdx=idx;
      openCourseSubManagementPanel(globalCourseMemoryArray[idx].title);
      renderCourseTableRowsPagedCanvas();
    }

    function toggleCourseRowActions(event,idx){
      event.stopPropagation();
      document.querySelectorAll(".course-row-menu").forEach(m=>m.classList.remove("open"));
      document.getElementById("course-menu-"+idx).classList.toggle("open");
    }

    function renderCourseTableRowsPagedCanvas(){
      ensureCourseRegistryToolbar();refreshCourseDeptFilter();
      const tbody=document.getElementById("tbodyCourseRegistryRows");tbody.innerHTML="";
      const rows=getFilteredCourseRows();
      const maxPage=Math.ceil(rows.length/coursesPerPage)||1;
      if(currentCoursePage>maxPage)currentCoursePage=maxPage;
      const start=(currentCoursePage-1)*coursesPerPage;
      rows.slice(start,start+coursesPerPage).forEach(({course,idx,meta})=>{
        tbody.innerHTML+=`<tr class="${selectedCourseRegistryIdx===idx?'selected-course-row':''}" onclick="openCourseFromRegistry(${idx})" title="Open course management panel">
          <td><strong>📘 ${course.title}</strong></td>
          <td><span style="color:#003366;font-weight:700;">${course.dept}</span></td>
          <td><span style="font-family:monospace;font-size:11px;color:#475569;">${course.prereq}</span></td>
          <td><span class="course-status-badge ${statusClassName(meta.status)}">${meta.status}</span></td>
          <td><div class="course-metrics-mini"><span class="course-chip">${meta.modules} Modules</span><span class="course-chip">${meta.enrolled} Enrolled</span><span class="course-chip">${meta.completion}% Done</span></div></td>
          <td><div class="course-actions-wrap"><button class="btn-row-menu" onclick="toggleCourseRowActions(event,${idx})">⋯</button>
            <div class="course-row-menu" id="course-menu-${idx}">
              <button onclick="event.stopPropagation();triggerCourseEditModeSetup(${idx})">Edit Course</button>
              <button onclick="event.stopPropagation();executeCourseDuplicatePipeline(${idx})">Duplicate</button>
              <button onclick="event.stopPropagation();triggerSecurePurgeModalPipeline('COURSE',${idx})">Delete</button>
            </div></div></td></tr>`;
      });

      if(rows.length===0)tbody.innerHTML=`<tr><td colspan="6" class="course-empty-state">No curriculum tracks found.</td></tr>`;
      document.getElementById("lbl-page-indicator").innerText=`Page ${currentCoursePage} of ${maxPage}`;
      document.getElementById("btn-page-prev").disabled=currentCoursePage===1;
      document.getElementById("btn-page-next").disabled=currentCoursePage===maxPage;
    }

    document.addEventListener("click",()=>document.querySelectorAll(".course-row-menu").forEach(m=>m.classList.remove("open")));

    var courseNodeUserSearch="",courseNodeDeptFilter="ALL",courseNodeStatusFilter="ALL";
    var courseNodeFilesMap={};

    function getActiveCourseObject(){
      return globalCourseMemoryArray.find(c=>c.title===currentSelectedCourseTitle);
    }

    function getCourseModulesCount(){
      return (dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle]||[]).length;
    }

    function getProgressValue(row){
      if(typeof row.progress==="number") return row.progress;
      const raw=String(row.status||"");
      const m=raw.match(/(\d+)%/);
      if(m) return Number(m[1]);
      if(raw.includes("COMPLETE")) return 100;
      if(raw.includes("ACTIVE")) return 0;
      return 0;
    }

    function getStatusLabel(row){
      const p=getProgressValue(row);
      const due=getDueDate(row.date);
      const overdue=due && new Date(due)<new Date() && p<100;
      if(overdue) return "Overdue";
      if(p>=100) return "Completed";
      if(p>0) return "In Progress";
      return "Active";
    }

    function getNodeBadgeClass(label){
      if(label==="Overdue") return "node-overdue";
      if(label==="Completed") return "node-complete";
      if(label==="In Progress") return "node-progress";
      return "node-active";
    }

    function getDueDate(startDate){
      if(!startDate || startDate==="--") return "--";
      const d=new Date(startDate);
      if(isNaN(d)) return "--";
      d.setDate(d.getDate()+30);
      return d.toISOString().split("T")[0];
    }

    function ensureCourseNodeShell(){
      const metricsView=document.getElementById("view-course-metrics");
      if(!metricsView) return;

      const header=metricsView.querySelector(".view-header-title-bar");
      if(header && !document.getElementById("btnPublishCourse")){
        const btn=document.createElement("button");
        btn.id="btnPublishCourse";
        btn.className="btn-talent-blue btn-publish-course";
        btn.type="button";
        btn.onclick=togglePublishCurrentCourse;
        btn.innerText="Publish Course";
        header.appendChild(btn);
      }

      const canvas=metricsView.querySelector(".view-content-canvas");
      if(canvas && !document.getElementById("courseNodeSummaryGrid")){
        const summary=document.createElement("div");
        summary.id="courseNodeSummaryGrid";
        summary.className="course-node-summary-grid";
        summary.innerHTML=`
          <div class="course-node-stat"><span>Enrolled</span><strong id="statNodeEnrolled">0</strong></div>
          <div class="course-node-stat"><span>In Progress</span><strong id="statNodeProgress">0</strong></div>
          <div class="course-node-stat"><span>Completed</span><strong id="statNodeComplete">0</strong></div>
          <div class="course-node-stat"><span>Overdue</span><strong id="statNodeOverdue">0</strong></div>
          <div class="course-node-stat"><span>Modules</span><strong id="statNodeModules">0</strong></div>`;
        canvas.insertBefore(summary,document.querySelector(".icon-nav-container"));
      }

      const usersPane=document.getElementById("pane-metrics-users");
      const usersCard=usersPane ? usersPane.querySelector(".enterprise-data-card-wrapper") : null;
      if(usersCard && !document.getElementById("courseNodeUserTools")){
        const table=usersCard.querySelector("table");
        const tools=document.createElement("div");
        tools.id="courseNodeUserTools";
        tools.className="course-node-tools";
        tools.innerHTML=`
          <input id="courseNodeUserSearch" placeholder="Search trainee name, role, department...">
          <select id="courseNodeDeptFilter"><option value="ALL">All Departments</option></select>
          <select id="courseNodeStatusFilter"><option value="ALL">All Status</option><option value="Active">Active</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Overdue">Overdue</option></select>
          <button type="button" class="btn-pagination-nav" onclick="resetCourseNodeFilters()">Reset</button>`;
        usersCard.insertBefore(tools,table);
        document.getElementById("courseNodeUserSearch").oninput=e=>{courseNodeUserSearch=e.target.value.toLowerCase();renderCourseSubUsersTableData();};
        document.getElementById("courseNodeDeptFilter").onchange=e=>{courseNodeDeptFilter=e.target.value;renderCourseSubUsersTableData();};
        document.getElementById("courseNodeStatusFilter").onchange=e=>{courseNodeStatusFilter=e.target.value;renderCourseSubUsersTableData();};
      }
    }

    function refreshCourseNodeDeptFilter(){
      const sel=document.getElementById("courseNodeDeptFilter");
      if(!sel) return;
      const current=sel.value;
      const enrollments=courseEnrollmentDatabaseMap[currentSelectedCourseTitle]||[];
      const depts=[...new Set(enrollments.map(e=>e.dept))];
      sel.innerHTML=`<option value="ALL">All Departments</option>`+depts.map(d=>`<option value="${d}">${d}</option>`).join("");
      sel.value=depts.includes(current)?current:"ALL";
    }

    function resetCourseNodeFilters(){
      courseNodeUserSearch="";courseNodeDeptFilter="ALL";courseNodeStatusFilter="ALL";
      document.getElementById("courseNodeUserSearch").value="";
      document.getElementById("courseNodeDeptFilter").value="ALL";
      document.getElementById("courseNodeStatusFilter").value="ALL";
      renderCourseSubUsersTableData();
    }

    function refreshCourseNodeSummary(){
      const list=courseEnrollmentDatabaseMap[currentSelectedCourseTitle]||[];
      const completed=list.filter(e=>getProgressValue(e)>=100).length;
      const overdue=list.filter(e=>getStatusLabel(e)==="Overdue").length;
      const progress=list.filter(e=>getStatusLabel(e)==="In Progress").length;
      document.getElementById("statNodeEnrolled").innerText=list.length;
      document.getElementById("statNodeProgress").innerText=progress;
      document.getElementById("statNodeComplete").innerText=completed;
      document.getElementById("statNodeOverdue").innerText=overdue;
      document.getElementById("statNodeModules").innerText=getCourseModulesCount();
    }

    function refreshPublishButton(){
      const btn=document.getElementById("btnPublishCourse");
      const course=getActiveCourseObject();
      if(!btn || !course) return;
      const status=course.status||"Draft";
      btn.innerText=status==="Published" ? "Unpublish Course" : "Publish Course";
      btn.classList.toggle("is-live",status==="Published");
    }

    function togglePublishCurrentCourse(){
      const course=getActiveCourseObject();
      if(!course) return;
      const current=course.status||"Draft";
      if(current!=="Published" && getCourseModulesCount()===0){
      showWarning(
          "No Modules Found",
          "Please add at least one module before publishing this course."
      );    
      return;
      }
      course.status=current==="Published" ? "Draft" : "Published";
      refreshPublishButton();
      renderCourseTableRowsPagedCanvas();
    }

    function openCourseSubManagementPanel(courseTitle) {
      currentSelectedCourseTitle = courseTitle;
      document.getElementById("lbl-metrics-view-course-title").innerText = `Course Node Matrix: [${courseTitle}]`;
      SwitchTalentLmsTab('view-course-metrics', null);
      ensureCourseNodeShell();
      switchMetricsInnerPane('pane-metrics-users', document.getElementById('tab-btn-users'));
      refreshPublishButton();
      renderCourseSubUsersTableData();
      renderCourseFilesTableData();
    }

    function renderCourseSubUsersTableData() {
      ensureCourseNodeShell();
      refreshCourseNodeDeptFilter();

      const table=document.getElementById("tbodyCourseUsersSubMetrics").closest("table");
      table.querySelector("thead").innerHTML=`<tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Progress</th><th>Enrolled</th><th>Due Date</th></tr>`;

      const tbody = document.getElementById("tbodyCourseUsersSubMetrics");
      tbody.innerHTML = "";
      let list = courseEnrollmentDatabaseMap[currentSelectedCourseTitle] || [];

      list=list.filter(t=>{
        const label=getStatusLabel(t);
        const haystack=`${t.name} ${t.role} ${t.dept}`.toLowerCase();
        return (!courseNodeUserSearch || haystack.includes(courseNodeUserSearch))
          && (courseNodeDeptFilter==="ALL" || t.dept===courseNodeDeptFilter)
          && (courseNodeStatusFilter==="ALL" || label===courseNodeStatusFilter);
      });

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; font-style:italic;">No enrolled users match this view.</td></tr>`;
        refreshCourseNodeSummary();
        return;
      }

      list.forEach(t => {
        const progress=getProgressValue(t);
        const label=getStatusLabel(t);
        tbody.innerHTML += `<tr>
          <td><strong>${t.name}</strong></td>
          <td><span class="badge-role">${t.role}</span></td>
          <td>${t.dept}</td>
          <td><span class="node-badge ${getNodeBadgeClass(label)}">${label}</span></td>
          <td><strong style="font-size:11px;">${progress}%</strong><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></td>
          <td>${t.date}</td>
          <td>${getDueDate(t.date)}</td>
        </tr>`;
      });

      refreshCourseNodeSummary();
    }

    function executeEnrollUserActionToActiveCourse(name, role, dept) {
      if (!courseEnrollmentDatabaseMap[currentSelectedCourseTitle]) courseEnrollmentDatabaseMap[currentSelectedCourseTitle] = [];
      let dateStamp = new Date().toISOString().split('T')[0];
      courseEnrollmentDatabaseMap[currentSelectedCourseTitle].push({
        name:name, role:role, dept:dept, progress:0,
        status:"ACTIVE", date:dateStamp, end:"--"
      });
      renderCourseSubUsersTableData();
      renderEnrollmentModalUsersListCanvas(document.getElementById("selEnrollDeptFilter").value);
    }

    function renderCourseFilesTableData(){
      const tbody=document.getElementById("tbodyCourseFilesSubMetrics");
      if(!tbody) return;
      const table=tbody.closest("table");
      table.querySelector("thead").innerHTML=`<tr><th>File Name</th><th>Type</th><th>Source</th><th>Uploaded</th><th>Actions</th></tr>`;
      const files=courseNodeFilesMap[currentSelectedCourseTitle]||[];
      tbody.innerHTML="";
      if(files.length===0){
        tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;color:#64748b;font-style:italic;">No resource files uploaded for this course yet.</td></tr>`;
        return;
      }
      files.forEach((f,i)=>{
        tbody.innerHTML+=`<tr>
          <td><strong>${f.name}</strong></td>
          <td><span class="badge-role">${f.type}</span></td>
          <td>${f.source}</td>
          <td>${f.uploaded}</td>
          <td class="course-node-file-actions"><button class="btn-action-sm btn-edit">Preview</button><button class="btn-action-sm btn-delete" onclick="removeCourseFileNode(${i})">Archive</button></td>
        </tr>`;
      });
    }

    function processUploadedAssetFileRow(n, t, u = "Local stream node") {
      if(!courseNodeFilesMap[currentSelectedCourseTitle]) courseNodeFilesMap[currentSelectedCourseTitle]=[];
      courseNodeFilesMap[currentSelectedCourseTitle].push({
        name:n,type:t,source:u,uploaded:new Date().toISOString().split("T")[0]
      });
      closeFileUploadModalSubNode();
      renderCourseFilesTableData();
    }

    function removeCourseFileNode(idx){
      courseNodeFilesMap[currentSelectedCourseTitle].splice(idx,1);
      renderCourseFilesTableData();
    }

    const originalSwitchMetricsInnerPane = switchMetricsInnerPane;
    switchMetricsInnerPane = function(panelElementId, buttonNode){
      originalSwitchMetricsInnerPane(panelElementId, buttonNode);
      if(panelElementId==="pane-metrics-files") renderCourseFilesTableData();
    };

    let courseSubtitleMap = {};

    function saveEditableCourseTitle() {
      const newTitle = document.getElementById("lbl-builder-hero-title").innerText.trim();
      if (!newTitle || !currentSelectedCourseTitle) return;

      const course = globalCourseMemoryArray.find(c => c.title === currentSelectedCourseTitle);
      if (!course) return;

      const oldTitle = currentSelectedCourseTitle;
      course.title = newTitle;
      currentSelectedCourseTitle = newTitle;

      if (dynamicCourseContentsSyllabusMap[oldTitle]) {
        dynamicCourseContentsSyllabusMap[newTitle] = dynamicCourseContentsSyllabusMap[oldTitle];
        delete dynamicCourseContentsSyllabusMap[oldTitle];
      }

      if (courseEnrollmentDatabaseMap[oldTitle]) {
        courseEnrollmentDatabaseMap[newTitle] = courseEnrollmentDatabaseMap[oldTitle];
        delete courseEnrollmentDatabaseMap[oldTitle];
      }

      recalculateLmsStateTablesCanvas();
    }

    function saveEditableCourseSubtitle() {
      if (!currentSelectedCourseTitle) return;
      courseSubtitleMap[currentSelectedCourseTitle] = document.getElementById("lbl-builder-hero-subtitle").innerText.trim();
    }

// RE-ENGINEERED DYNAMIC COUPLING (SEARCH, FILTER & PASSWORD TOGGLE)
(function() {
    window.addEventListener('load', function() {
        const searchInput = document.getElementById('searchNameInput');
        const filterSelect = document.getElementById('filterRoleSelect');

        if (searchInput) {
            searchInput.addEventListener('input', function() {
                window.keyword = this.value.toLowerCase().trim();
                currentUserPage = 1; // Reset sa page 1 kapag nagse-search para hindi mawala ang results
                if (typeof recalculateLmsStateTablesCanvas === 'function') {
                    recalculateLmsStateTablesCanvas();
                }
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', function() {
                window.selectedRoleFilter = this.value.toUpperCase();
                currentUserPage = 1; // Reset sa page 1 kapag nagpapalit ng role
                if (typeof recalculateLmsStateTablesCanvas === 'function') {
                    recalculateLmsStateTablesCanvas();
                }
            });
        }
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    const prev = document.getElementById("btnUserPrev");
    const next = document.getElementById("btnUserNext");

    if (prev) {
        prev.addEventListener('click', function() {
            if (currentUserPage > 1) {
                currentUserPage--;
                recalculateLmsStateTablesCanvas();
            }
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            currentUserPage++;
            recalculateLmsStateTablesCanvas();
        });
    }
});

// ==========================================
// SPRINT 2: DYNAMIC DASHBOARD METRICS ENGINE
// ==========================================
window.refreshDashboardMetrics = function() {
    // 1. Total Headcount (Galing sa User DB natin)
    const lblDashCount = document.getElementById("lbl-dash-count");
    if (lblDashCount) {
        lblDashCount.innerText = window.globalUserMemoryArray ? window.globalUserMemoryArray.length : 0;
    }

    // 2. Calculate Total Enrollments & Completion Rate
    let totalEnrolled = 0;
    let completedCount = 0;
    let totalProgress = 0;

    if (typeof courseEnrollmentDatabaseMap !== 'undefined') {
        for (const courseTitle in courseEnrollmentDatabaseMap) {
            const enrollments = courseEnrollmentDatabaseMap[courseTitle];
            totalEnrolled += enrollments.length;

            enrollments.forEach(student => {
                const progress = typeof getProgressValue === "function" ? getProgressValue(student) : 0;
                totalProgress += progress;
                if (progress >= 100) {
                    completedCount++;
                }
            });
        }
    }

    // 3. I-update ang UI para sa Enrolled
    const lblDashEnrolled = document.getElementById("lbl-dash-enrolled");
    if (lblDashEnrolled) {
        lblDashEnrolled.innerText = `${totalEnrolled} Enrolled`;
    }

    // 4. I-update ang UI para sa Completion Rate (Average)
    const lblDashCompletion = document.getElementById("lbl-dash-completion");
    if (lblDashCompletion) {
        const averageCompletion = totalEnrolled > 0 ? (totalProgress / totalEnrolled).toFixed(1) : 0;
        lblDashCompletion.innerText = `${averageCompletion}% Total Rate`;
    }
};

// 5. I-trigger ang Refresh Pagka-load (Safe Hook)
const originalOnLoad = window.onload;
window.onload = function(e) {
    if (originalOnLoad) {
        originalOnLoad(e);
    } else {
        if (typeof recalculateLmsStateTablesCanvas === "function") recalculateLmsStateTablesCanvas();
        if (typeof activateBuilderLessonType === "function") activateBuilderLessonType('Content');
    }
    // Idagdag ang dashboard update
    refreshDashboardMetrics();
};

// ==========================================
// SPRINT 3: DATABASE-DRIVEN ENROLLMENT LOGIC
// ==========================================

// 1. Fetch data mula sa backend imbes na sa local variable
async function fetchCourseEnrollments(courseTitle) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/${encodeURIComponent(courseTitle)}`);
        if (!response.ok) throw new Error("Failed to fetch enrollments");
        
        const data = await response.json();
        // I-update ang global map natin gamit ang totoong database data
        courseEnrollmentDatabaseMap[courseTitle] = data;
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

// 2. I-override ang render function para maghintay (await) ng totoong data
renderCourseSubUsersTableData = async function() {
    if (!currentSelectedCourseTitle) return;

    // Kunin ang fresh data sa database bago mag-render
    await fetchCourseEnrollments(currentSelectedCourseTitle);

    ensureCourseNodeShell();
    refreshCourseNodeDeptFilter();

    const table = document.getElementById("tbodyCourseUsersSubMetrics").closest("table");
    table.querySelector("thead").innerHTML = `<tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Progress</th><th>Enrolled</th><th>Due Date</th></tr>`;

    const tbody = document.getElementById("tbodyCourseUsersSubMetrics");
    tbody.innerHTML = "";
    
    let list = courseEnrollmentDatabaseMap[currentSelectedCourseTitle] || [];

    // Filter Logic
    list = list.filter(t => {
        const label = getStatusLabel(t);
        const haystack = `${t.name} ${t.role} ${t.dept}`.toLowerCase();
        return (!courseNodeUserSearch || haystack.includes(courseNodeUserSearch))
            && (courseNodeDeptFilter === "ALL" || t.dept === courseNodeDeptFilter)
            && (courseNodeStatusFilter === "ALL" || label === courseNodeStatusFilter);
    });

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; font-style:italic;">No enrolled users match this view.</td></tr>`;
        refreshCourseNodeSummary();
        return;
    }

    // UI Rendering
    list.forEach(t => {
        const progress = getProgressValue(t);
        const label = getStatusLabel(t);
        
        // Format date properly
        const rawDate = t.date ? t.date.split('T')[0] : "--"; 
        
        tbody.innerHTML += `<tr>
            <td><strong>${t.name}</strong></td>
            <td><span class="badge-role">${t.role}</span></td>
            <td>${t.dept}</td>
            <td><span class="node-badge ${getNodeBadgeClass(label)}">${label}</span></td>
            <td><strong style="font-size:11px;">${progress}%</strong><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></td>
            <td>${rawDate}</td>
            <td>${getDueDate(rawDate)}</td>
        </tr>`;
    });

    refreshCourseNodeSummary();
    
    // I-refresh din ang Dashboard natin para updated ang total count!
    if (typeof refreshDashboardMetrics === "function") refreshDashboardMetrics();
};

// 3. I-override ang Enroll Button function para mag-POST sa backend
executeEnrollUserActionToActiveCourse = async function(name, role, dept) {
    let dateStamp = new Date().toISOString().split('T')[0];
    
    const payload = {
        course_title: currentSelectedCourseTitle,
        name: name,
        role: role,
        dept: dept,
        progress: 0,
        status: "ACTIVE",
        date: dateStamp
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // I-refresh ang UI kapag successful ang DB save
            await renderCourseSubUsersTableData();
            renderEnrollmentModalUsersListCanvas(document.getElementById("selEnrollDeptFilter").value);
        } else {
            alert('Error enrolling user. Please try again.');
        }
    } catch (error) {
        console.error('API Error during enrollment:', error);
    }
};