(function () {
  class Student {
    constructor(id, name, course_id, app) {
      this.app = app;
      this.user_id = id;
      this.name = name;
      this.course_id = course_id;
      this.days_in_course = 0;
      this.days_since_last_submission = 0;
      this.days_since_last_submission_color = "#fff";
      this.grade = "N/A";
      this.points = 0;
      this.final_grade = "N/A";
      this.section = "";
      this.enrollment = {};
      this.data = {};
      this.ungraded = 0;
      this.assignments = {};
      //this will probably be deleted, but keeping for reference on how to format in vue
      let nameHTML = "<a target='_blank' href='https://btech.instructure.com/users/" + id + "'>" + name + "</a> (<a target='_blank' href='https://btech.instructure.com/courses/" + course_id + "/grades/" + id + "'>grades</a>)";
    }
    async processEnrollment() {
      let enrollment = this.enrollment;
      let start_date = Date.parse(enrollment.created_at);
      let now_date = Date.now();
      let diff_time = Math.abs(now_date - start_date);
      let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
      let grades = enrollment.grades;
      let current_score = grades.current_score;
      if (current_score === null) current_score = 0;
      let final_score = grades.final_score;
      if (final_score === null) final_score = 0;

      //update values
      this.days_in_course = diff_days;
      this.grade = current_score;
      this.final_grade = final_score;
      //there might need to be a check to see if this is a numbe
      if (this.grade > 0 && this.grade != null) {
        this.points = Math.round(this.final_grade / this.grade * 100);
      }
    }

    async getAssignmentData() {
      let student = this;
      let user_id = student.user_id;
      let course_id = student.course_id;
      let enrollment = student.enrollment;
      let url = "/api/v1/courses/" + course_id + "/analytics/users/" + user_id + "/assignments?per_page=100";
      student.days_since_last_submission = 'pending...';
      $.get(url, function (data) {
        student.assignments = data;
        let assignments = data;
        let most_recent = {};
        let submitted = 0;
        let max_submissions = 0;
        let progress_per_day = 0;
        let start_date = Date.parse(enrollment.created_at);
        let now_date = Date.now();
        let diff_time = Math.abs(now_date - start_date);
        let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
        let most_recent_time = diff_time;
        let ungraded = 0;
        for (let a = 0; a < assignments.length; a++) {
          let assignment = assignments[a];
          if (assignment.submission !== undefined) {
            let submitted_at = Date.parse(assignment.submission.submitted_at);
            if (assignment.points_possible > 0) {
              max_submissions += 1;
              if (assignment.submission.score !== null) {
                submitted += 1;
              }
            }
            if (assignment.submission.score === null && assignment.submission.submitted_at !== null) {
              ungraded += 1;
            }
            if (Math.abs(now_date - submitted_at) < most_recent_time) {
              most_recent_time = Math.abs(now_date - submitted_at);
              most_recent = assignment;
            }
          }
        }

        let points = student.points;
        let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));
        progress_per_day = points / diff_days;
        progress_per_day_list.push(progress_per_day);
        let sum_progress = 0;
        for (let i = 0; i < progress_per_day_list.length; i++) {
          sum_progress += progress_per_day_list[i];
        }
        student.app.students[student.user_id].days_since_last_submission =  most_recent_days;

        student = Object.assign({}, student, {ungraded: ungraded});
        let perc_submitted = Math.round((submitted / max_submissions) * 100);
        if (isNaN(perc_submitted)) perc_submitted = 0;
        student.app.students[student.user_id] = Object.assign({}, student, {submissions: perc_submitted});
      });
    }
  }
  class Column {
    constructor(name, description, average, sortable_type, percent) {
      this.name = name;
      this.description = description;
      this.average = average;
      this.sortable_type = sortable_type;
      this.hidden = true;
      this.percent = percent;
    }
  }
  IMPORTED_FEATURE = {};
  if (true) {
    IMPORTED_FEATURE = {
      initiated: false,
      async _init(params = {}) {
        console.log("v4")
        let vueString = '';
        await $.get('https://jhveem.github.io/custom_features/reports/grades_report.vue', null, function (html) {
          vueString = html.replace("<template>", "").replace("</template>", "");
        }, 'text');
        let canvasbody = $("#application");
        canvasbody.after('<div id="canvas-grades-report-vue"></div>');
        $("#canvas-grades-report-vue").append(vueString);
        this.APP = new Vue({
          el: '#canvas-grades-report-vue',
          mounted: function () {
            this.courseId = ENV.context_asset_string.replace("course_", "");
            this.createGradesReport();
          },

          data: function () {
            return {
              courseId: null,
              students: {},
              columns: [
                new Column('Name', '', false, '', false),
                new Column('Section', '', false, '', false),
                new Column('Grade', '', true, 'sorttable_numeric', true),
                new Column('Final Grade', '', true, 'sorttable_numeric', true),
                new Column('Points', '', true, 'sorttable_numeric', true),
                new Column('Submissions', '', true, 'sorttable_numeric', true),
                new Column('Days Since Last Submission', '', true, 'sorttable_numeric', false),
                new Column('Days in Course', '', true, 'sorttable_numeric', false),
                new Column('Ungraded', '', true, 'sorttable_numeric', false)
              ]
            }
          },



          methods: {
            getColumnText(column, text) {
              if (column.percent && !isNaN(text)) {
                text += "%";
              }
              return text;
            },
            getDaysSinceLastSubmissionColor(column, val) {
              color = "#FFF";
              if (column === "Days Since Last Submission") {
                if (val >= 7 && val <= 21) {
                  let g = 16 - Math.floor(((val - 6) / 15) * 16);
                  if (g < 6) g = 6;
                  color = "#F" + g.toString(16) + "7";
                }
                if (val > 21) color = "#F67";
              }
              return color;
            },
            async createGradesReport() {
              let app = this;
              let url = "/api/v1/courses/" + this.courseId + "/users?enrollment_state%5B%5D=active";
              url += "&enrollment_state%5B%5D=invited"
              url += "&enrollment_type%5B%5D=student"
              url += "&enrollment_type%5B%5D=student_view";
              url += "&include%5B%5D=avatar_url";
              url += "&include%5B%5D=group_ids";
              url += "&include%5B%5D=enrollments";
              url += "&per_page=100";

              await $.get(url, function (data) {
                for (let s = 0; s < data.length; s++) {
                  let studentData = data[s];
                  let userId = studentData.id;
                  let enrollment = null;

                  for (let e = 0; e < studentData.enrollments.length; e++) {
                    if (studentData.enrollments[e].type === "StudentEnrollment") {
                      enrollment = studentData.enrollments[e];
                    }
                  }
                  if (enrollment !== null) {
                    let student = new Student(userId, studentData.sortable_name, app.courseId, app)
                    student.data = studentData;
                    student.enrollment = enrollment;
                    await student.processEnrollment();
                    await student.getAssignmentData();
                    Vue.set(app.students, userId, student);
                  }
                }
              });
              app.getSectionData();
            },
            async getSectionData() {
              let app = this;
              let url = "/api/v1/courses/" + app.courseId + "/sections?per_page=100&include[]=students";
              $.get(url, function (data) {
                let sections = data;
                if (sections.length > 0) {
                  for (let i = 0; i < sections.length; i++) {
                    let section = sections[i];
                    let studentsData = section.students;
                    if (studentsData !== null) {
                      if (studentsData.length > 0) {
                        for (let j = 0; j < studentsData.length; j++) {
                          let studentData = studentsData[j];
                          app.checkStudentInSection(studentData, section);
                        }
                      }
                    }
                  }
                }
              });
            },

            checkStudentInSection(studentData, section) {
              let app = this;
              for (let id in app.students) {
                let student = app.students[id];
                let user_id = parseInt(student.user_id);
                if (studentData.id === user_id) {
                  student.section = section.name;
                  return;
                }
              }
            },

          }
        })
        Vue.component('report-row', {
          template: `
            <tr>
              <th
                is="report-cell"
                v-for='column in columns' 
                :student="student"
                :keyName="formattedColumnName(column.name)"
              >
              </th>
            </tr>
          `,
          props: [
            'columns',
            'student'
          ],
          methods: {
            getCellText(column, text) {
              if (column.percent && !isNaN(text)) {
                text += "%";
              }
              return text;
            },
            columnValue(name) {
              return this.student[this.formattedColumnName(name)];
            },
            formattedColumnName(name) {
              return name.toLowerCase().replace(/ /g, '_');
            },
          }
        });
        Vue.component('report-cell', {
          template: `
            <th>
              {{student[keyName]}}
            </th>
          `,
          props: [
            'keyName',
            'student'
          ],
          methods: {
          }
        });

      },
      APP: {}
    }
  }
})();