var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://jhveem.github.io/external-libraries/sorttable.js";
$("head").append(s);

$("head").append('<script src="https://kit.fontawesome.com/870f83fdd7.js" crossorigin="anonymous"></script>');

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

//toggle color of submitted assignments for students
//*currently only in meats for testing
if (/^\/courses\/[0-9]+\/modules$/.test(window.location.pathname)) {
  console.log(ENV.course_id);
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

//zoom into picture on hover
$('span.avatar').hover(function() {
    let large = $(this).clone();
    large.css('width', '250px');
    large.css('height', '250px');
    large.css('position', 'fixed');
    large.attr('id', 'btech-avatar-zoomed');
    large.css('top', $(this).offset().top - $(window).scrollTop()+'px');
    large.css('left', $(this).offset().left - $(window).scrollLeft()+'px');
    large.css('z-index', '10000');
    $('body').append(large);
}, function() {
    $('#btech-avatar-zoomed').remove();
});
//end zoom on hover

/*gen report on gradebook page*/
if (/^\/courses\/[0-9]+\/gradebook$/.test(window.location.pathname)) {
  var scriptElement = document.createElement( "script" );
  scriptElement.src = "https://jhveem.github.io/reports/reports_functions.js";
  document.body.appendChild( scriptElement );
  scriptElement.onload = function() {
    let individualReportElement = document.createElement( "script" );
    individualReportElement.src = "https://jhveem.github.io/reports/grades_report.js";
    document.body.appendChild(individualReportElement);
  }
}
/*END report*/

/*gen report on individual page*/
if (/^\/users\/[0-9]+/.test(window.location.pathname) || /^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname)) {
  var scriptElement = document.createElement( "script" );
  scriptElement.src = "https://jhveem.github.io/reports/reports_functions.js";
  document.body.appendChild( scriptElement );
  scriptElement.onload = function() {
    let individualReportElement = document.createElement( "script" );
    individualReportElement.src = "https://jhveem.github.io/reports/individual_grades_report.js";
    document.body.appendChild(individualReportElement);
  }
}
/*END report*/


//*Show ungraded as 0 Final Grade next to Final Grade based on submitted assignments only.
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

//*On speed grader page, make it so a comment is added with the rubric info whenever a rubric score is submitted
if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  let courses_test = [489058]; //dental 1
  let user = parseInt(ENV.current_user.id);
  let course = parseInt(ENV.course_id);
  if (user === 1893418 || course === 489089) { //|) {
    $.put = function(url, data){
      return $.ajax({
        url: url,
        type: 'PUT'
      });
    }
    $(".save_rubric_button").on("click", function() {
      let comment = "-RUBRIC-%0A";
      let rows = $("div#rubric_full").find("tr");
      comment += ($(rows[rows.length - 2]).text().trim() + "%0A%0A");
      $("div#rubric_full").find("tr.rubric-criterion").each(function(index) {
        let description = $(this).find("th.description-header").find("div.description").text();
        let points_val = $(this).find("td.criterion_points").find("div.graded-points").find("input").val();
        let points = $(this).find("td.criterion_points").find("div.graded-points").text();
        comment += (description + "%0A" + points_val + points.replace("Points", "") + "%0A%0A");
      });
      $.put("https://btech.beta.instructure.com/api/v1/courses/"+ENV.course_id+"/assignments/"+ENV.assignment_id+"/submissions/"+ENV.RUBRIC_ASSESSMENT.assessment_user_id+"?comment[text_comment]="+comment,{} );
    });
  }
}
//*///END rubric score comment saving

/*
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
/*add in accordion stuff*/
/*
var scriptElement = document.createElement( "script" );
scriptElement.src = "https://jhveem.github.io/external-libraries/jquery-accordion.js";
document.body.appendChild( scriptElement );
scriptElement.onload = function() {
  $(".btech-accordion").accordion();
  $(".btech-accordion").accordion("option", "icons", null);
}
//*/
/*end of accordion stuff*/