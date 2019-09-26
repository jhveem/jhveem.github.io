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
    individualReportElement.src = "https://jhveem.github.io/reports/individual_grades_report.js";
    document.body.appendChild(individualReportElement);
  }
}
/*END report*/

/*gen report on gradebook page*/
if (window.location.pathname.includes("/gradebook") === true) {
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
