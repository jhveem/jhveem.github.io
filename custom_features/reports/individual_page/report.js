(function () {

  class Column {
    constructor(name, description, average, sortable_type, percent) {
      this.name = name;
      this.description = description;
      this.average = average;
      this.sortable_type = sortable_type;
      this.visible = true;
      this.percent = percent;
    }
  }
  IMPORTED_FEATURE = {};
  if (true) {
    IMPORTED_FEATURE = {
      initiated: false,
      async _init(params = {}) {
        let vueString = '';
        await $.get('https://jhveem.github.io/custom_features/reports/individual_page/template.vue', null, function (html) {
          vueString = html.replace("<template>", "").replace("</template>", "");
        }, 'text');
        let canvasbody = $("#application");
        canvasbody.after('<div id="canvas-grades-report-vue"></div>');
        $("#canvas-grades-report-vue").append(vueString);
        this.APP = new Vue({
          el: '#canvas-grades-report-vue',
          mounted: async function () {
            this.courseId = ENV.context_asset_string.replace("course_", "");
            let match = window.location.pathname.match(/courses\/([0-9]+)\/users\/([0-9]+)/);
            this.userId = match[2];
            console.log(match[2]);
            this.course = await this.getCourseData();
            this.loading = false;
          },

          data: function () {
            return {
              userId: null,
              courses: {},
              columns: [
                new Column('Name', '', false, '', false),
                new Column('Grade', '', true, 'sorttable_numeric', true),
                new Column('Final Grade', '', true, 'sorttable_numeric', true),
                new Column('Points', '', true, 'sorttable_numeric', true),
                new Column('Submissions', '', true, 'sorttable_numeric', true),
                new Column('Days Since Last Submission', '', true, 'sorttable_numeric', false),
                new Column('Days in Course', '', true, 'sorttable_numeric', false),
                new Column('Ungraded', '', true, 'sorttable_numeric', false)
              ],
              sections: [],
              courseList: [],
              studentData: [],
              loading: true,
            }
          },
          computed: {
            visibleColumns: function () {
              return this.columns.filter(function (c) {
                return c.visible;
              })
            }
          },
          methods: {
            newCourse(id, status) {
              let course = {};
              course.course_id = id;
              course.status = status;
              course.name = '';
              course.days_in_course = 0;
              course.days_since_last_submission = 0;
              course.days_since_last_submission_color = "#fff";
              course.section = "";
              course.grade = "N/A";
              course.points = 0;
              course.final_grade = "N/A";
              course.section = "";
              course.ungraded = 0;
              course.submissions = 0;
              return course;
            },

            async getCourseData() {
              let app = this;
              let courses = [];
              let courseList = await this.getCourses();
              for (let c = 0; c < courseList.length; c++) {
                let course = app.newCourse(courseList[c].course_id, courseList[c].status);
                let gradesData = await app.getCourseGrades(course.course_id, course.state);
                console.log(gradesData);
                course.grade = gradesData.grade;
                course.final_grade = gradesData.final_grade;
                course.points = gradesData.points;
                courses.push(course);
              }
              app.courses = courses;
              console.log(courses);
              app.loading = false;
            },

            async getCourses() {
              let app = this;
              let list = [];
              let url = "https://btech.instructure.com/users/" + app.userId;
              await $.get(url, function (data) {
                $(data).find("#content .courses a").each(function () {
                  let href = $(this).attr('href');
                  let match = href.match(/courses\/([0-9]+)\/users/);
                  if (match) {
                    let text = $(this).text().trim();
                    let course_id = match[1];
                    let state = text.match(/([A-Z|a-z]+),[\s]+?Enrolled as a Student/)[1];
                    list.push({
                      course_id: course_id,
                      state: state
                    });
                  }
                });
              });
              console.log(list);
              return list;
            },

            async getCourseGrades(course_id, state) {
              let output = {};
              let check = false;
              let app = this;
              let user_id = app.user_id;
              console.log(state);
              let url = "/api/v1/courses/" + course_id + "/search_users?user_ids[]=" + user_id + "&enrollment_state[]=" + state.toLowerCase() + "&include[]=enrollments";
              console.log(url);
              await $.get(url, function (data) {
                console.log(data);
                if (data.length > 0) {
                  check = true;
                  let enrollment = data[0].enrollments[0];
                  let grades = enrollment.grades;
                  if (grades !== undefined) {
                    let grade = grades.current_score;
                    if (grade == null) {
                      if (course.state == "active") grade = 0;
                      else grade = "N/A";
                    }
                    output.grade = grade;

                    let final_grade = enrollment.grades.final_score;
                    if (final_grade == null) final_grade = 0;
                    if (grade == "N/A" && final_grade == 0) final_grade = "N/A";
                    output.final_grade = final_score;

                    if (!isNaN(parseInt(final_grade)) && !isNaN(parseInt(final_grade))) {
                      let points = Math.round(final_grade / grade * 100);
                      if (isNaN(points)) points = 0;
                      output.points = points;
                    }
                  }
                }
              });
              if (check == false && state == "active") {
                output = app.getCourseGrades(course_id, 'completed');
              }
              return output;
            },

            columnNameToCode(name) {
              return name.toLowerCase().replace(/ /g, "_");
            },

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

            processEnrollment(student, enrollment) {
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
              student.days_in_course = diff_days;
              student.grade = current_score;
              student.final_grade = final_score;
              //there might need to be a check to see if this is a numbe
              if (student.grade > 0 && student.grade != null) {
                student.points = Math.round(student.final_grade / student.grade * 100);
              }
            },

            async getAssignmentData(student, enrollment) {
              let user_id = student.user_id;
              let course_id = student.course_id;
              let url = "/api/v1/courses/" + course_id + "/analytics/users/" + user_id + "/assignments?per_page=100";
              await $.get(url, function (data) {
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
                student.days_since_last_submission = most_recent_days;

                let average_progress_per_day = sum_progress / progress_per_day_list.length;
                let average_days_to_complete = Math.floor(100 / average_progress_per_day);
                student.ungraded = ungraded;
                let perc_submitted = Math.round((submitted / max_submissions) * 100);
                if (isNaN(perc_submitted)) perc_submitted = 0;
                student.submissions = perc_submitted;
              });
            },
            close() {
              $(this.$el).hide();
            }

          }
        })
      },
      APP: {}
    }
  }
  console.log('v3');
})();