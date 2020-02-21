//THIS MUST BE UPDATE IN THE THEMES SECTION OF CANVAS
/*EvaluationKIT START*/
var BETA = false;
if (window.location.href.includes("btech.beta.instructure.com")) {
	BETA = true;
} else {
	BETA = false;
}

var IS_TEACHER = ENV.current_user_roles.includes("teacher");

var FEATURES = {};
var IMPORTED_FEATURE = {};

var MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

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
    if (element.length > 0 && element.html().trim() !== "") {
        return element;
    } else {
        await delay(1000);
        return getElement(selectorText, iframe);
    }
}

function add_javascript_library(url) {
	var s = document.createElement("script");
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(s);
}

function feature(f, data={}) {
	//feature is the name of the feature file without .js, if it's in a subfolder, include that too
	//potentially flesh out these files so they're objects with methods. Then call an init function on load with the data variable having all the custom variables needed for each department
	//if you go this route, you could save each feature in a dict with the string provided here as the key and then in the feature itself, store itself in the dict
	//reset IMPORTED_FEATURE;
	$.getScript("https://jhveem.github.io/custom_features/"+f+".js").done(function() {
		if (!$.isEmptyObject(IMPORTED_FEATURE)) {
			if (!(f in FEATURES)) {
				FEATURES[f] = IMPORTED_FEATURE;
			}
		}
		if (f in FEATURES) {
      console.log(f);
			let feature = FEATURES[f];
			//make sure it hasn't already been called to avoid messing up the page
			if (feature.initiated === false) {
        console.log(feature);
				feature.initiated = true;
				feature._init(data);
			}
		}
	});
}

function featureBeta(f, data={}) {
  console.log(f);
	if (BETA) feature(f, data);
}

//USED TO TEST IN A SINGLE COURSE
function featurePilot(f, courseId=0, pilotCourseIds=0, data={}) {
	if (courseId !== 0) { //Make sure you didn't forget to put a course Id in
		//set individual pilotCourseId to array
		if (!Array.isArray(pilotCourseIds)) pilotCourseIds = [pilotCourseIds];
		//check if current course is in array
		if (pilotCourseIds.includes(courseId)) feature(f, data);
	}
}

function featureCDD(f, data={}) {
	let cddIds = [
		1893418, //Josh 
		1864953, //Danni
		1891741, //Katie
		1638854, //Mason
		1922029, //Makenzie
		1900206 //Tess
	];
	let userId = parseInt(ENV.current_user.id);
	if (cddIds.includes(userId)) feature(f, data);
}

$.put = function(url, data){
  return $.ajax({
		url: url,
		data: data,
    type: 'PUT'
  });
}

$.delete= function(url, data){
  return $.ajax({
		url: url,
		data: data,
    type: 'DELETE'
  });
}

add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
add_javascript_library("https://jhveem.github.io/custom_canvas_import_pilot.js");
$.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
	let currentUser = parseInt(ENV.current_user.id);

	//GENERAL FEATURES

	//COURSE FEATURES
	let rCheckInCourse = /^\/courses\/([0-9]+)/;
	if (rCheckInCourse.test(window.location.pathname)) {
		//AVAILABLE TO EVERYONE
		feature("date_display/add_current_year_speed_grader");
		feature("date_display/add_current_year");
		featureBeta("rubrics/gen_comment");

		let courseId = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
		//COURSE SPECIFIC FEATURES
		featurePilot("change_2019_to_2019-2020", courseId, [489538]); //IV Therapy
		featurePilot("rubrics/attempts_data", courseId, [498455]); //Dental 1010 pilot
		featurePilot("rubrics/gen_comment", courseId, [498455, 489058, 489702, 489089]); //Dental 1010 pilot, Dental I, Dental III, Micro Controllers I
		featurePilot("highlight_comments_same_date", courseId, [498455]); //Dental 1010 pilot
		
		//DEPARTMENT SPECIFIC IMPORTS
		let departmentId = 0;
		//DETERMINE CURRENT DEPARTMENT FROM DEPARTMENT LIST
		for (let d in COURSE_LIST) {
			if (COURSE_LIST[d].includes(courseId)) {
				departmentId = parseInt(d);
				break;
			}
		}
		if (departmentId === 3824) { // DENTAL
			feature("highlighted_grades_page_items");
			feature("speed_grader_screen_split");
			feature("previous-enrollment-data/previous_enrollment_period_grades");
			if (IS_TEACHER) featureBeta("previous-enrollment-data/set_hours_form");
		}
		if (departmentId === 3819) { // AMAR
			if (IS_TEACHER) featurePilot("modules/points_to_hours_header", courseId, 470679);
		}
	}

	//JUST ME
  if (currentUser === 1893418) {

	}

	//CDD ONLY
	featureCDD("rubrics/sortable");
	featureCDD("quizzes/question_bank_sorter");
	featureCDD("previous-enrollment-data/previous_enrollment_period_grades");
});

/*EvaluationKIT END*/

window.ALLY_CFG = {
    'baseUrl': 'https://prod.ally.ac',
    'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');