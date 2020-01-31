//THIS MUST BE UPDATE IN THE THEMES SECTION OF CANVAS
/*EvaluationKIT START*/
var BETA = false;
if (window.location.href.includes("btech.beta.instructure.com")) {
	BETA = true;
} else {
	BETA = false;
}
var FEATURES = {}; //currently unused, but may be a way to better manage features

var MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

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
	add_javascript_library("https://jhveem.github.io/custom_features/"+f+".js");
}

function featureBeta(f, data={}) {
	if (BETA) feature(f, data);
}

//USED TO TEST IN A SINGLE COURSE
function featurePilot(f, courseId, pilotCourseId, data={}) {
	if (courseId === pilotCourseId) feature(f, data);
}

function featureCDD(f, userId, data={}) {
	let cddIds = [
		1893418, //Josh 
		1864953, //Danni
		1891741, //Katie
		1638854, //Mason
		1922029, //Makenzie
		1900206 //Tess
	];
	if (cddIds.includes(userId)) feature(f, data);
}

$.put = function(url, data){
  return $.ajax({
    url: url,
    type: 'PUT'
  });
}

$.delete= function(url, data){
  return $.ajax({
    url: url,
    type: 'DELETE'
  });
}

add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
add_javascript_library("https://jhveem.github.io/custom_canvas_import_pilot.js");
$.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
	let currentUser = parseInt(ENV.current_user.id);

	//GENERAL FEATURES
	featureBeta("rubrics/gen_comment");

	//LIMITED FEATURES
	let rCheckInCourse = /^\/courses\/([0-9]+)/;
	if (rCheckInCourse.test(window.location.pathname)) {
		let courseId = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
		//COURSE SPECIFIC FEATURES
		featurePilot("change_2019_to_2019-2020", courseId, 489538);
		
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
			featureBeta("rubric/attempts_data");
			featureBeta("highlight_comments_same_date");
			featureBeta("previous-enrollment-data/previous_enrollment_period_grades");
		}
	}
	//JUST ME
  if (currentUser === 1893418) {

	}
	//CDD ONLY
	featureCDD("rubrics/sortable", currentUser);
});

/*EvaluationKIT END*/

window.ALLY_CFG = {
    'baseUrl': 'https://prod.ally.ac',
    'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');

