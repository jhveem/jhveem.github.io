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
    individualReportElement.src = "https://jhveem.github.io/reports/individual_grades_report_test.js";
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
    individualReportElement.src = "https://jhveem.github.io/reports/grades_report_test.js";
    document.body.appendChild(individualReportElement);
  }
}
/*END report*/
