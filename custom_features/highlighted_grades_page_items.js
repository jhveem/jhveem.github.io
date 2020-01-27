if (/^\/courses\/[0-9]+\/grades\/[0-9]+$/.test(window.location.pathname)) {
  let highlightColor = "#FFC";
  $("tr.student_assignment").each(function() {
      let context = $(this).find("div.context").text();
      let grade = parseFloat($(this).find("span.grade").text().trim());
      let total = parseFloat($(this).find("td.points_possible").text().trim());
      if (!isNaN(grade) && !isNaN(total)) {
          let percent = (grade / total);
          if (context === "Quizzes" && percent < .8) {
              $(this).css("background-color", highlightColor);
          }
          if (context === "Tests" && percent < .8) {
              $(this).css("background-color", highlightColor);
          }
          if (context === "Skills Pass-off" && percent === 0) {
              $(this).css("background-color", highlightColor);
          }
      }
  });
}