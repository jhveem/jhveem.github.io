//https://btech.beta.instructure.com/courses/470598
(async function () {
  IMPORTED_FEATURE = {};
  //IF the editor, add the ability to add services
  if (TOOLBAR.checkEditorPage()) {
    await TOOLBAR.checkReady();

    function checkButtonColor(btn) {
      let body = tinyMCE.activeEditor.getBody();
      let services = $(body).find("#btech-hs-courses");
      if (services.length === 0) {
        btn.find('i').css({
          'color': "#000000"
        });
      } else {
        btn.find('i').css({
          'color': "#d22212"
        });
      }
    }
    let btn = await TOOLBAR.addButtonIcon("far fa-concierge-bell", "Convert this assignment to a Services assignment", async function () {
      let body = tinyMCE.activeEditor.getBody();
      let services = $(body).find("#btech-hs-courses");
      if (services.length === 0) {
        $(body).prepend(`
          <div id='btech-hs-courses" class="btech-hidden' style='border: 1px solid #000;'>DO NOT DELETE. THIS SETS THIS ASSIGNMENT AS A #SERVICES# ASSIGNMENT</div><p> </p>
        `);
      } else {
        services.remove();
      }
    });
    checkButtonColor(btn);
    btn.click(function () {
      checkButtonColor(btn);
    });
  }

  //GRADING VIEW
  //This one has to come first so it doesn't have the submission view run on the grading page
  if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
    if (ENV.current_user_roles.includes("teacher")) {
      IMPORTED_FEATURE = {
        initiated: false,
        async _init(params = {}) {
          //NEEDS
          ////TOP PRIORITY: Need to handle pagination for comments since there will be more than 100
          ////Checks on if a student has already submitted their max number of submissions, at least a warning, probably not a hard block
          ////Allow students to see everything except for the review tab so they can see their summary, submitted, and rejected info too
          ////Option to delete a submission, which will delete that comment and all other comments with the submission id
          ////Allow the color themes to affect the color of the buttons and display in both teacher view and student view

          let vueString = `
            <div style="padding:10px;" id='app-hs-courses'>
              <div class="btech-tabs-container">
                <ul>
                  <li v-for="menuName, key in menus" :class="{active: menu==menuName}" @click="menu=menuName">{{menuName}}</li>
                  <li v-if="flaggedDates.length > 0" :class="{active: menu=='flagged'}" @click="menu='flagged'">flagged dates</li>
                </ul>
                <div style="padding: 10px;">

                  <div v-if="menu == 'courses'">
                    <div v-if="loading==true">Loading Content...</div>
                    <div v-else>
                      <h3>Select a service and submit to confirm a student pass off.</h3>
                      <select v-model="selectedCourse">
                        <option value="" disabled>-Select Course-</option>
                        <option v-for="course in courses" :value="course.course_id">{{course.name}}</option>
                      </select>
                      <br>
                      <span>Grade </span><input style="width: 3em;" maxlength="3" type="text" v-model="selectedGrade"><span>%</span>
                      <br>
                      <div v-on:click="submitCourseGrade()" class="Button">Submit</div>
                    </div>
                  </div>

                  <div v-if="menu == 'completed'">
                    <div for="course in courseGrades">{{course}}</div>
                  </div>

                </div>
              </div>
            </div>`;
          let rPieces = /^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/;
          let pieces = window.location.pathname.match(rPieces);
          let courseId = parseInt(pieces[1]);
          let studentId = parseInt(pieces[3]);
          let assignmentId = parseInt(pieces[2]);
          let description = '';
          await $.get("/api/v1/courses/" + courseId + "/assignments/" + assignmentId, function (data) {
            description = data.description;
          });
          if (description.includes("btech-hs-courses")) {
            let rURL = /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/
            if (rURL.test(window.location.pathname)) {
              $("div.submission-details-frame iframe").hide();
              $("div.submission-details-frame").append(vueString);
              await getElement("#app-hs-courses");
              new Vue({
                el: '#app-hs-courses',
                data: function () {
                  return {
                    menu: 'courses',
                    menus: [
                      'courses',
                      'completed',
                      'progress'
                    ],
                    loading: true,
                    courseid: 0,
                    assignmetnId: 0,
                    studentId: 0,
                    comments: [],
                    services: {},
                    courses: [],
                    courseGrades: [],
                    completedServices: [],
                    criteria: {},
                    selectedCourse: '',
                    selectedGrade: '',
                    completedCriterionDate: '',
                    dates: [],
                    flaggedDates: []
                  }
                },
                mounted: async function () {
                  let app = this;
                  let rPieces = /^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/;
                  let pieces = window.location.pathname.match(rPieces);
                  this.courseId = parseInt(pieces[1]);
                  this.studentId = parseInt(pieces[3]);
                  this.assignmentId = parseInt(pieces[2]);
                  let url = window.location.origin + "/users/" + this.studentId;
                  let list = [];
                  await $.get(url).done(function (data) {
                    $(data).find("#content .courses a").each(function () {
                      let name = $(this).find('span.name').text().trim();
                      let href = $(this).attr('href');
                      let match = href.match(/courses\/([0-9]+)\/users/);
                      if (match) {
                        let text = $(this).text().trim();
                        let course_id = match[1];
                        let state = text.match(/([A-Z|a-z]+),[\s]+?Enrolled as a Student/)[1];
                        list.push({
                          name: name,
                          course_id: course_id,
                          state: state
                        });
                      }
                    });
                  }).fail(function (e) {
                    console.log(e);
                    app.accessDenied = true;
                  });
                  app.courses = list;
                  this.comments = await this.getComments();
                  this.processComments(this.comments);
                  this.loading = false;
                },
                computed: {
                  totalProgress: function () {
                    let points = 0;
                    let maxPoints = 0;
                    for (let name in this.criteria) {
                      let criterion = this.criteria[name];
                      points += criterion.points_current;
                      maxPoints += criterion.points;
                    }
                    return points / maxPoints;
                  },
                },
                methods: {
                  minToHoursString: function (minutes) {
                    let hours = Math.floor(minutes / 60);
                    minutes = minutes - (hours * 60);
                    return hours + "h " + minutes + "m";
                  },
                  hoursSubmittedInDate: function (date, serviceName = '') {
                    let total = 0;
                    for (var i = 0; i < this.services.length; i++) {
                      let service = this.services[i];
                      if (service.service == serviceName || serviceName == '') {
                        if (date == '' || this.dateToString(date) == this.dateToString(service.canvas_data.created_at)) {
                          total += this.criteria[service.service].average_time;
                        }
                      }
                    }
                    return total;
                  },
                  createComment(course, grade, comment) {
                    for (let c = 0; c < this.courses.length; c++) {
                      if (this.courses[c].course_id == course) {
                        name = this.courses[c].name;
                      }
                    }
                    let text = `COURSE: ` + course + `\nNAME: ` + name + `\nGRADE: ` + grade;
                    return text;
                  },
                  dateToString(date) {
                    date = new Date(Date.parse(date));
                    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                  },
                  async submitCourseGrade() {
                    let course = this.selectedCourse;
                    let grade = this.selectedGrade;
                    let found = false
                    if (course != "") {
                      for (let c = 0; c < this.courseGrades.length; c++) {
                        if (this.courseGrades[c].course_id === course) {
                          this.courseGrades[c].grade = grade;
                          $.delete("https://btech.beta.instructure.com/submission_comments/" + this.courseGrades[c].comment_id);
                        } 
                      }
                      if (!found) {
                        this.courseGrades.push({
                          grade: grade
                        });
                      }

                      let coursePointsTotal = 0;
                      let courseCount = this.courseGrades.length;
                      for (let c = 0; c < this.courseGrades.length; c++) {
                        let courseData = this.courseGrades[c];
                        coursePointsTotal += parseInt(courseData['grade']);
                      }
                      this.loading = true;
                      let url = "/api/v1/courses/" + this.courseId + "/assignments/" + this.assignmentId + "/submissions/" + this.studentId;
                      await $.put(url, {
                        comment: {
                          text_comment: this.createComment(course, grade)
                        },
                        submission: {
                          posted_grade: (coursePointsTotal / courseCount)
                        }
                      });
                      location.reload(true);
                    }
                  },
                  async getComments() {
                    let url = "/api/v1/courses/" + this.courseId + "/assignments/" + this.assignmentId + "/submissions/" + this.studentId + "?include[]=submission_comments";
                    let comments = [];
                    await $.get(url, function (data) {
                      comments = (data.submission_comments);
                    });
                    return comments;
                  },
                  getCommentData(comment, dataName) {
                    let regex = new RegExp(dataName + "\:[ ]*(.+)");
                    let data = comment.match(regex);
                    if (data !== null) {
                      data = data[1];
                    } else {
                      data = "";
                    }
                    return data;
                  },
                  processComments(canvasCommentsData) {
                    this.completedServices = [];
                    this.rejectedServices = [];
                    this.pendingServices = [];
                    this.courseGrades = [];
                    for (let c = 0; c < canvasCommentsData.length; c++) {
                      let comment = canvasCommentsData[c].comment;
                      let authorData = canvasCommentsData[c].author;
                      let date = this.dateToString(canvasCommentsData[c].created_at);
                      if (authorData.id !== this.studentId) {
                        let cCourse = this.getCommentData(comment, "COURSE");
                        if (cCourse !== "" && cCourse !== "undefined") {
                          let cGrade = this.getCommentData(comment, "GRADE");
                          let cName = this.getCommentData(comment, "NAME");
                          //Check if it's a student comment or a teacher confirmation
                          this.courseGrades.push({
                            course: cCourse,
                            grade: cGrade,
                            name: cName,
                            author_data: authorData,
                            canvas_data: canvasCommentsData[c],
                            comment_id: canvasCommentsData[c].id
                          });
                          if (!this.dates.includes(date)) {
                            this.dates.push(date);
                          }
                        }
                      }
                    }
                  },
                },
              });
            }
          }
        }
      }
    }
  }
})();