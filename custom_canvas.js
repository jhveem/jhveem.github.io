//THIS MUST BE UPDATE IN THE THEMES SECTION OF CANVAS
/*EvaluationKIT START*/
function add_javascript_library(url) {
	var s = document.createElement("script");
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(s);
}
function add_custom_feature(feature) {
	//feature is the name of the feature file without .js, if it's in a subfolder, include that too
	add_javascript_library("https://jhveem.github.io/custom_features/"+feature+".js");
}
add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
add_javascript_library("https://jhveem.github.io/custom_canvas_import_pilot.js");
$.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
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
			add_custom_feature("highlighted_grades_page_items")
		}
		//COURSE SPECIFIC FEATURES
		if (courseId === 489538) {
			add_custom_feature("change_2019_to_2019-2020");
		}
	}
});

/*EvaluationKIT END*/

window.ALLY_CFG = {
    'baseUrl': 'https://prod.ally.ac',
    'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');

