  (function () {
    IMPORTED_FEATURE = {};
    if (/^\/courses\/[0-9]+\/assignments\/[0-9]+/.test(window.location.pathname)) {
      //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
      IMPORTED_FEATURE = {
        initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
        _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
          console.log("Esthetics Services");
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
              select.append(`<option value="` + title.replace(' ', '-') + `">` + title + `</option>`);
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
            let comment = "ID: " + id + "\nSERVICE: " + select.val();
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
          //THIS IS TkHE NAME OF THE FUNCTION CALLED FROM feature() ON THE custom_canvas.js PAGE
        },
        //WHATEVER ELSE YOU WANT OT ADD IN. IT'S JUST A JAVASCRIPT OBJECT
      }
    }
  })();
