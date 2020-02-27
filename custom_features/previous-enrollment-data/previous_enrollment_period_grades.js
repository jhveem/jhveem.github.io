IMPORTED_FEATURE = {};
if (/^\/courses\/[0-9]+\/grades\/[0-9]+/.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
        initiated: false,
        courseId: null,
        studentId: null,
        studentAssignmentsData: [],
        hours: 90,
        async _init(params={}) {
            let feature = this;
            this.courseId = ENV.courses_with_grades[0].id;
            this.studentId = ENV.students[0].id;
            this.studentAssignmentsData = [];
            console.log(params.hours);
            if (params.hours !== undefined) {
              feature.hours = params.hours;
            }
            window.STUDENT_HOURS = 0;
            window.TOTAL_HOURS = 90;

            //grab the original grades and give it an id for future access
            $("table#grades_summary tbody").attr("id", "btech-original-grades-body");
            //create an empty table where we'll put the grades that were submitted in the specified grade period
            $("table#grades_summary").append("<tbody id='btech-enrollment-grades-body'></tbody>");

            //GET THE USERS ENROLLMENT DATE
            let url, data_obj;
            url = "/api/v1/courses/"+feature.courseId+"/search_users";
            data_obj = {
                include: ["enrollments"],
                user_ids: [feature.studentId],
                enrollment_state: ["active", "invited", "rejected", "completed", "inactive"]
            };
            let enrollmentData = [];
            await $.get(url, data_obj).then(function(data, status, xhr) {
                enrollmentData = enrollmentData.concat(data);
            });

            //SET THEIR DATE INFORMATION
            let enrollmentStartDate = new Date(enrollmentData[0].enrollments[0].updated_at);
            let dateStringEnrollment = enrollmentStartDate.getFullYear() + "-" + ("0" + (enrollmentStartDate.getMonth() + 1)).slice(-2) + "-" + ("0" + enrollmentStartDate.getDate()).slice(-2);
            let dateStringNow = new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2);
            //GET THE STUDENT'S SUBMISSIONS FOR THIS COURSE
            feature.studentAssignmentsData = await feature.getSubmissions();
            feature.createDateSelector(dateStringEnrollment, dateStringNow);

        },
        createDateSelector(dateStringEnrollment, dateStringNow) {
            let feature = this;
            $("#student-grades-right-content").append(
                `<div id="btech-submissions-between-dates-module">
                <br><br>
                <h2>Grade for Submissions Between Dates</h2> <p><b>Note:</b>Canvas only tracks the most recent submission, so regraded assignments will only be included in the date range for its most recent submission.</p>
                <div id="btech-student-hours">
                </div>
                <p>Start Date</p>
                <input type="date" id="btech-term-grade-start" name="term-start" value="` + dateStringEnrollment + `" min="2010-01-01" max="2020-12-31">
                <p>End Date</p>
                <input type="date" id="btech-term-grade-end" name="term-end" value="` + dateStringNow + `" min="2010-01-01" max="2020-12-31">
                <button class="Button" id="btech-term-grade-button">Estimate</button>
                <button class="Button" id="btech-term-reset-button">Reset</button>
                <p>Grade for term: <span id="btech-term-grade-value"></span></p>
                </div>`
            );
            $("#btech-term-grade-button").on("click", function() {
                let startDate = feature.parseDate($("#btech-term-grade-start").val());
                let endDate = feature.parseDate($("#btech-term-grade-end").val());
                feature.calcEnrollmentGrade(feature.studentAssignmentsData, startDate, endDate);
            });
            $("#btech-term-reset-button").on("click", function() {
                let originalBody = $("#btech-original-grades-body");
                originalBody.show();
                let newBody = $("#btech-enrollment-grades-body");
                newBody.empty();
                newBody.hide();
                $("#btech-term-grade-value").empty();
            });
        },
        async getSubmissions(page="1", submissions=[]) {
            let feature = this;
            let url = "/api/v1/courses/"+feature.courseId+"/students/submissions";
            let data_obj = {
                "per_page": 100,
                "page": page,
                "student_ids": [feature.studentId]
            };
            let nextPage = "";
            await $.get(url, data_obj, function(data, status, xhr) {
                //add assignments to the list
                submissions = submissions.concat(data);
                //see if there's another page to get
                let rNext = /<([^>]*)>; rel="next"/;
                let nextMatch = xhr.getResponseHeader("Link").match(rNext);
                if (nextMatch !== null) {
                    let next = nextMatch[1];
                    nextPage = next.match(/page=(.*?)&/)[1];
                }
            });
            if (nextPage !== "") {
                return await feature.getSubmissions(nextPage, submissions);
            }
            return submissions;
        },
        calcEnrollmentGrade(studentAssignmentsData, startDate, endDate) {
            //reset display of assigment elements
            let originalBody = $("#btech-original-grades-body");
            originalBody.hide();
            let newBody = $("#btech-enrollment-grades-body");
            newBody.empty();
            newBody.show();

            //figure out which assignments should be included
            let includedAssignments = [];
            for (let i = 0; i < studentAssignmentsData.length; i++) {
                let submission = studentAssignmentsData[i];
                let date = new Date(submission.graded_at);
                if (date >= startDate && date <= endDate) {
                    includedAssignments.push(submission.assignment_id);
                }
            }

            //Go through each assignment group and figure out the points value of the included assignments that are in those groups
            let assignmentGroups = ENV.assignment_groups;
            let finalScore = 0;
            let finalTotalScore = 0;
            //used for figuring out scores if using hours enrolled
            let finalPoints = 0;
            let finalPointsPossible = 0;
            //loop assignments
            for (let i = 0; i < assignmentGroups.length; i++) {
                let group = assignmentGroups[i];
                let score = 0;
                let total = 0;
                let assignments = group.assignments;
                for (let a = 0; a < assignments.length; a++) {
                    let assignment = assignments[a];
                    let id = parseInt(assignment.id);
                    let submissionElement = $("#submission_"+id);
                    finalPointsPossible += (assignment.points_possible * group.group_weight); //Total possible earned points in the course weighted by their type
                    if (includedAssignments.includes(id)) {
                        submissionElement.clone().appendTo(newBody);
                        let currentScoreString = submissionElement.find("td.assignment_score span.original_points").text().trim();
                        let parsedScore = parseFloat(currentScoreString);
                        if (!isNaN(parsedScore)) {
                          let curScore = parseFloat(currentScoreString);
                            score += curScore; 
                            finalPoints += (curScore * group.group_weight);
                            total += assignment.points_possible;
                        }
                    } else {
                        //console.log($("#submission_"+id).html());
                    }
                }
                if (total > 0) {
                    let groupPerc = (score / total);
                    finalTotalScore += group.group_weight;
                    finalScore += (groupPerc * group.group_weight);
                }
            }
            let outputScore = finalScore / finalTotalScore;
            let outputHours = '';
            if (isNaN(outputScore)) {
                outputScore = "N/A";
            } else {
                let gradingScheme = ENV.grading_scheme;
                let pointsPerHour = finalPointsPossible / 90;
                let hoursCompleted = finalPoints / pointsPerHour;
                outputHours = "<div>Hourse Completed: " + hoursCompleted.toFixed(2) + "</div>";
                if (window.STUDENT_HOURS > 0) {
                  //CHANGE THE OUTPUT SCORE TO BE BASED ON finalPoints AND finalPointsPossible
                  let reqHours = window.STUDENT_HOURS * 60;
                  outputHours+= "<div>Required Hours: " + reqHours + "</div>"
                  outputScore = hoursCompleted / reqHours;

                }
                let letterGrade = null;
                for (var g = 1; g < gradingScheme.length; g++) {
                    let max = gradingScheme[g-1][1];
                    let min = gradingScheme[g][1];
                    if (outputScore >= min && outputScore < max) {
                        letterGrade = gradingScheme[g][0];
                    }
                }
                outputScore = (outputScore * 100).toFixed(2) + "% (" + letterGrade + ")";
            }
            $("#btech-term-grade-value").html("<div>" + outputScore + "</div>" +  outputHours);
        },
        parseDate(dateString) {
            let pieces = dateString.split("-");
            let year = parseInt(pieces[0]);
            let month = parseInt(pieces[1] - 1);
            let day = parseInt(pieces[2]) + 1;
            let date = new Date(year, month, day);
            return date;
        }
    }
}