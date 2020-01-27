//SPEED GRADER
if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  var attempts = 0;
  async function insertAttemptsData() {
    $(".save_rubric_button").on("click", function() {
      attempts = 0;
      let elements = await getElement("div.comment span.comment, tr.comments");
      elements.each(function() {
          let checkAttempt = $(this).html().includes("RUBRIC");
          if (checkAttempt) {
              attempts += 1;
          }
      });
      calcAttemptsData();
      attempts += 1;
    });
    let details = await getElement("#submission_details");
    details.after(
      `<div id="btech-attempts-data" class="content_box">
      <div id="btech-recorded-attempts"><b>Recorded Attempts:</b> <span id="btech-recorded-attempts-value"></span></div>
      <div id="btech-rubric-score"><b>Rubric Score:</b> <span id="btech-rubric-score-value"></span></div>
      <div id="btech-suggested-score"><b>Suggested Score:</b> <span id="btech-suggested-score-value"></span></div>
      </div>`);
    calcAttemptsData();
  }

  async function calcAttemptsData() {
    let rubricTotal = $("[data-selenium='rubric_total']").text();
    rubricTotal = parseInt(rubricTotal.match(/([0-9]+)/)[1]);
    let suggestedScore = Math.round(rubricTotal * ((10 - attempts) / 10));
    $("#btech-recorded-attempts-value").text(attempts);
    $("#btech-rubric-score-value").text(rubricTotal);
    $("#btech-suggested-score-value").text(suggestedScore);
  }

  insertAttemptsData();
}