function addMenuItem(linkText, linkhref) {
	'use strict';
	var itemHtml;
	var linkId = linkText.split(' ').join('_');

	itemHtml = '<li clas="section">' + 
		' <a href="' + linkhref + '" tabindex="0">' +
		linkText +
		' </a>' +
		'</li>';
	$('#section-tabs').append(itemHtml);
}

/*gen report on individual page*/
if (/\/users\/[0-9]+/.test(window.location.pathname)) {
  var scriptElement = document.createElement( "script" );
  scriptElement.src = "https://jhveem.github.io/reports/reports_functions.js";
  document.body.appendChild( scriptElement );
  scriptElement.onload = function() {
    let individualReportElement = document.createElement( "script" );
    individualReportElement.src = "https://jhveem.github.io/repors/reports_functions.js";
    document.body.appendChild(individualReportElement);
  }
}
/*END report*/

/*gen report on gradebook page*/
if (window.location.pathname.includes("/gradebook") === true) {
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://kryogenix.org/code/browser/sorttable/sorttable.js";
  $("head").append(s);

  var scriptElement = document.createElement( "script" );

  scriptElement.src = "https://jhveem.github.io/grades_report.js";
  document.body.appendChild( scriptElement );

  scriptElement.onload = function() {
      for (let key in columns) {
          columns[key].average_element = $('<td style="text-align:center;" id="btech-report-average'+keyToCSS(key)+'"></td>');
          columns[key].median_element = $('<td style="text-align:center;" id="btech-report-median-'+keyToCSS(key)+'"></td>');
      }

      let course_id = ENV.context_asset_string.replace("course_", "");
      createReport();
      let report = $('#btech-report-table');
      let report_head = $('#btech-report-table-head');
      let report_foot = $('#btech-report-table-foot');
      let header_row = createHeaderRow();
      $("#yourElement").attr('title', 'This is the hover-over text');
      header_row.appendTo(report_head);
      let average = 0;
      let progress_per_day_list = [];

      let url = "/api/v1/courses/"+course_id+"/users?enrollment_state%5B%5D=active";
      url += "&enrollment_state%5B%5D=invited"
      url += "&enrollment_type%5B%5D=student"
      url += "&enrollment_type%5B%5D=student_view";
      url += "&include%5B%5D=avatar_url";
      url += "&include%5B%5D=group_ids";
      url += "&include%5B%5D=enrollments";
      url += "&per_page=100";

      $.get(url, function(data) {
          let students = data;
          for (let s = 0; s < students.length; s++) {
              let student = students[s];
              let user_id = student.id;
              let enrollment = null;
              for (let e = 0; e < student.enrollments.length; e++) {
                  if (student.enrollments[e].type === "StudentEnrollment") {
                      enrollment = student.enrollments[e];
                  }
              }
              if (enrollment !== null) {
                  updateStudentCells(student, enrollment, course_id, user_id);
                  //get assignment data
                  let url = "/api/v1/courses/"+course_id+"/analytics/users/"+user_id+"/assignments";
                  $.get(url, function(data) {
                      let assignments = data;
                      let total_points_possible = 0;
                      let current_points_possible = 0;
                      let most_recent = {};
                      let submitted = 0;
                      let progress_per_day = 0;
                      let start_date = Date.parse(enrollment.created_at);
                      let now_date = Date.now();
                      let diff_time = Math.abs(now_date - start_date);
                      let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
                      let most_recent_time = diff_time;
                      for (let a = 0; a < assignments.length; a++) {
                          let assignment = assignments[a];
                          let points_possible = assignment.points_possible;
                          let submitted_at = Date.parse(assignment.submission.submitted_at);
                          total_points_possible += points_possible;
                          if (assignment.submission.score !== null) {
                              current_points_possible += points_possible;
                              submitted += 1;
                          }
                          if (Math.abs(now_date - submitted_at) < most_recent_time) {
                              most_recent_time = Math.abs(now_date - submitted_at);
                              most_recent = assignment;
                          }
                      }
                      let progress = Math.ceil(current_points_possible / total_points_possible * 100);
                      progress = Math.ceil(submitted / assignments.length * 100);
                      let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));
                      progress_per_day = progress / diff_days;
                      progress_per_day_list.push(progress_per_day);
                      let sum_progress = 0;
                      for (let i = 0; i < progress_per_day_list.length; i++) {
                          sum_progress += progress_per_day_list[i];
                      }
                      let average_progress_per_day = sum_progress / progress_per_day_list.length;
                      let average_days_to_complete = Math.floor(100 / average_progress_per_day);
                      $('#btech-days-to-completion').html(''+average_days_to_complete);

                      //calculate color for last submission day
                      let color = "#FFF";
                      if (most_recent_days >= 7 && most_recent_days <= 21) {
                          let g = 16 - Math.floor(((most_recent_days - 6) / 15) * 16);
                          if (g < 6) g = 6;
                          color = "#F"+g.toString(16)+"7";
                      }
                      if (most_recent_days > 21) color = "#F67";

                      //add in submission related cells
                      updateCell('progress', user_id, progress);
                      updateCell('days_since_last_submission', user_id, most_recent_days, color);
                  }).fail(function() {
                      updateCell('progress', user_id, "N/A");
                      updateCell('days_since_last_submission', user_id, "N/A", "#FAB");
                  });
              }
          }

          //Set up the bottom data including averages, medians, and other information
          report_foot.append("<tr><td colspan=7 height=10></td></tr>");
          let average_row = $('<tr id="btech-modal-average"></tr>').appendTo(report_foot);
          let median_row = $('<tr id="btech-modal-median"></tr>').appendTo(report_foot);
          median_row.append("<td colspan=2>MEDIAN</td>");
          average_row.append("<td colspan=2>AVERAGE</td>");
          for (let key in columns) {
              if (columns[key].average == true) {
                  average_row.append(columns[key].average_element);
                  median_row.append(columns[key].median_element);
              }
          }

          report_foot.append("<tr><td colspan=7 height=10></td></tr>");
          let final_row = $('<tr id="btech-modal-report-summary"></tr>').appendTo(report_foot);
          final_row.append("<td colspan=2>ESTIMATED AVERAGE DAYS TO COMPLETION</td>");
          final_row.append("<td id='btech-days-to-completion' style='text-align:center;'></td>");

      });
      window.onclick = function(event) {
          let modal = $('div#btech-modal');
          if (event.target == modal) {
              modal.hide();
          }
      }
  };
}
/*END report*/

