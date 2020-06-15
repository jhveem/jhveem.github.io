(async function () {
  //https://btech.instructure.com/courses/420675/assignments/4484718
  function hashId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      let chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  function addHidden(inputId, value) {
    form.append(`<input type="hidden" name="entry.` + inputId + `" value="` + value + `">`);
  }

  function addTextEntry(inputId, description) {
    form.append(`
<p>` + description + `<br>
<input type="text" name="entry.` + inputId + `" value="">
</p>
`)
  }

  function addDropdown(inputId, description, list) {
    let input = $(`<p>` + description + `</p>`);
    let bodyRows = "";
    let select = $(`
<select name='entry.` + inputId + `'>
<option value="" disabled selected>Select your option</option>
</select>
`);
    for (var i = 0; i < list.length; i++) {
      select.append(`<option value="` + list[i] + `">` + list[i] + `</option>`);
    }
    input.append("<br>");
    input.append(select);
    form.append(input);
  }

  function addButtons(inputId, description, list = [1, 2, 3, 4, "N/A"]) {
    let buttonWidth = (100 - 20) / list.length;
    let headingRows = "";
    let bodyRows = "";
    for (var i = 0; i < list.length; i++) {
      headingRows += `<td style="width:` + buttonWidth + `%;text-align:center;"><label>` + list[i] + `</label></td>`;
      bodyRows += `
<td style="width:` + buttonWidth + `%;text-align:center;color:#666;border-bottom:1px solid #d3d8d3;padding:0">
<label style="display:block">
<div style="padding:.5em .25em"><input type="radio" name="entry.` + inputId + `" value="` + list[i] + `" role="radio" aria-label="` + list[i] + `"></div>
</label>
</td>`;
    }
    form.append(`
<p>` + description + `</p>

<table border="0" cellpadding="5" cellspacing="0">
<thead>
<tr>
<td>
</td>` +
      headingRows +
      `</tr>
</thead>
<tbody>
<tr role="radiogroup" aria-label="" aria-describedby="1978569583_errorMessage"
style="text-align:center;color:#666;border-bottom:1px solid #d3d8d3;padding:0;background-color:#f2f2f2">
<td
style="text-align:left;color:#666;border-bottom:1px solid #d3d8d3;padding:0;min-width:100px;max-width:200px;padding-left:15px">
</td>
` + bodyRows + `
</tr>
</tbody>
</table>
`);
  }

  function addSubmitButton() {
    form.append('<br><br><input type="submit" name="submit" value="Submit" id="m_8914134288611702631ss-submit">');
  }

  let form = $(`
<form
action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSffvo5Uap6vY_DFz8x9nv7Evo7OnczEOtJXqWyzLNBnlmOhZQ/formResponse"
method="POST" id="m_8914134288611702631ss-form" target="_blank">
</form>
`);
  let courseId = ENV.COURSE_ID;
  let userId = ENV.current_user.id;
  $(".btech-survey").append(form);
  let instructors = [];
  await $.get("/api/v1/courses/" + courseId + "/enrollments?type[]=TeacherEnrollment&type[]=TaEnrollment").done(function (data) {
    for (let i = 0; i < data.length; i++) {
      let enrollment = data[i];
      instructors.push(enrollment.user.name);
    }
  });

  addHidden(1336315446, CURRENT_COURSE_ID); //course
  addHidden(772076137, hashId(userId)); //user id
  addHidden(1711798596, CURRENT_DEPARTMENT_ID); //department id
  addDropdown(1997963883, "Enter the name of your instructor.", instructors);
  addButtons(1299309651, "This instructor promoted a learning atmosphere that was engaging, encouraging, and motivating.");
  addButtons(223900859, "This instructor provided learning experiences that gave me an opportunity to answer questions and solve real-world problems.");
  addButtons(384524980, "This instructor answered questions clearly and understandably.");
  addButtons(1541617763, "This instructor responded within 24 hours to communication attempts and provided appropriate feedback on progress.");
  addButtons(208869566, "This instructor was organized, prepared, and knowledgeable.");
  addSubmitButton();
})();