//NEEDS PAGINATION ADDED
if (/^\/courses\/[0-9]+\/grades\/[0-9]+/.test(window.location.pathname)) {
  let courseId = ENV.courses_with_grades[0].id;
  let studentId = ENV.students[0].id;
  var studentAssignmentsData = [];
  let url = "/api/v1/courses/"+courseId+"/search_users";
  let data_obj = {
      include: ["enrollments"],
      user_ids: [studentId],
      enrollment_state: ["active", "invited", "rejected", "completed", "inactive"]
  };

  function calcEnrollmentGrade(studentAssignmentsData, startDate, endDate) {
      let includedAssignments = [];
      for (let i = 0; i < studentAssignmentsData.length; i++) {
          let submission = studentAssignmentsData[i];
          let date = new Date(submission.graded_at);
          if (date >= startDate && date <= endDate) {
              includedAssignments.push(submission.assignment_id);
          }
      }
      let gradesData = {};
      let assignmentGroups = ENV.assignment_groups;
      let finalScore = 0;
      let finalTotalScore = 0;
      for (let i = 0; i < assignmentGroups.length; i++) {
          let group = assignmentGroups[i];
          let score = 0;
          let total = 0;
          let assignments = group.assignments;
          for (let a = 0; a < assignments.length; a++) {
              let assignment = assignments[a];
              let id = parseInt(assignment.id);
              if (includedAssignments.includes(id)) {
                  let submissionElement = $("#submission_"+id);
                  let currentScoreString = submissionElement.find("td.assignment_score span.original_points").text().trim();
                  let parsedScore = parseFloat(currentScoreString);
                  if (!isNaN(parsedScore)) {
                      score += parseFloat(currentScoreString);
                      total += assignment.points_possible;
                  }
              } else {
                  //console.log($("#submission_"+id).html());
              }
          }
          if (total > 0) {
              let groupPerc = (score / total);
              finalTotalScore += group.group_weight;
              finalScore += (groupPerc * group.group_weight);
          }
      }
      let outputScore = finalScore / finalTotalScore;
      if (isNaN(outputScore)) {
      outputScore = "N/A";
      } else {
      outputScore = (outputScore * 100).toFixed(2) + "%";
      }
      $("#btech-term-grade-value").text(outputScore);
  }
  $.get(url, data_obj, function(data) {
      let enrollmentStartDate = new Date(data[0].enrollments[0].updated_at);
      let dateStringEnrollment = enrollmentStartDate.getFullYear() + "-" + ("0" + (enrollmentStartDate.getMonth() + 1)).slice(-2) + "-" + ("0" + enrollmentStartDate.getDate()).slice(-2);
      let dateStringNow = new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2);
      let url = "/api/v1/courses/"+courseId+"/students/submissions";
      let data_obj = {
          "per_page": 100,
          "page": 1,
          "student_ids": [studentId]
      };
      $.get(url, data_obj, function(data, status, xhr) {
          //GET ASSIGNMENT WEIGHTS
          //pagination!
          studentAssignmentsData = data;
          console.log(xhr.getResponseHeader("Link"));
      $("#student-grades-right-content").append(`
  <div>
  <br><br>
  <p>Calculate the student's grade based on assignments submitted between two dates.</p>
  <input type="date" id="btech-term-grade-start" name="term-start" value="` + dateStringEnrollment + `" min="2010-01-01" max="2020-12-31">
  <input type="date" id="btech-term-grade-end" name="term-end" value="` + dateStringNow + `" min="2010-01-01" max="2020-12-31">
  <button class="fOyUs_bGBk eHiXd_bGBk eHiXd_bXiG eHiXd_ycrn eHiXd_bNlk eHiXd_cuTS" id="btech-term-grade-button">Calculate</button>
  <p>Grade for term: <span id="btech-term-grade-value"></span></p>
  </div>
  `);
      $("#btech-term-grade-button").on("click", function() {
          let startDate = new Date($("#btech-term-grade-start").val());
          let endDate = new Date($("#btech-term-grade-end").val());
          calcEnrollmentGrade(studentAssignmentsData, startDate, endDate);
      });
          
      });
  });
}