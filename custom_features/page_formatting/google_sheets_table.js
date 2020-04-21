async function getEditor() {
  if (window.tinymce === undefined) {
    await delay(500);
    return getEditor();
  } else {
    var editors = window.tinymce.editors;
    var editor = editors[0];
    // if (editors.wiki_page_body !== undefined) editor = editors.wiki_page_body;
    // else if (editors.assignment_description !== undefined) editor = editors.assignment_description;
    return editor;
  }
}
async function _init() {
    let isEditing = window.location.pathname.includes("/edit");
    if (isEditing) {
        var editor = await getEditor();
        let topPart = await getElement(".mce-top-part");
        topPart.append("<div id='btech-link-to-sheet-container'></div>");
        let customButtonsContainer = $("#btech-link-to-sheet-container");
        let button = $("<a class='btn' style='padding: 5px; background-color: #EEE; border: 1px solid #AAA; cursor: pointer;'>Sheet Table</a>");
        customButtonsContainer.append(button);
        customButtonsContainer.append(button);
        button.click(function() {
            $("body").append(`
<div id="google-sheet-id-container-bg" style="position:fixed; background-color: rgba(0, 0, 0, 0.5); width: 100%; height: 100%; left: 0; top: 0; z-index:1000;">
<div id='google-sheet-id-container' style='
width: 500px;
left: 50%;
transform: translate(-50%, -50%);
position:fixed;
top: 50%;
z-index:1000;
transition: 0.5s;
background-color: #FFF;
border: 2px solid #888;
padding: 10px 20px;
color: #000;
border-radius: 5px;'>
Enter Google Sheet Id<br><input style='width: 100%;' type="text" id="google-sheet-id">
</div>
</div>`);
            $("#google-sheet-id-container-bg").click(function() {
                $(this).remove();
            }).children().click(function(e) {
                return false;
            });;
            $("#google-sheet-id").keypress(function(event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    //*
                    editor.execCommand("mceReplaceContent", false, `
<table class="google-sheet-based sheet-`+$(this).val()+`">
<tbody>
<tr>
<td>
{$selection}
</td>
</tr>
</tbody>
</table>`);
//*/
                    $("#google-sheet-id-container-bg").remove();
                }
                event.stopPropagation();
            });
        });
        customButtonsContainer.append(button);
    }
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
            } catch (e) {
            }
        }
        var url = "https://script.google.com/macros/s/AKfycbzhlxe1absfbAV8-jtLIqOhy_qFcfAa2igje1FHJQYMNSRGNuUs/exec?sheetId=" + sheetId;
        var request = jQuery.ajax({
            crossDomain: true,
            url: url,
            method: "GET",
            dataType: "jsonp"
        }).done(function(res) {
            console.log(res);
            let rows = table.find("tr");
            rows.each(function() {
                let row = $(this);
                let materialNameCell = $(row.find('td')[0]);
                materialNameCell.css({
                    "width": ""
                });
                let materialName = materialNameCell.text().toLowerCase().trim();
                console.log(materialName);
                console.log(res.data[materialName]);
                let materialData = res.data[materialName];
                for (let k = 0; k < Object.keys(materialData).length; k++) {
                    let key = Object.keys(materialData)[k];
                    if (key === "#url#") {
                        materialNameCell.wrapInner("<a href='"+materialData[key]+"' target='#'></a>")
                    } else if (key === "#image#") {
                        row.append("<td><img style='max-height: 200px; max-width: 200px;' src='" + materialData[key] + "'></td>");
                    } else {
                        row.append("<td><p><strong>"+ key + "</strong></p><p>" + materialData[key] + "</p></td>");
                    }
                }
            });
            console.log(res);
        });
    }
}
_init();