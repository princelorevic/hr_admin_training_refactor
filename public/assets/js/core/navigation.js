function SwitchTalentLmsTab(targetPageBlockId, sidebarNodeBtn) {
      document.querySelectorAll('.lms-view-panel-page').forEach(page => page.style.display = 'none');
      document.getElementById(targetPageBlockId).style.display = 'block';
      if (sidebarNodeBtn) {
        document.querySelectorAll('.sidebar-icon-item').forEach(item => item.classList.remove('active'));
        sidebarNodeBtn.classList.add('active');
      }
      if (targetPageBlockId === "view-courses") { renderCourseTableRowsPagedCanvas(); }
    }