async function _init() {
  console.log("GET STUFF");
  let isEditing = window.location.pathname.includes("/edit");
  if (!isEditing) {
    var sheetId = '';
    let table = $(".google-sheet-based");
    table.css({
      "layout": "auto",
    });
    let classes = table.attr('class').split(/\s+/);
    for (var c = 0; c < classes.length; c++) {
      try {
        sheetId = classes[c].match(/^sheet\-(.*)/)[1];
      } catch (e) {}
    }
    var url = "https://script.google.com/macros/s/AKfycbzhlxe1absfbAV8-jtLIqOhy_qFcfAa2igje1FHJQYMNSRGNuUs/exec?sheetId=" + sheetId;
    var request = jQuery.ajax({
      crossDomain: true,
      url: url,
      method: "GET",
      dataType: "jsonp"
    }).done(function (res) {
      let rows = table.find("tr");
      rows.each(function () {
        let row = $(this);
        let materialNameCell = $(row.find('td')[0]);
        materialNameCell.css({
          "width": ""
        });
        let materialName = materialNameCell.text().toLowerCase().trim();
        if (materialName in res.data) {
          let materialData = res.data[materialName];
          for (let k = 0; k < Object.keys(materialData).length; k++) {
            let key = Object.keys(materialData)[k];
            let header = key;
            let rCSS = /(.+)(\{.+\})/;
            let text = key.match(rCSS);
            let css = {};
            if (text !== null) {
              header = text[1];
              css = JSON.parse(text[2]);

            }
            if (key === "#url#") {
              let aTag = $("<a href='" + materialData[key] + "' target='#'></a>");
              aTag.css(css);
              materialNameCell.wrapInner(aTag);
            } else if (key.includes("#image#")) {
              let title = header.replace("#image#", "").trim();
              if (Object.keys(css).length === 0) {
                css = {
                  'max-height': '200px',
                  'max-width': '200px'
                }
              }
              let imgTag = $("<img src='" + materialData[key] + "'></img>");
              let tdTag = $("<td></td>");
              tdTag.append("<strong>"+title+"</strong>")
              tdTag.append(imgTag);
              imgTag.css(css);
              row.append(tdTag);
            } else {
              let tdTag = $("<td></td>");
              tdTag.append("<p><strong>" + header + "</strong></p>")
              let pTag = $("<p>" + materialData[key] + "</p>");
              pTag.css(css);
              tdTag.append(pTag);
              row.append(tdTag);
            }
          }
        }
      });
    });
  }
}
_init();