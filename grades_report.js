const month_name = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

let columns = {
    name: {
	average: false,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: '',
	description: "The student's name. Click on the name to see their user profile with contact information. Click on 'grades' to go to their grades page.",
	percent: false
    },
    section: {
	average: false,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: '',
	description: "The student's section.",
	percent: false
    },
    days_in_course: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "The number of days since the student was added to the course. Does not take into account when they first submitted anything or when the actual first day of class was..",
	percent: false
    },
    grade: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "This grade is calculated by canvas based on their currently submitted assignments.",
	percent: true
    },
    final_grade: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "This grade is calculated based on all assignments and treats unsubmitted grades as 0.",
	percent: true
    },
    progress: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "This takes the point value of all submitted assignments (the possible points in the assignment, not the student's score) and divides it by the total possible points in the course to estimate the students progress in the course.",
	percent: true
    },
    days_since_last_submission: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "This shows the number of days which have past since the student last submitted an assignment on canvas. Other activities not recorded in canvas are not taken into account.",
	percent: false
    },
};

function keyToHeading(key) {
	return key.replace(/_/g, " ").toUpperCase();
	}

	function keyToCSS(key) {
	return key.replace(/_/g, "-");
	}

	function update_average(key, value) {
	let total = 0;
	for (let i = 0; i < columns[key].list.length; i++) {
	    total += columns[key].list[i];
	}
	let average = total / columns[key].list.length;
	let text = Math.floor(average);
	if (columns[key].percent === true) text += "%";
	columns[key].average_element.html(text);
}

function update_median(key, value) {
	let med = median(columns[key].list)
	let text = Math.floor(med);
	if (columns[key].percent === true) text += "%";
	columns[key].median_element.html(text);
}

function median(values) {
	if(values.length ===0) return 0;
	values.sort(function(a,b){
	    return a-b;
	});
	var half = Math.floor(values.length / 2);
	if (values.length % 2)
	    return values[half];
	return (values[half - 1] + values[half]) / 2.0;
};

function createHeaderRow() {
	let row = $('<tr></tr>');
	let count = 0;
	for (let key in columns) {
		let sortable_type = columns[key].sortable_type;
		let description = columns[key].description;
		row.append("<th title='"+description+"' class='"+sortable_type+"'style='text-align:center; padding:10px;'>"+key.replace(/_/g, " ").toUpperCase()+"</th>");
		count += 1;
	}
	return row;
}

function createReport() {
	$('div#application').append("<div id='btech-modal' class='btech-modal'></div>");
	$('#btech-modal').append("<div class='btech-modal-content' id='btech-modal-content'></div>");
	$('#btech-modal-content').append("<span class='btech-close' id='btech-close'>&times;</span>");
	$('#btech-modal-content').append("<h3 style='text-align: center;'>Report</h3>");
	$('#btech-modal-content').append("<table class='sortable' border='1' id='btech-report-table'></table>");
	$('#btech-report-table').append("<tbody border='1' id='btech-report-table-body'></tbody>");
	$('#btech-report-table').append("<thead border='1' id='btech-report-table-head'></thead>");
	$('#btech-report-table').append("<tfoot border='1' id='btech-report-table-foot'></tfoot>");
	let gen_report_button = $('<a class="Button" id="btech-modal-report-gen">Report</a>');
	let new_grades = $('div.header-buttons');
	let old_grades = $('div#gradebook-toolbar');
	if (new_grades.length > 0) gen_report_button.appendTo(new_grades);
	if (old_grades.length > 0) gen_report_button.appendTo(old_grades);
	gen_report_button.click(function() {
	    let modal = $('div#btech-modal');
	    modal.show();
	});
	$('#btech-close').click(function() {
	    let modal = $('div#btech-modal');
	    modal.hide();
	});
}

function getCellId(key, user_id) {
	return "btech-report-"+keyToCSS(key)+"-"+user_id
}

function updateCell(key, user_id, value, color="#FFF") {
	let cellId = getCellId(key, user_id);
	let cell = $("#"+cellId);
	cell.css("background-color",color);
	if (columns[key].average === true) {
	    let val = value;
	    if (val === "N/A") {val = 0;}
	    if (typeof(val) === "String") val = parseInt(val);
	    columns[key].list.push(val);
	    update_average(key, val);
	    update_median(key, val);
	}
	if (columns[key].percent == true && value !== "N/A") value += "%";
	cell.html(value);
}

function createRow(user_id) {
	let row = $('<tr id="btech-modal-report-'+user_id+'"></tr>');
	for (let key in columns) {
	    row.append("<td id='"+getCellId(key, user_id)+"' style='text-align:left; padding:10px;'></td>");
	}
	return row;
}

function updateStudentCells(student, enrollment, course_id, user_id) {
	let report_body = $('#btech-report-table-body');
	let start_date = Date.parse(enrollment.created_at);
	let now_date = Date.now();
	let diff_time = Math.abs(now_date - start_date);
	let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
	let grades = enrollment.grades;
	let current_score = grades.current_score;
	if (current_score === null) current_score = 0;
	let final_score = grades.final_score;
	if (final_score === null) final_score = 0;

	let row = createRow(user_id);
	row.appendTo(report_body);
	let nameHTML = "<a target='_blank' href='https://btech.instructure.com/users/"+user_id+"'>"+student.name+"</a> (<a target='_blank' href='https://btech.instructure.com/courses/"+course_id+"/grades/"+user_id+"'>grades</a>)";
	updateCell('name', user_id, nameHTML);
	updateCell('section', user_id, '');
	updateCell('days_in_course', user_id, diff_days);
	updateCell('grade', user_id, current_score);
	updateCell('unsubmitted_as_0', user_id, final_score);
}
