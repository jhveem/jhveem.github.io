
//toggle color of submitted assignments for students
//*currently only in meats for testing
if (/^\/courses\/[0-9]+\/modules$/.test(window.location.pathname)) {
  if (ENV.course_id === "473716" || ENV.course_id === "497780") {
    async function getSubmittedAssignments(page) {
      let userId = ENV.current_user.id;
      let courseId = ENV.COURSE_ID;
      let url = "/api/v1/users/"+userId+"/courses/"+courseId+"/assignments?include[]=submission&page="+page+"&per_page=50";
      let data = await $.get(url, function(data) {
        for (let a = 0; a < data.length; a++) {
          let assignment = data[a];
          if (assignment.submission.submitted_at !== null) {
            $('div.ig-row').each(function(index, value) {
              let infoEl = $(value).find('div.ig-info');
              let aEl = infoEl.find('a');
              if (aEl.length > 0) {
                let name = aEl.html().trim();
                let typeEl = infoEl.find('span.type');
                let type = typeEl.html();
                if (name === assignment.name) {
                  //this makes it green, we could play around with potentially other colors, but it's a little trickier than just adding color to the icon and I haven't figured it out yet.
                  $(value).removeClass('student-view');
                  $(value).find('.module-item-status-icon').append('<span class="ig-type-icon"><i class="icon-Solid icon-publish"></i></span>');
                }
              }
            });
            }
        }
        return data;
      });
      if (data.length === 50) {
        await getSubmittedAssignments(page + 1);
      }
    }
    async function formatSubmittedAssignments() {
      let isStudent = ENV.IS_STUDENT;
      if (isStudent) {
        $(".collapse_module_link").hide();
        $(".expand_module_link").show();
        $(".content").hide();
        getSubmittedAssignments(1).then(() => {
          $('.item-group-condensed').each(function(index, value) {
            let checkFinished = true;
            let quizzes = $(value).find('li.quiz');
            quizzes.each(function(index, value) {
              if ($(value).find('i.icon-publish').length === 0) {
                $(value).find('.module-item-status-icon').append('<span class="ig-type-icon"><i class="icon icon-publish"></i></span>');
                checkFinished = false;
              }
            });
            let assignments = $(value).find('li.assignment');
            assignments.each(function(index, value) {
              if ($(value).find('i.icon-publish').length === 0) {
                $(value).find('.module-item-status-icon').append('<span class="ig-type-icon"><i class="icon icon-publish"></i></span>');
                checkFinished = false;
              }
            });
            if (checkFinished) {
              $(value).find('div.ig-header-admin').append('<span class="ig-type-icon"><i class="icon-Solid icon-publish"></i></span>');
            }
          });
        });
      }
    }
    formatSubmittedAssignments();
  }
}
//*///END toggle submitted assignments