/*EvaluationKIT START*/
function add_javascript_library(url) {
	var s = document.createElement("script");
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(s);
}

add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
/*
add_javascript_library("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js");
add_javascript_library("https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js");
*/
/*EvaluationKIT END*/

window.ALLY_CFG = {
    'baseUrl': 'https://prod.ally.ac',
    'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');

