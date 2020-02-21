(function() {
  IMPORTED_FEATURE = {};
  if (/^\/courses\/[0-9]+\/grades\/[0-9]+/.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
      courseId: 0,
      studentId: 0,
      hoursInput: null,
      hoursButton: null,
      async getColumnId() {
          let feature = this;
          var columnId = 0;
          await $.get("/api/v1/courses/" + feature.courseId + "/custom_gradebook_columns?include_hidden=true", function(data) {
              for (let i = 0; i < data.length; i++) {
                  if (data[i]["title"] === "Hours") {
                      columnId = data[i]["id"];
                      break;
                  }
              }
          });
          if (columnId == 0) {
              await $.post("/api/v1/courses/"+feature.courseId+"/custom_gradebook_columns?column[title]=Hours&column[hidden]=true", function(data) {
                  columnId = data.id;
              });
          }
          return columnId;
      },
      async _init() {
          window.STUDENT_HOURS = 2;
          let feature = this;
          feature.courseId = ENV.courses_with_grades[0].id;
          console.log(feature.courseId);
          feature.studentId = ENV.students[0].id;
          let wrapper = await getElement("#btech-submissions-between-dates-module");
          let element = wrapper.find("#btech-student-hours");
          element.append(`
    <div id='btech-add-hours-button'>
    <button>Add Hours</button>
    </div>
    <div id='btech-select-hours' style='display: flex; flex-direction: row;'>
    <span>Daily Hours: </span><input style="height:10px; width:44px;" type="number" step=".5" id="btech-student-hours-input" min="1" max="10"/>
    </div>
    `);
          feature.hoursInputHolder = $("#btech-select-hours");
          feature.hoursInput = $("#btech-student-hours-input");
          feature.hoursButton = $("#btech-add-hours-button");

          feature.hoursButton.on("click", function() {
              feature.hoursInputHolder.show();
              feature.hoursButton.hide();
          });

          feature.hoursInputHolder.hide();
          feature.hoursButton.hide();

          feature.hoursInput.on("change", function() {
              let hours = $(this).val();
              window.STUDENT_HOURS = hours;
              let url = "/api/v1/courses/" + feature.courseId + "/custom_gradebook_columns/" + columnId + "/data/" + feature.studentId;
              $.put(url + "?column_data[content]="+hours);
          });
          let columnId = await feature.getColumnId();
          let url = "/api/v1/courses/" + feature.courseId + "/custom_gradebook_columns/" + columnId + "/data";
          await $.get(url, function(data) {
              for (let i = 0; i < data.length; i++) {
                  let _id = data[i]["user_id"];
                  let _val = parseInt(data[i]["content"]);
                  if (parseInt(_id) === parseInt(feature.studentId)) {
                      window.STUDENT_HOURS = _val;
                      feature.hoursInput.val(_val);
                  }
              }
          });
          if (window.STUDENT_HOURS === 0) {
              feature.hoursInputHolder.hide();
              feature.hoursButton.show();
          } else {
              feature.hoursInputHolder.show();
              feature.hoursButton.hide();
          }
      }
    }
  }
})(); 