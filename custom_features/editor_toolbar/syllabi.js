(async function () {
  IMPORTED_FEATURE = {};
  //IF the editor, add the ability to add services
  if (TOOLBAR.checkEditorPage()) {
    await TOOLBAR.checkReady();

    TOOLBAR.addButtonIcon("far fa-table", "Insert a table which is linked to the courses Grading Scheme", async function () {
      let editor = TOOLBAR.editor;
      editor.execCommand("mceInsertContent", false, `
        <p class="btech-grading-scheme" style="border: 1px solid black;">This will be replaced by a table populated with the course Grading Scheme.</p>
      `);
    });

    TOOLBAR.addButtonIcon("far fa-table", "Insert a table which is linked to the courses Assignment Groups", async function () {
      let editor = TOOLBAR.editor;
      editor.execCommand("mceInsertContent", false, `
        <p class="btech-assignment-groups" style="border: 1px solid black;">This will be replaced by a table populated with the course Assignment Groups.</p>
      `);
    });
  }

  //GRADING VIEW
  //This one has to come first so it doesn't have the submission view run on the grading page
  let schemeDiv = $(".btech-grading-scheme");
  if (schemeDiv.length > 0) {
    let table = $("<table></table>");
    schemeDiv.each(function () {
      $(this).removeAttr("style");
      $(this).empty();
      $(this).html("Loading...");
    });
    let rows = [];
    $.get("/api/v1/courses/" + CURRENT_COURSE_ID + "/grading_standards").done(function (data) {
      schemeDiv.each(function () {
        $(this).empty();
      });
      if (data.length > 0) {
        let header = $("<tr><th style='border: 1px solid black; padding: 4px 8px;'>Rating</th><th style='border: 1px solid black; padding: 4px 8px;'>Percent</th></tr>")
        table.append(header);
        //It's possible that there can be more than one grading standard, in which case I'll have to figure out how to find the set one or current one
        let canvasData = data[0];
        let pCells = [];
        for (let s = 0; s < canvasData.grading_scheme.length; s++) {
          let line = canvasData.grading_scheme[s];
          let value = "";
          let row = $("<tr></tr>");
          let names = line.name.split("/");
          for (let i = 0; i < names.length; i++) {
            let name = names[i].trim();
            let cell = $("<td style='border: 1px solid black; padding: 4px 8px;' rowspan='1'>" + name + "</td>");
            if (s === 0) {
              row.append(cell);
            } else {
              let pCell = pCells[i];
              let pName = $(pCell).text().trim();
              if (pName === name) {
                let numRows = parseInt($(pCell).attr('rowspan'));
                $(pCell).attr('rowspan', numRows + 1);
              } else {
                pCells[i] = cell;
                row.append(cell);
              }
            }
          }

          if (s == 0) {
            let tds = row.find("td");
            $(header.find("th")[0]).attr("colspan", names.length);
            for (let i = 0; i < tds.length; i++) {
              pCells[i] = tds[i];
            }
            value = "100% - " + (line.value * 100) + "%";
          } else {
            value = (line.value * 100) + "% - " + (canvasData.grading_scheme[s - 1].value * 100) + "%";
          }
          row.append("<td style='border: 1px solid black; padding: 4px 8px;'>" + value + "</td>");
          rows.push(row);
          table.append(row);
        }
        schemeDiv.each(function () {
          $(this).empty();
          //needs to be cloned or it just keeps moving the table down an element
          $(this).append(table.clone());
          //may want to then remove the original table so it's not taking up space
        });
      }
    });
  }

  let groupDiv = $(".btech-assignment-groups");
  if (groupDiv.length > 0) {
    groupDiv.removeAttr("style");
    groupDiv.empty();
    $.get("/api/v1/courses/" + CURRENT_COURSE_ID + "/assignment_groups").done(function (data) {
      let table = $("<table></table>");
      groupDiv.append(table);
      table.append("<tr><th style='border: 1px solid black; padding: 4px 8px;'>Type</th><th style='border: 1px solid black; padding: 4px 8px;'>Weight</th></tr>");
      for (let i = 0; i < data.length; i++) {
        let group = data[i];
        if (group.group_weight > 0) {
          table.append("<tr><td style='border: 1px solid black; padding: 4px 8px;'>" + group.name + "</td><td style='border: 1px solid black; padding: 4px 8px;'>" + (group.group_weight) + "%</td>");
        }
      }
    });
  }
})();