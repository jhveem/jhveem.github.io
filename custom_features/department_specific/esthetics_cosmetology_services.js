  /*
    There are two pieces to this tool, the first is view on the submissions page which is a table created with Vue that allows teachers and students to review the student's submissions
    The second is the assignment page, where the student will select a service and submit it.
    It stores points and service options in a rubric. Rubric description = service. Max points = required submissions.
    It stores submission data in comments. Each submission is given and id and then the comment stores information like the id, the service performed, etc. 
    When reviewed, a matching commment with the same ID is added along with whether it was confirmed or rejected.

    I recommend breaking up Services into as small of chunks as is manageable because there could easily be 1000s of comments otherwise
  */
  //DEMO HERE:
  //https://btech.beta.instructure.com/courses/470598
  (function () {
    IMPORTED_FEATURE = {};
    //GRADING VIEW
    //This one has to come first so it doesn't have the submission view run on the grading page
    if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {

      if (ENV.current_user_roles.includes("teacher")) {
        IMPORTED_FEATURE = {
          initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
          async _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
            //NEEDS
            ////TOP PRIORITY: Need to handle pagination for comments since there will be more than 100
            ////Rejection
            ////Progress report
            ////Some way to pull up submissions by date
            ////Checks on if a student has already submitted their max number of submissions, at least a warning, probably not a hard block
            ////Allow students to see everything except for the review tab so they can see their summary, submitted, and rejected info too
            ////Allow the color themes to affect the color of the buttons and display in both teacher view and student view
            ////A way to undo rejections and change them to confirmations and visa-versa. Probably just let you click a button on the confirm/rejection menu page to move it over. This will really delete that comment and create a new one with the revised status.
            ////Option to delete a submission, which will delete that comment and all other comments with the submission id

            let vueString = `
<div style="padding:10px;" id='app-services'>
  <div class="btech-tabs-container">
    <ul>
      <li v-for="menuName, key in menus" :class="{active: menu==menuName}" @click="menu=menuName">{{menuName}}</li>
      <li v-if="flaggedDates.length > 0" :class="{active: menu=='flagged'}" @click="menu='flagged'">flagged</li>
    </ul>
    <div style="padding: 10px;">

      <div v-if="menu == 'review'">
        <div v-if="loading==true">Loading Content...</div>
        <div v-else>
          <h3>Select a service and submit to confirm a student pass off.</h3>
          <select v-model="selectedCriterion">
            <option value="" disabled>-Select Service-</option>
            <option v-for="criterion in criteria" :value="criterion.description">{{criterion.description}} ({{criterion.points_current}}/{{criterion.points}} completed)</option>
          </select>
          <textarea style="width: 100%; box-sizing: border-box;" v-model="reviewerComment" placeholder="You may leave a comment about the student's performance here."></textarea>
          <br>
          <div id="btech-services-confirm" v-on:click="confirmCurrentService()" class="Button">Confirm</div>
        </div>
      </div>

      <div v-if="menu == 'completed'">
        <p>Select a Service from the dropdown below to review completed submissions</p>
        <select v-model="selectedCompletedCriterion">
          <option value="" disabled>-Select Service-</option>
          <option v-for="criterion in criteria" :value="criterion.description">{{criterion.description}} ({{criterion.points_current}}/{{criterion.points}} completed) {{criterion.average_time}}</option>
        </select>
        <input type="date" v-model="completedCriterionDate" min="2018-01-01">
        <br>
        <div>{{hoursSubmittedInDate(completedCriterionDate, selectedCompletedCriterion)}} minutes</div>
        <div v-for="service in services">
          <div v-if="(service.service === selectedCompletedCriterion || selectedCompletedCriterion === '') && (completedCriterionDate === '' || dateToString(completedCriterionDate) == dateToString(service.canvas_data.created_at))" style="border: 1px solid #000; padding: 20px; margin-bottom: 20px;">
            <p><b>Completed: </b>{{dateToString(service.canvas_data.created_at)}}</p>
            <p><b>Reviewer: </b>{{service.author_data.display_name}}</p>
            <blockquote v-if="service.comments!=''">{{service.comments}}</blockquote>
          </div>
        </div>
      </div>

      <div v-if="menu === 'progress'">
        <div>Progress: {{Math.round(totalProgress * 100)}}%</div>
        <br>
        <div v-for="criterion in criteria">
            {{criterion.description}}: {{criterion.points_current}} / {{criterion.points}} completed ({{Math.round((criterion.points_current / criterion.points) * 100)}}%)
        </div>
      </div>

      <div v-if="menu === 'flagged'">
        <div v-for="date in flaggedDates">{{date}}</div>
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
            if (description.includes("#SERVICES#")) {
              let rURL = /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/
              if (rURL.test(window.location.pathname)) {
                $("div.submission-details-frame iframe").hide();
                $("div.submission-details-frame").append(vueString);
                await getElement("#app-services");
                new Vue({
                  el: '#app-services',
                  data: function () {
                    return {
                      menu: 'review',
                      menus: [
                        'review',
                        'completed',
                        'progress'
                      ],
                      loading: true,
                      courseid: 0,
                      assignmetnId: 0,
                      studentId: 0,
                      comments: [],
                      services: {},
                      completedServices: [],
                      criteria: {},
                      selectedCriterion: '',
                      selectedCompletedCriterion: '',
                      reviewerComment: '',
                      completedCriterionDate: '',
                      dates: [],
                      flaggedDates: []
                    }
                  },
                  mounted: async function () {
                    let rPieces = /^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/;
                    let pieces = window.location.pathname.match(rPieces);
                    this.courseId = parseInt(pieces[1]);
                    this.studentId = parseInt(pieces[3]);
                    this.assignmentId = parseInt(pieces[2]);
                    this.criteria = await this.getCriteria();
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
                    hoursSubmittedInDate: function(date, serviceName='') {
                      let total = 0;
                      for (var i = 0; i < this.services.length; i++) {
                        let service = this.services[i];
                        console.log(service);
                        if (service.service == serviceName || serviceName == '') {
                          if (date == '' || this.dateToString(date) == this.dateToString(service.canvas_data.created_at)) {
                            total += this.criteria[service.service].average_time;
                          }
                        }
                        // this.selectedCompletedCriterion this.completedCriterionDate
                      }
                      return total;
                    },
                    createComment(service, comment) {
                      let text = `
                        SERVICE: ` + service + `
                        COMMENT: ` + comment + `
                        `;
                      return text;
                    },
                    dateToString(date) {
                      date = new Date(Date.parse(date));
                      return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                    },
                    async confirmCurrentService() {
                      let service = this.selectedCriterion;
                      if (service != "") {
                        this.loading = true;
                        let url = "/api/v1/courses/" + this.courseId + "/assignments/" + this.assignmentId + "/submissions/" + this.studentId;
                        this.criteria[service].points_current += 1;
                        let rubricData = {};
                        for (var key in this.criteria) {
                          rubricData[this.criteria[key].id] = {
                            points: this.criteria[key].points_current
                          };
                        }
                        await $.put(url, {
                          comment: {
                            text_comment: this.createComment(service, this.reviewerComment)
                          },
                          rubric_assessment: rubricData
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
                    async getCriteria() {
                      let url = "/api/v1/courses/" + this.courseId + "/assignments/" + this.assignmentId;
                      let criteria = {};
                      await $.get(url, function (data) {
                        for (let i = 0; i < data.rubric.length; i++) {
                          let criterion = data.rubric[i];
                          //look to see if time data was provided
                          criterion.average_time = 0;
                          let rPieces = /([0-9]+) min/;
                          let pieces = criterion.long_description.match(rPieces);
                          if (pieces !== null) {
                            criterion.average_time = parseInt(pieces[1]);
                          }
                          criterion.points_current = 0;
                          criteria[criterion.description] = criterion;
                        }
                      });
                      return criteria;
                    },
                    processComments(canvasCommentsData) {
                      this.completedServices = [];
                      this.rejectedServices = [];
                      this.pendingServices = [];
                      this.services = [];
                      for (let c = 0; c < canvasCommentsData.length; c++) {
                        let comment = canvasCommentsData[c].comment;
                        let authorData = canvasCommentsData[c].author;
                        let date = this.dateToString(canvasCommentsData[c].created_at);
                        let cService = this.getCommentData(comment, "SERVICE");
                        if (authorData.id !== this.studentId) {
                          if (cService !== "" && cService !== "undefined") {
                            let cService = this.getCommentData(comment, "SERVICE");
                            let cComment = this.getCommentData(comment, "COMMENT");
                            //Check if it's a student comment or a teacher confirmation
                            this.services.push({
                              service: cService,
                              comments: cComment,
                              author_data: authorData,
                              canvas_data: canvasCommentsData[c],
                            });
                            if (!this.dates.includes(date)) {
                              this.dates.push(date);
                            }
                            this.criteria[cService].points_current += 1;
                          }
                        }
                      }
                      for (var i = 0; i < this.dates.length; i++) {
                        let date = this.dats[i];
                        if (this.hoursSubmittedInDate(date) > (4 * 60)) {
                          this.flaggedDates.push(date);
                        }
                      }
                      console.log(this.dates);
                      console.log("FLAGGED");
                      console.log(this.flaggedDates);
                    },
                  },
                });
              }
            }
          }
        }
      }

      //SUBMISSION VIEW
    } else if (/^\/courses\/[0-9]+\/assignments\/[0-9]+/.test(window.location.pathname)) {
      //Just add in a div with the id:  btech-services-modal
      //Change this so they just have to type #SERVICES#, no ids or anything like that
      IMPORTED_FEATURE = {
        initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
        _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
          let contents = $("div.user_content").html();
          $("div.user_content").html(contents.replace("#SERVICES#", "<div id='btech-services-modal'></div>"));
          $("#btech-services-modal").empty();
          $("#btech-services-modal").append("");
          //add in whatever should appear in here.
          ////one option is a selector for teachers to select a student or a link to the student's grades page if it's the student
        }
      }
    }
  })();