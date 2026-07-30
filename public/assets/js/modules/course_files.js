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

    function openFileUploadModalSubNode() { 
        document.getElementById("fileUploadModalOverlay").classList.remove("hidden"); 
    }

    function closeFileUploadModalSubNode() { 
        document.getElementById("fileUploadModalOverlay").classList.add("hidden"); 
    }
    
    function handleManualFileSelect(n) {
      if(n.files && n.files.length > 0) {
        processUploadedAssetFileRow(n.files[0].name, "Manual File Resource", "Local upload");
        n.value = "";
      }
    }    
