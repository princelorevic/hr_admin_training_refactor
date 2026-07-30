    function openCourseSubManagementPanel(courseTitle) {
      currentSelectedCourseTitle = courseTitle;
      document.getElementById("lbl-metrics-view-course-title").innerText = `📘 Course Node Matrix: [${courseTitle}]`;
      SwitchTalentLmsTab('view-course-metrics', null);
      switchMetricsInnerPane('pane-metrics-users', document.getElementById('tab-btn-users'));
      renderCourseSubUsersTableData();
    }
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

    function removeSpecificSyllabusUnitNode(idx) { 
      dynamicCourseContentsSyllabusMap[currentSelectedCourseTitle].splice(idx, 1); 
      renderCourseDynamicTimelineUnitsCanvas(); 
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

    function handleCourseHeroImageUploadStream(f) { 
      if (f.files && f.files[0]) { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
          dynamicCourseImageThumbnailsMap[currentSelectedCourseTitle] = e.target.result; 
          refreshCourseHeroImageStatePreview(); 
        }; reader.readAsDataURL(f.files[0]); 
      }
    }

    function refreshCourseHeroImageStatePreview() { 
      const box = document.getElementById("div-hero-avatar-box"); 
      const textLabel = document.getElementById("lbl-hero-avatar-placeholder"); 
      let urlData = dynamicCourseImageThumbnailsMap[currentSelectedCourseTitle]; 
      if(urlData) { textLabel.classList.add("hidden"); 
        box.style.backgroundImage = `url('${urlData}')`; 
      } else { textLabel.classList.remove("hidden"); 
        box.style.backgroundImage = "none"; 
      } 
    }

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

