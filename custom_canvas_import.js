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

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getElement(selectorText, iframe="") {
    let element;
    if (iframe === "") {
        element = $(selectorText);
    } else {
        element = $(iframe).contents().find(selectorText);
    }
    if (element.length > 0) {
        return element;
    } else {
        await delay(1000);
        return getElement(selectorText, iframe);
    }
}

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


//this adds a link to speed grader on the canvas assignment grading page to make it easier to access
if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
  let pieces = window.location.pathname.match(/^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/);
  let speed_grader_link = '<br><a class="assess_submission_link Button Button--small Button--link" href="/courses/'+pieces[1]+'/gradebook/speed_grader?assignment_id='+pieces[2]+'&student_id='+pieces[3]+'"><i class="icon-rubric" aria-hidden="true"></i> Speed Grader</a>';
  $(".submission-details-header__rubric--can-grade").append(speed_grader_link);
}
//END SPEED GRADER LINK


//adds current year to assignment submissions submitted at date
async function setAssignmentSubmittedDateHeader(selectorText, iframe="") {
    let header = await getElement(selectorText, iframe);
    header.html(header.html().replace(/ubmitted ([a-z|A-Z]+) ([0-9]+) at/, "ubmitted $1 $2, 2020 at"));
}
if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
	$("span.posted_at").each(function() {
	$(this).html(header.html().replace(/([a-z|A-Z]+) ([0-9]+) at/, "$1 $2, 2020 at"));
	});
    setAssignmentSubmittedDateHeader("span.submission-details-header__time");
    setAssignmentSubmittedDateHeader("div.quiz-submission.headless", "#preview_frame");
}
//END ADDING YEAR TO SUBMISSIONS

//ALLOW FOR HTML TAGS IN COMMENTS
async function parseCommentHTML() {
  let element = await getElement("div.comment span, tr.comments");
  element.each(function() {
    var html = $(this).html();
    html = html.replace(/&lt;(\/{0,1}.+?)&gt;/g, "<$1>");
    $(this).html(html);

    let collapses = $(this).find('div.btech-comment-collapse');
    //go through each comment
    collapses.each(function() {
      //make sure there's not already a toggler for this comment
      if ($(this).find(".btech-toggler").length === 0) {
        let criteria_id = "criteria_" + Math.round(Math.random() * 100000000);
        let toggleHeader = '<br><h4 class="element_toggler btech-toggler" role="button" aria-controls="'+criteria_id+'" aria-expanded="false" aria-label="Toggler toggle list visibility"><i class="fal fa-comments" aria-hidden="true"></i><strong>Individual Criteria</strong></h4><br>';
        $(this).attr("id",criteria_id);
        $(this).css("display", "none");
        $(toggleHeader).insertBefore(this);
      }
    });
  });
}
parseCommentHTML();
//END HTML TAGS IN COMMENTS

//Specific to Animal Sciences, this is hiding certain modules that students who are in specific sections do not need to see
if (/^\/courses\/[0-9]+\/modules$/.test(window.location.pathname)) {
  if (ENV.course_id === "488475") {
    let isStudent = ENV.IS_STUDENT;
    if (isStudent) {
        let modules = $('.item-group-condensed');
        let newStudent = $(modules[1]).find('div.ig-row').length === 1;
        if (newStudent === false) {
            $(modules[1]).hide();
        }
        $('.item-group-condensed').each(function(index, value) {
            let prereq = $(value).find('.ig-header').find('.prerequisites').text();
            if (prereq.includes('Computer Policy') && newStudent === false) {
                $(value).hide();
            }
            if (prereq.includes('Welcome') && newStudent === true) {
                $(value).hide();
            }
        });
    }
  }
}
//END Animal Sciences//
