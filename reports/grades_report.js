//progress per day stuff needs to be redesigned so it gets recalced whenever progress is calced.
let progress_per_day_list = [];
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
    description: "The student&#39;s section.",
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

class Student {
	constructor(dict, id, name, course_id) {
    this.dict = dict;
    dict[id] = this;
    this.user_id = id;
    this.name = name;
    this.course_id = course_id;
    this.days_in_course = 0;
    this.days_since_last_submission = 0;
    this.section = "";
		this.grade = "N/A";
		this.progress = "N/A";
		this.final_grade = "N/A";
    this.section = "";
		this.row = this.genRow();
		this.row.appendTo($('#btech-report-table-body'));
    this.enrollment = {};
    this.data = {};
    let nameHTML = "<a target='_blank' href='https://btech.instructure.com/users/"+id+"'>"+name+"</a> (<a target='_blank' href='https://btech.instructure.com/courses/"+course_id+"/grades/"+id+"'>grades</a>)";
    this.updateCell('name', nameHTML);
    this.updateCell('section', '');
  }
	genRow() {
		let row = $('<tr id="btech-modal-report-'+this.user_id+'"></tr>');
		for (let key in columns) {
      let align = 'left';
      if (columns[key].sortable_type === 'sorttable_numeric') align = 'center';
			row.append("<td id='"+getCellId(key, this.user_id)+"' style='text-align:"+align+"; padding:10px;'>N/A</td>");
		}
		return row;
	}
	updateCell(key, value, color="#FFF") {
    let cellId = getCellId(key, this.user_id);
    let cell = $("#"+cellId);
    cell.css("background-color",color);
    
    if (columns[key].percent == true && !isNaN(parseInt(value))) value += "%";
    cell.html(value);
  }
  hideRow() {
    this.row.hide();
  }
  processEnrollment() {
    let enrollment = this.enrollment;
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

    this.days_in_course = diff_days;
    this.updateCell('days_in_course', diff_days);
    updateAverage('days_in_course', this.dict);
    updateMedian('days_in_course', this.dict);

    this.grade = current_score;
    this.updateCell('grade', current_score);
    updateAverage('grade', this.dict);
    updateMedian('grade', this.dict);

    this.final_grade = final_score;
    this.updateCell('final_grade', final_score);
    updateAverage('final_grade', this.dict);
    updateMedian('final_grade', this.dict);
  }
}

function checkStudentInSection(students, studentData, section) {
  for (let id in students) {
    let student = students[id];
    let user_id = parseInt(student.user_id);
    if (studentData.id === user_id) {
      student.updateCell('section', section.name);
      student.section = section.name;
      return;
    }
  }
}

function getSectionData(students, course_id) {
  let url = "/api/v1/courses/"+course_id+"/sections?per_page=100&include[]=students";
  $.get(url, function(data) {
    let sections = data;
    if (sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        let section = sections[i];
        let studentsData = section.students;
        if (studentsData !== null) {
          if (studentsData.length > 0) {
            for (let j = 0; j < studentsData.length; j++) {
              let studentData = studentsData[j];
              checkStudentInSection(students, studentData, section);
            }
          }
        }
      }
    }
  });
}

function getAssignmentData(student) {
  let user_id = student.user_id;
  let course_id = student.course_id;
  let enrollment = student.enrollment;
  let url = "/api/v1/courses/"+course_id+"/analytics/users/"+user_id+"/assignments";
  $.get(url, function(data) {
    student.assignments = data;
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
    if (isNaN(progress)) progress = 0;
    student.progress = progress;
    
    //update the footer
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
    student.updateCell('progress', progress);
    updateAverage('progress', student.dict);
    updateMedian('progress', student.dict);

    student.updateCell('days_since_last_submission', most_recent_days, color);
    student.days_since_last_submission = most_recent_days;
    updateAverage('days_since_last_submission', student.dict);
    updateMedian('days_since_last_submission', student.dict);
  }).fail(function() {
    student.updateCell('progress', "N/A");
    student.updateCell('days_since_last_submission', "N/A", "#FAB");
  });
}

function createGradesReport() {
  createReport();
  let gen_report_button = $('<a class="Button" id="btech-modal-report-gen">Report</a>');
  let new_grades = $('div.header-buttons');
  let old_grades = $('div#gradebook-toolbar');
  if (new_grades.length > 0) gen_report_button.appendTo(new_grades);
  if (old_grades.length > 0) gen_report_button.appendTo(old_grades);
  gen_report_button.click(function() {
      let modal = $('div#btech-modal');
      modal.show();
  });
  for (let key in columns) {
    columns[key].average_element = $('<td style="text-align:center; padding:10px;" " id="btech-report-average'+keyToCSS(key)+'"></td>');
    columns[key].median_element = $('<td style="text-align:center; padding:10px;" id="btech-report-median-'+keyToCSS(key)+'"></td>');
  }

  let course_id = ENV.context_asset_string.replace("course_", "");
  let report = $('#btech-report-table');
  let report_foot = $('#btech-report-table-foot');

  let url = "/api/v1/courses/"+course_id+"/users?enrollment_state%5B%5D=active";
  url += "&enrollment_state%5B%5D=invited"
  url += "&enrollment_type%5B%5D=student"
  url += "&enrollment_type%5B%5D=student_view";
  url += "&include%5B%5D=avatar_url";
  url += "&include%5B%5D=group_ids";
  url += "&include%5B%5D=enrollments";
  url += "&per_page=100";

  let students = {};

  $.get(url, function(data) {
    for (let s = 0; s < data.length; s++) {
      let studentData = data[s];
      let user_id = studentData.id;
      let enrollment = null;

      for (let e = 0; e < studentData.enrollments.length; e++) {
        if (studentData.enrollments[e].type === "StudentEnrollment") {
          enrollment = studentData.enrollments[e];
        }
      }
      if (enrollment !== null) {
        let student = new Student(students, user_id, studentData.sortable_name, course_id);
        student.data = studentData;
        student.enrollment = enrollment;
        student.processEnrollment();
        getAssignmentData(student);
      }
    }
    getSectionData(students, course_id);
    //Set up the bottom data including averages, medians, and other information
    report_foot.append("<tr><td colspan=7 height=10></td></tr>");
    let average_row = $('<tr id="btech-modal-average"></tr>').appendTo(report_foot);
    let median_row = $('<tr id="btech-modal-median"></tr>').appendTo(report_foot);
    median_row.append('<td style="padding:10px;" colspan=2>MEDIAN</td>');
    average_row.append('<td style="padding:10px;" colspan=2>AVERAGE</td>');
    for (let key in columns) {
      if (columns[key].average == true) {
        average_row.append(columns[key].average_element);
        median_row.append(columns[key].median_element);
      }
    }

    report_foot.append("<tr><td colspan=7 height=10></td></tr>");
    let final_row = $('<tr id="btech-modal-report-summary"></tr>').appendTo(report_foot);
    final_row.append("<td style='padding:10px;' colspan=2>ESTIMATED AVERAGE DAYS TO COMPLETION</td>");
    final_row.append("<td style='padding:10px; text-align:center;' id='btech-days-to-completion' style='text-align:center;'></td>");

  });
}

createGradesReport();
