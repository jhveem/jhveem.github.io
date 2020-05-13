  (function () {
    IMPORTED_FEATURE = {};
    //GRADING VIEW
    //This one has to come first so it doesn't have the submission view run on the grading page
    if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {

      if (ENV.current_user_roles.includes("teacher")) {
        IMPORTED_FEATURE = {
          initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
          _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
            //NEEDS
            ////Rejection
            ////Progress report
            ////Some way to pull up submissions by date

            //DEMO HERE:
            //https://btech.beta.instructure.com/courses/470598
            let vueString = `
<div style="padding:10px;" id='app-services'>
  <div class="btech-tabs-container">
    <ul>
      <li v-for="menuName, key in menus" :class="{active: menu==menuName}" @click="menu=menuName">{{menuName}}</li>
    </ul>
    <div style="padding: 10px;">

      <div v-if="menu == 'review'">
        <div v-if="loading==true">Loading Content...</div>
        <div v-else>
          <div v-if="pendingServices.length > 0">
            <h2>Review the Following Service</h2>
            <div  style="border: 1px solid #000; box-shadow: 3px 6px 6px #888; padding: 20px; margin-bottom: 20px;">
              <p><b>Student: </b>{{curService.canvas_data.author_name}}</p>
              <p><b>Service: </b>{{curService.service}}</p>
              <p><b>Date: </b>{{curService.canvas_data.created_at}}</p>
            </div>
            <br>
            <textarea style="width: 100%; box-sizing: border-box;" v-model="reviewerComment" placeholder="you may leave a comment explaining your review here"></textarea>
            <br>
            <div id="btech-services-confirm" v-on:click="confirmCurrentService()" class="Button">Confirm</div>
            <div id="btech-services-reject" class="Button">Reject</div>
            <p>{{pendingServices.length - 1}} additional services pending review</p>
          </div>
          <div v-else>
            <p>There are no more services pending review.</p>
          </div>
        </div>
      </div>

      <div v-if="menu == 'completed'">
        <p>Select a Service from the dropdown below to review the completed submissions</p>
        <select v-model="selectedCompletedCriterion">
          <option v-for="criterion in criteria" :value="criterion.description">{{criterion.description}} ({{criterion.points_current}}/{{criterion.points}} completed)</option>
        </select>
        <div v-for="id in completedServices">
          <div v-if="services[id].service === selectedCompletedCriterion" style="border: 1px solid #000; padding: 20px; margin-bottom: 20px;">
            <p><b>Completed: </b>{{services[id].canvas_data.created_at}}</p>
            <p><b>Reviewer: </b>{{services[id].reviewer}}</p>
            <p><b>Comments</b><br>{{services[id].comments}}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`;
            let rPieces = /^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/;
            let pieces = window.location.pathname.match(rPieces);
            let courseId = parseInt(pieces[1]);
            let studentId = parseInt(pieces[3]);
            let assignmentId = parseInt(pieces[2]);
            $.get("/api/v1/courses/" + courseId + "/assignments/" + assignmentId, function (data) {
              if (data.description.includes("btech-services-modal")) {
                let rURL = /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/
                if (rURL.test(window.location.pathname)) {
                  $("div.submission-details-frame iframe").hide();
                  $("div.submission-details-frame").append(vueString);
                  let APP = new Vue({
                    el: '#app-services',
                    data: function () {
                      return {
                        menu: 'review',
                        menus: [
                          'review',
                          'completed',
                          'rejected',
                          'progress'
                        ],
                        loading: true,
                        courseid: 0,
                        assignmetnId: 0,
                        studentId: 0,
                        comments: [],
                        services: {},
                        pendingServices: [],
                        completedServices: [],
                        rejectedServices: [],
                        criteria: {},
                        selectedCompletedCriterion: '',
                        selectedRejectedCriterion: '',
                        reviewerComment: ''
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
                      curService: function () {
                        return this.services[this.pendingServices[0]]
                      }
                    },
                    methods: {
                      createComment(id, type, service, comment) {
                        let text = `
ID: ` + id + `
TYPE: ` + type + `
SERVICE: ` + service + `
COMMENT: ` + comment + `
`;
                        return text;
                      },
                      async confirmCurrentService() {
                        let service = this.services[this.pendingServices[0]];
                        this.loading = true;
                        let url = "/api/v1/courses/" + this.courseId + "/assignments/" + this.assignmentId + "/submissions/" + this.studentId;
                        this.criteria[service.service].points_current += 1;
                        let rubricData = {};
                        for (var key in this.criteria) {
                          rubricData[this.criteria[key].id] = {
                            points: this.criteria[key].points_current
                          };
                        }
                        console.log(url);
                        await $.put(url, {
                          comment: {
                            text_comment: this.createComment(service.id, 'confirm', service.service, "")
                          },
                          rubric_assessment: rubricData
                        });
                        this.completedServices.push(this.pendingServices[0]);
                        this.pendingServices.shift();
                        location.reload(true);
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
                            criterion.points_current = 0;
                            criteria[criterion.description] = criterion;
                          }
                        });
                        return criteria;
                      },
                      processComments(canvasCommentsData) {
                        let pendingServicesCheck = [];
                        this.completedServices = [];
                        this.rejectedServices = [];
                        this.pendingServices = [];
                        this.services = {};
                        for (let c = 0; c < canvasCommentsData.length; c++) {
                          let comment = canvasCommentsData[c].comment;
                          let cId = this.getCommentData(comment, "ID");
                          if (cId !== "") {
                            let cType = this.getCommentData(comment, "TYPE");
                            let cService = this.getCommentData(comment, "SERVICE");
                            let cComment = this.getCommentData(comment, "COMMENT");
                            let cCommenter = canvasCommentsData[c].author.display_name;
                            //Check if it's a student comment or a teacher confirmation
                            if (cType === "submission") {
                              this.services[cId] = {
                                id: cId,
                                service: cService,
                                comment: cComment,
                                date: new Date(comment.created_at),
                                canvas_data: canvasCommentsData[c],
                                reviewer: ''
                              };
                              pendingServicesCheck.push(cId);
                            } else if (cType === "confirm") {
                              this.criteria[cService].points_current += 1;
                              this.services[cId].reviewer = cCommenter;
                              if (!this.completedServices.includes(cId)) {
                                this.completedServices.push(cId);
                              }
                            } else if (cType === "reject") {
                              if (!this.rejectedServices.includes(cId)) {
                                this.rejectedServices.push(cId);
                              }
                            }
                          }
                        }
                        for (let i = 0; i < pendingServicesCheck.length; i++) {
                          let pendingServiceId = pendingServicesCheck[i];
                          if (!this.completedServices.includes(pendingServiceId)) {
                            this.pendingServices.push(pendingServiceId);
                          }
                        }
                      },
                    },
                  });
                }
              }
            });
          }
        }
      }

      //SUBMISSION VIEW
    } else if (/^\/courses\/[0-9]+\/assignments\/[0-9]+/.test(window.location.pathname)) {
      //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
      IMPORTED_FEATURE = {
        initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
        _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
          $("#btech-services-modal").empty();
          $("#btech-services-modal").append("<div id='btech-services-dropdown'></div><div id='btech-services-submit'>Submit</div>");
          let dropdownContainer = $('#btech-services-dropdown');
          dropdownContainer.empty();
          dropdownContainer.append(`
<select></select>
`);
          let select = dropdownContainer.find('select');
          $("#rubrics table.rubric_table tr.criterion").each(function () {
            if ($(this).attr('id') !== 'criterion_blank') {
              let title = $(this).find("td.criterion_description div.description_content span.description_title").text();
              select.append(`<option value="` + title + `">` + title + `</option>`);
            }
          });
          $("#btech-services-submit").css({
            background: '#D00004',
            cursor: 'pointer',
            align: 'center',
            'text-align': 'center',
            width: '150px',
            'border-radius': '2px',
            'color': '#FFFFFF'
          });
          $("#btech-services-submit").click(function () {
            let id = Math.floor(Date.now() / 1000);
            let comment = "ID: " + id + "\nTYPE: submission\nSERVICE: " + select.val();
            let url = "/api/v1/courses/" + ENV.COURSE_ID + "/assignments/" + ENV.ASSIGNMENT_ID + "/submissions/" + ENV.current_user_id;
            $.put(url, {
              comment: {
                text_comment: comment
              }
            });
            $("#btech-services-modal").empty();
            $("#btech-services-modal").append(`
<p>Thank you! Your instructor will review your submission and update your grade.</p>
`);
          });
        },
      }
    }
  })();