let columns = {
	name: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The course&#39;s name. Click on the name to go to the course page. Click on 'grades' to go to their grades page for that course.",
		percent: false
	},
	state: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The student&#39;s activity state. Usually active, completed, or invited",
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
	}
};

createIndividualGradesReport();

function createIndividualGradesReport() {

  for (let key in columns) {
      columns[key].average_element = $('<td style="text-align:center;" id="btech-report-average'+keyToCSS(key)+'"></td>');
  }
  createReport();
  let report = $('#btech-report-table');
  let report_head = $('#btech-report-table-head');
  let report_body = $('#btech-report-table-body');
  let report_foot = $('#btech-report-table-foot');
  let header_row = createHeaderRow();
  header_row.appendTo(report_head);
  let m = (/\/users\/([0-9]+)/.exec(window.location.pathname));
  let user_id = m[1];
  let url_old = "/api/v1/users/"+user_id+"/courses?per_page=100";
  url_old += "&include%5B%5D=total_scores";
  url_old += "&include%5B%5D=account";
  url_old += "&enrollment_state=active";
  let course_ul = $('#courses_list');
  let courses = {};
  course_ul.find('li').each(function() {
    let state = $(this).attr('class').replace(" clearfix", "").replace(" ", "");
    let href = $(this).find('a').attr('href');
    let course_id = href.replace('/courses/', '').replace('/users/'+user_id, '');
    let course_name = $(this).find('span.name').first().html().trim();
    courses[course_id] = new Course(parseInt(course_id), course_name, user_id);
    let course = courses[course_id];
    course.state = state;
    if (state !== "active" && state !== "completed" && state !== "invited") {
      course.hideRow();
    }
    course.updateCell('state', state);
  });

    for (var course_id in courses) {
        let course = courses[course_id];
  requestCourseGradeData(courses, course_id, 'active');
    }
    report_foot.append("<tr><td colspan=7 height=10></td></tr>");
    let average_row = $('<tr id="btech-modal-average"></tr>').appendTo(report_foot);
    average_row.append("<td colspan=3>AVERAGE</td>");
    for (let key in columns) {
        if (columns[key].average == true) {
            average_row.append(columns[key].average_element);
        }
    }
}
function getAssignmentData(courses, course_id, enrollment) {
  let course = courses[course_id];
  let user_id = course.user_id;
  let url = "/api/v1/courses/"+course_id+"/analytics/users/"+user_id+"/assignments";
  $.get(url, function(data) {
    course.assignments = data;
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
    course.progress = progress;

    //calculate color for last submission day
    let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));
    let color = "#FFF";
    if (most_recent_days >= 7 && most_recent_days <= 21) {
      let g = 16 - Math.floor(((most_recent_days - 6) / 15) * 16);
      if (g < 6) g = 6;
      color = "#F"+g.toString(16)+"7";
    }
    if (most_recent_days > 21) color = "#F67";
    course.updateCell('progress', progress);
    updateAverage('progress', courses);
  });
}
function requestCourseGradeData(courses, course_id, state) {
  let course = courses[course_id];
  let user_id = course.user_id;
  let url = "/api/v1/courses/"+course_id+"/search_users?user_ids[]="+user_id+"&enrollment_state[]="+state+"&include[]=enrollments";
  $.get(url, function(data) {
    if (data.length > 0) {
      let enrollment = data[0].enrollments[0];
      let grade = enrollment.grades.current_score;
      if (grade == null) {
        if (course.state == "active") grade = 0;
        else grade = "N/A";
      }
      course.grade = grade;
      course.updateCell('grade', grade);
      updateAverage('grade', courses);

      let final_grade = enrollment.grades.final_score;
      if (grade == "N/A" && final_grade == 0) final_grade = "N/A";
      course.final_grade = final_grade;
      course.updateCell('final_grade', final_grade);
      updateAverage('final_grade', courses);
      getAssignmentData(courses, course_id, enrollment);
    } else if (state == "active") {
      requestCourseGradeData(courses, course_id, 'completed');
    }
  });
}
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
function keyToHeading(key) {
    return key.replace(/_/g, " ").toUpperCase();
}

function keyToCSS(key) {
    return key.replace(/_/g, "-");
}

function updateAverage(key, dict) {
	let total = 0;
	let count = 0;
	for (var course_id in dict) {
		let course = dict[course_id];
		let val = course[key];
		if (val !== "N/A") {
			total += parseInt(val);
			count += 1;
		}
	}
	let average = total / count;
	let text = Math.round(average);
	if (columns[key].percent === true) text += "%";
	columns[key].average_element.html(text);
}

function getCellId(key, user_id) {
	return "btech-report-"+keyToCSS(key)+"-"+user_id
}

function updateCell(key, user_id, value, color="#FFF") {
	let cellId = getCellId(key, user_id);
	let cell = $("#"+cellId);
	cell.css("background-color",color);
	if (columns[key].percent == true && value !== "N/A") value += "%";
	cell.html(value);
}
class Course {
	constructor(id, name, user_id) {
		this.id = id;
		this.user_id = user_id;
		this.name = name;
		this.assignments = [];
		this.state = "";
		this.grade = "N/A";
		this.progress = "N/A";
		this.final_grade = "N/A";
		this.row = this.genRow();
		this.row.appendTo($('#btech-report-table-body'));
		this.updateCell('name', "<a target='_blank' href='https://btech.instructure.com/courses/"+id+"'>"+this.name+"</a>(<a target='_blank' href='https://btech.instructure.com/courses/"+id+"/grades/"+this.user_id+"'>grades</a>)");
	}
	genRow() {
		let row = $('<tr id="btech-modal-report-'+this.id+'"></tr>');
		for (let key in columns) {
			row.append("<td id='"+getCellId(key, this.id)+"' style='text-align:left; padding:10px;'>N/A</td>");
		}
		return row;
	}
	updateCell(key, value, color="#FFF") {
    let cellId = getCellId(key, this.id);
    let cell = $("#"+cellId);
    cell.css("background-color",color);
    if (columns[key].percent == true && value !== "N/A") value += "%";
    cell.html(value);
  }
  hideRow() {
    this.row.hide();
  }
}
