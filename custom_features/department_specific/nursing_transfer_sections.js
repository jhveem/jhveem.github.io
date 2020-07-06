let div = $("<div></div>");
$(".roster-tab").prepend(div);
let sectionSelector = $("<select><option selected disabled>-Section to Transfer-</option></select>");
let courseSelector = $("<input type='text' placeholder='Enter Course Id'>");
let submit = $("<a href='#' class='btn btn-primary' role='button' style='float: right;'>Transfer</a>");
let sectionData = {};
div.append(sectionSelector);
div.append(courseSelector);
div.append(submit);
div.append("<br>");
submit.click(function () {
  let section = sectionData[sectionSelector.val()];
  let courseId = courseSelector.val();
  for (let s = 0; s < section.students.length; s++) {
    let student = section.students[s];
    $.post("/api/v1/courses/" + courseId + "/enrollments", {
      enrollment: {
        user_id: student.id,
        type: "StudentEnrollment"
      }
    });
  }
});
let sections = $.get("/api/v1/courses/511568/sections?include[]=students").done(function (data) {
  for (let s = 0; s < data.length; s++) {
    let section = data[s];
    console.log(section);
    let option = $("<option value='" + section.id + "'>" + section.name + "</option>");
    sectionData[section.id] = section;
    sectionSelector.append(option);
  }
});