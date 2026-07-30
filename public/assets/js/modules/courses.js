function handleCourseCrudSubmissionPipeline(e) {
      e.preventDefault();
      const idx = Number(document.getElementById("editCourseTargetIdx").value); const title = document.getElementById("inCourseTitle").value.trim();
      const dept = document.getElementById("inCourseDept").value; const hasPrereq = document.getElementById("inCourseHasPrereq").checked;
      let prereqValue = "None (Core Entry Track)"; if(hasPrereq) prereqValue = "Requires: " + document.getElementById("inCoursePrereqSelectNode").value;
      if(idx === -1) { globalCourseMemoryArray.push({ title: title, dept: dept, prereq: prereqValue }); currentCoursePage = 1; } 
      else { globalCourseMemoryArray[idx].title = title; globalCourseMemoryArray[idx].dept = dept; globalCourseMemoryArray[idx].prereq = prereqValue; }
      resetCourseFormStateDefault(); recalculateLmsStateTablesCanvas();
}

function triggerCourseEditModeSetup(idx) {
      const obj = globalCourseMemoryArray[idx]; document.getElementById("editCourseTargetIdx").value = idx;
      document.getElementById("inCourseTitle").value = obj.title; document.getElementById("inCourseDept").value = obj.dept;
      let isPrereqTrack = obj.prereq.includes("Requires:"); document.getElementById("inCourseHasPrereq").checked = isPrereqTrack;
      document.getElementById("wrapper-prereq-selector").classList.toggle("hidden", !isPrereqTrack); document.getElementById("courseFormTitle").innerText = "✏️ Edit Curriculum Track Matrix";
      document.getElementById("btnCourseFormAction").innerText = "Update Course Framework"; document.getElementById("btnCancelCourseEdit").classList.remove("hidden");
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

function resetCourseFormStateDefault() { 
    document.getElementById("courseFormSubmitBlock").reset(); 
    document.getElementById("editCourseTargetIdx").value = "-1"; 
    document.getElementById("wrapper-prereq-selector").classList.add("hidden"); 
    document.getElementById("courseFormTitle").innerText = "📖 Register Curriculum Track"; 
    document.getElementById("btnCourseFormAction").innerText = "Add Course"; 
    document.getElementById("btnCancelCourseEdit").classList.add("hidden"); 
}
