function genRubricComment(course, assignment, user, rowSelector, rubricSelector, offset=1) {
  let comment = "";
  let header = "<h2><b>RUBRIC</b></h2>";
  let rows = $(rowSelector).find("tr");
  let totalMax = 0;
  let totalCrit = 0;
  header += ($(rows[rows.length - offset]).text().trim() + "%0A");
  $(rubricSelector).find("tr.rubric-criterion").each(function(index) {
    let description = $(this).find("th.description-header").find("div.description").text();
    let points_val = $(this).find("td.criterion_points").find("div.graded-points").find("input").val();
    let points = $(this).find("td.criterion_points").find("div.graded-points").text();
    points = points.replace("/", "").replace(" pts", "").replace("Points", "");
    totalCrit += 1;
    points = ("" + points).trim();
    points_val = ("" + points_val).trim();
    if (points === points_val) {
      totalMax += 1;
    }
    description = description.replace("This criterion is linked to a Learning Outcome", "");
    comment += (description + "%0A" + points_val + "/" + points + "%0A");
  });
  header += ("TOTAL CRITERIA AT FULL POINTS: %0A" + totalMax + "/" + totalCrit);
  comment = header + '%0A<div class="btech-comment-collapse">%0A' + comment + '%0A</div>';
  $.put("/api/v1/courses/"+course+"/assignments/"+assignment+"/submissions/"+user+"?comment[text_comment]="+comment,{} );
}

if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  let course = parseInt(ENV.course_id);
  $(".save_rubric_button").on("click", function() {
    let user = ENV.RUBRIC_ASSESSMENT.assessment_user_id;
    let assignment = ENV.assignment_id;
    genRubricComment(course, assignment, user, "div#rubric_full", "div#rubric_full", 2);
    /*
    let comment = "-RUBRIC-%0A";
    let rows = $("div#rubric_full").find("tr");
    comment += ($(rows[rows.length - 2]).text().trim() + "%0A%0A");
    $("div#rubric_full").find("tr.rubric-criterion").each(function(index) {
      let description = $(this).find("th.description-header").find("div.description").text();
      let points_val = $(this).find("td.criterion_points").find("div.graded-points").find("input").val();
      let points = $(this).find("td.criterion_points").find("div.graded-points").text();
      description = description.replace("This criterion is linked to a Learning Outcome", "");
      comment += (description + "%0A" + points_val + points.replace("Points", "") + "%0A%0A");
    });
    $.put("https://btech.beta.instructure.com/api/v1/courses/"+ENV.course_id+"/assignments/"+ENV.assignment_id+"/submissions/"+ENV.RUBRIC_ASSESSMENT.assessment_user_id+"?comment[text_comment]="+comment,{} );
    */
  });
}

if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
  let pieces = window.location.pathname.match(/^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/);
  let course = parseInt(pieces[1]);
  let assignment = parseInt(pieces[2]);
  let user = parseInt(pieces[3]);
  $(".save_rubric_button").on("click", function() {
    genRubricComment(course, assignment, user, "div.react-rubric table", "div.react-rubric");
  });
}