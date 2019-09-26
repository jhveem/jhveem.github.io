let columns = {
  name: {
	average: false,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: '',
	description: "The student&#39;s name. Click on the name to see their user profile with contact information. Click on 'grades' to go to their grades page.",
	percent: false
    },
    section: {
	average: false,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: '',
	description: "The student&#39;s section. *COMING SOON",
	percent: false
    },
    days_in_course: {
	average: true,
	list: [],
	average_element: null,
	median_element: null,
	sortable_type: 'sorttable_numeric',
	description: "The number of days since the student was added to the course. Does not take into account when they first submitted anything or when the actual first day of class was.",
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
	description: "This takes the point value of all submitted assignments (the possible points in the assignment, not the student&#39;s score) and divides it by the total possible points in the course to estimate the students progress in the course.",
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

function createGradesReport() {
    for (let key in columns) {
        columns[key].average_element = $('<td style="text-align:center;" id="btech-report-average'+keyToCSS(key)+'"></td>');
        columns[key].median_element = $('<td style="text-align:center;" id="btech-report-median-'+keyToCSS(key)+'"></td>');
    }

    let course_id = ENV.context_asset_string.replace("course_", "");
    createReport();
    let report = $('#btech-report-table');
    let report_head = $('#btech-report-table-head');
    let report_foot = $('#btech-report-table-foot');
    let header_row = createHeaderRow();
    $("#yourElement").attr('title', 'This is the hover-over text');
    header_row.appendTo(report_head);
    let average = 0;
    let progress_per_day_list = [];

    let url = "/api/v1/courses/"+course_id+"/users?enrollment_state%5B%5D=active";
    url += "&enrollment_state%5B%5D=invited"
    url += "&enrollment_type%5B%5D=student"
    url += "&enrollment_type%5B%5D=student_view";
    url += "&include%5B%5D=avatar_url";
    url += "&include%5B%5D=group_ids";
    url += "&include%5B%5D=enrollments";
    url += "&per_page=100";

    $.get(url, function(data) {
        let students = data;
        for (let s = 0; s < students.length; s++) {
            let student = students[s];
            let user_id = student.id;
            let enrollment = null;
            for (let e = 0; e < student.enrollments.length; e++) {
                if (student.enrollments[e].type === "StudentEnrollment") {
                    enrollment = student.enrollments[e];
                }
            }
            if (enrollment !== null) {
                updateStudentCells(student, enrollment, course_id, user_id);
                //get assignment data
                let url = "/api/v1/courses/"+course_id+"/analytics/users/"+user_id+"/assignments";
                $.get(url, function(data) {
                    let assignments = data;
                    let total_points_possible = 0;
                    let current_points_possible = 0;
                    let most_recent = {};
                    let submitted = 0;
                    let progress_per_day = 0;
                    let start_date = Date.parse(enrollment.created_at);
                    let now_date = Date.now();
                    let diff_time = Math.abs(now_date - start_date);
                    let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
                    let most_recent_time = diff_time;
                    for (let a = 0; a < assignments.length; a++) {
                        let assignment = assignments[a];
                        let points_possible = assignment.points_possible;
                        let submitted_at = Date.parse(assignment.submission.submitted_at);
                        total_points_possible += points_possible;
                        if (assignment.submission.score !== null) {
                            current_points_possible += points_possible;
                            submitted += 1;
                        }
                        if (Math.abs(now_date - submitted_at) < most_recent_time) {
                            most_recent_time = Math.abs(now_date - submitted_at);
                            most_recent = assignment;
                        }
                    }
                    let progress = Math.ceil(current_points_possible / total_points_possible * 100);
                    progress = Math.ceil(submitted / assignments.length * 100);
                    let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));
                    progress_per_day = progress / diff_days;
                    progress_per_day_list.push(progress_per_day);
                    let sum_progress = 0;
                    for (let i = 0; i < progress_per_day_list.length; i++) {
                        sum_progress += progress_per_day_list[i];
                    }
                    let average_progress_per_day = sum_progress / progress_per_day_list.length;
                    let average_days_to_complete = Math.floor(100 / average_progress_per_day);
                    $('#btech-days-to-completion').html(''+average_days_to_complete);

                    //calculate color for last submission day
                    let color = "#FFF";
                    if (most_recent_days >= 7 && most_recent_days <= 21) {
                        let g = 16 - Math.floor(((most_recent_days - 6) / 15) * 16);
                        if (g < 6) g = 6;
                        color = "#F"+g.toString(16)+"7";
                    }
                    if (most_recent_days > 21) color = "#F67";

                    //add in submission related cells
                    updateCell('progress', user_id, progress);
                    updateCell('days_since_last_submission', user_id, most_recent_days, color);
                }).fail(function() {
                    updateCell('progress', user_id, "N/A");
                    updateCell('days_since_last_submission', user_id, "N/A", "#FAB");
                });
            }
        }

        //Set up the bottom data including averages, medians, and other information
        report_foot.append("<tr><td colspan=7 height=10></td></tr>");
        let average_row = $('<tr id="btech-modal-average"></tr>').appendTo(report_foot);
        let median_row = $('<tr id="btech-modal-median"></tr>').appendTo(report_foot);
        median_row.append("<td colspan=2>MEDIAN</td>");
        average_row.append("<td colspan=2>AVERAGE</td>");
        for (let key in columns) {
            if (columns[key].average == true) {
                average_row.append(columns[key].average_element);
                median_row.append(columns[key].median_element);
            }
        }

        report_foot.append("<tr><td colspan=7 height=10></td></tr>");
        let final_row = $('<tr id="btech-modal-report-summary"></tr>').appendTo(report_foot);
        final_row.append("<td colspan=2>ESTIMATED AVERAGE DAYS TO COMPLETION</td>");
        final_row.append("<td id='btech-days-to-completion' style='text-align:center;'></td>");

    });
    window.onclick = function(event) {
        let modal = $('div#btech-modal');
        if (event.target == modal) {
            modal.hide();
        }
    }
}

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
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>");
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that column.</h5>");
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
	let nameHTML = "<a target='_blank' href='https://btech.instructure.com/users/"+user_id+"'>"+student.sortable_name+"</a> (<a target='_blank' href='https://btech.instructure.com/courses/"+course_id+"/grades/"+user_id+"'>grades</a>)";
	updateCell('name', user_id, nameHTML);
	updateCell('section', user_id, '');
	updateCell('days_in_course', user_id, diff_days);
	updateCell('grade', user_id, current_score);
	updateCell('final_grade', user_id, final_score);
}

createGradesReport();
