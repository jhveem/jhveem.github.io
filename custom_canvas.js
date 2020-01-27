//THIS MUST BE UPDATE IN THE THEMES SECTION OF CANVAS
/*EvaluationKIT START*/
if (window.location.href.includes("btech.beta.instructure.com")) {
	const BETA = true;
} else {
	const BETA = false;
}
var FEATURES = {}; //currently unused, but may be a way to better manage features

function add_javascript_library(url) {
	var s = document.createElement("script");
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(s);
}

function feature(feature, data={}) {
	//feature is the name of the feature file without .js, if it's in a subfolder, include that too
	//potentially flesh out these files so they're objects with methods. Then call an init function on load with the data variable having all the custom variables needed for each department
	//if you go this route, you could save each feature in a dict with the string provided here as the key and then in the feature itself, store itself in the dict
	add_javascript_library("https://jhveem.github.io/custom_features/"+feature+".js");
}

$.put = function(url, data){
  return $.ajax({
    url: url,
    type: 'PUT'
  });
}

add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
add_javascript_library("https://jhveem.github.io/custom_canvas_import_pilot.js");
$.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
	//BETA
	if (BETA) {
		feature("gen_rubric_comment");
	}
	//GENERAL FEATURES

	//DEPARTMENT SPECIFIC IMPORTS
	let rCheckInCourse = /^\/courses\/([0-9]+)/;
	if (rCheckInCourse.test(window.location.pathname)) {
		let courseId = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
		let departmentId = 0;
		for (let d in COURSE_LIST) {
			if (COURSE_LIST[d].includes(courseId)) {
				departmentId = parseInt(d);
				break;
			}
		}
		if (departmentId === 3824) { // DENTAL
			feature("highlighted_grades_page_items")
		}

		//COURSE SPECIFIC FEATURES
		if (courseId === 489538) {
			feature("change_2019_to_2019-2020");
		}
	}
});

/*EvaluationKIT END*/

window.ALLY_CFG = {
    'baseUrl': 'https://prod.ally.ac',
    'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');