/*Show ungraded as 0 Final Grade next to Final Grade based on submitted assignments only.
if (window.location.pathname == "/grades") {
	let user = ENV.current_user_id;
	let tbody = $("table.student_grades").find("tbody");
	$("table.student_grades").find("tbody").find("tr").each(function(i) {
		let element = this;
		let courseURL = $(this).find("a").attr("href");
		let urlArray = courseURL.split("/");
		let course = urlArray[2];
		$.get("/api/v1/courses/"+course+"/enrollments?user_id="+user, function(data) {
			let score = data[0].grades.final_score;
			$(element).append('<td class="percent">'+score+'%</td>');
		});
	});
	tbody.prepend("<tr><td></td><td>Completed Assignments</td><td></td><td>Final Grade</td></tr>");
}
if (window.location.pathname.includes("/grades/") === true) {
    let course = ENV.courses_with_grades[0].id;
    let user = ENV.students[0].id;
    ENV.students[0] = {};
    console.log(ENV);
    $.get("/api/v1/courses/"+course+"/enrollments?user_id="+user, function(data) {
        let score = data[0].grades.final_score;
        console.log(score);
        $('tr.final_grade td.possible').html("<span>Unsubmitted as 0</span>");
        $('tr.final_grade td.details').html("<div class='score_holder'><span class='tooltip'><span class='grade' style='font-size:22px'>"+score+"%</span></span></div>");
        //$(element).append('<td class="percent">'+score+'%</td>');
    });
}
/*END Show ungraded as 0 Final Grade next to Final Grade based on submitted assignments only.*/
/*
	* this is how you check for user roles to only show a menu item to certain users. Just change admin to whatever you want
	if (ENV.current_user_roles.includes('admin')) {
		addMenuItem('Logout', '/logout');
	}	
*/
