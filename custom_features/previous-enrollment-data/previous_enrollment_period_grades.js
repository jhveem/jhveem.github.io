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
    $("table#grades_summary tbody").attr("id", "btech-original-grades-body");
    $("table#grades_summary").append("<tbody id='btech-enrollment-grades-body'></tbody>");

  function calcEnrollmentGrade(studentAssignmentsData, startDate, endDate) {
      //reset display of assigment elements
      let originalBody = $("#btech-original-grades-body");
      originalBody.hide();
      let newBody = $("#btech-enrollment-grades-body");
      newBody.empty();
      newBody.show();

      //figure out which assignments should be included
      let includedAssignments = [];
      for (let i = 0; i < studentAssignmentsData.length; i++) {
          let submission = studentAssignmentsData[i];
          let date = new Date(submission.graded_at);
          if (date >= startDate && date <= endDate) {
              includedAssignments.push(submission.assignment_id);
          }
      }

      //Go through each assignment group and figure out the points value of the included assignments that are in those groups
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
              let submissionElement = $("#submission_"+id);
              if (includedAssignments.includes(id)) {
                  submissionElement.clone().appendTo(newBody);
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
<h2>Grade for Submissions Between Dates</h2> <p><b>Note:</b>Canvas only tracks the most recent submission, so regraded assignments will only be included in the date range for its most recent submission.</p>
<p>Start Date</p>
<input type="date" id="btech-term-grade-start" name="term-start" value="` + dateStringEnrollment + `" min="2010-01-01" max="2020-12-31">
<p>End Date</p>
<input type="date" id="btech-term-grade-end" name="term-end" value="` + dateStringNow + `" min="2010-01-01" max="2020-12-31">
<button class="Button" id="btech-term-grade-button">Estimate</button>
<button class="Button" id="btech-term-reset-button">Reset</button>
<p>Grade for term: <span id="btech-term-grade-value"></span></p>
</div>
`);
          $("#btech-term-grade-button").on("click", function() {
              let startDate = parseDate($("#btech-term-grade-start").val());
              let endDate = parseDate($("#btech-term-grade-end").val());
              calcEnrollmentGrade(studentAssignmentsData, startDate, endDate);
          });
          $("#btech-term-reset-button").on("click", function() {
              let originalBody = $("#btech-original-grades-body");
              originalBody.show();
              let newBody = $("#btech-enrollment-grades-body");
              newBody.empty();
              newBody.hide();
              $("#btech-term-grade-value").empty();
          });
      });
  });
    function parseDate(dateString) {
        let pieces = dateString.split("-");
        let year = parseInt(pieces[0]);
        let month = parseInt(pieces[1] - 1);
        let day = parseInt(pieces[2]) + 1;
        let date = new Date(year, month, day);
        return date;
    }
}
