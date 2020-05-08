tableOptions = [
  'btech-tabs-table',
  'btech-dropdown-table'
];

async function getEditor() {
  if (window.tinymce === undefined) {
    await delay(500);
    return getEditor();
  } else {
    return tinymce.activeEditor;
  }
}
async function hideOnHover() {
  let editor = await getEditor();
  let selection = editor.selection;
  editor.execCommand("mceReplaceContent", false, "<span class='btech-hover-show'><i>{$selection}</i></span>");
}

async function hoverDefinition() {
  let editor = await getEditor();
  let selection = editor.selection;
  editor.execCommand("mceReplaceContent", false, "<strong class='tooltip'>{$selection}<span class='tooltiptext'>-DEFINITION-</span></strong>");
}

async function exampleBox() {
  let editor = await getEditor();
  let selection = editor.selection;
  let color = $("#btech-custom-editor-buttons-color").children("option:selected").val();
  editor.execCommand("mceReplaceContent", false, `<table class="btech-example-table" style="width: 90%; border-collapse: collapse; border-color: gray; margin-left: auto; margin-right: auto; height: 62px;" border="0" cellpadding="10">
<tbody>
<tr style="background-color: ` + color + `;">
<td style="width: 2.5%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;</span></strong></span></td>
<td style="width: 95%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;Title</span></strong></span></td>
<td style="width: 2.5%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;</span></strong></span></td>
</tr>
<tr style="height: 30px; background-color: #fff; color: #000;">
<td style="width: 1.72752%; height: 30px;"><span>&nbsp;</span></td>
<td style="width: 95.1494%; height: 30px;">
{$selection}
</td>
<td style="width: 2.77243%; height: 30px;"><span>&nbsp;</span></td>
</tr>
</tbody>
</table>`);
}

async function googleSheetsTable() {
  let editor = await getEditor();
  let selection = editor.selection;
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
  $("#google-sheet-id-container-bg").click(function () {
    $(this).remove();
  }).children().click(function (e) {
    return false;
  });;
  $("#google-sheet-id").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      //*
      editor.execCommand("mceReplaceContent", false, `
<table class="google-sheet-based sheet-` + $(this).val() + `">
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
}
async function addClassToTable(className) {
  //get the currently selected node
  let node = tinyMCE.activeEditor.selection.getNode();
  //get the parent
  let parent = tinyMCE.activeEditor.dom.getParent(node, "table");
  if (parent !== null) {
    //see if it's already got the class in question, if so remove it, otherwise remove all other classes and add that one
    if ($(parent).hasClass(className)) {
      tinyMCE.activeEditor.dom.removeClass(parent, className);
    } else {
      for (let i = 0; i < tableOptions.length; i++) {
        let _class = tableOptions[i];
        tinyMCE.activeEditor.dom.removeClass(parent, _class);
      }
      tinyMCE.activeEditor.dom.addClass(parent, className);
    }
  }
}

async function addButton(name, func, className = '') {
  let customButtonsContainer = $("#btech-custom-editor-buttons-container");
  let button = $("<a class='btn " + className + "' style='padding: 5px; background-color: #EEE; color: #000; border: 1px solid #AAA; cursor: pointer;'>" + name + "</a>");
  button.click(func);
  customButtonsContainer.append(button);
  return button;
}

function addColor(hex, name, fontColor="fff") {
  let colorPicker = $("#btech-custom-editor-buttons-color");
  colorPicker.append("<option value='#" + hex + "' style='background-color: #" + hex + "; color: #"+fontColor+"'>" + name + "</option>");
}

function resetTableButtons() {
  let node = tinyMCE.activeEditor.selection.getNode();
  let parent = tinyMCE.activeEditor.dom.getParent(node, "table");
  $('.btech-table-edit-button').each(function () {
    $(this).css({
      'background-color': '#eee',
      'color': '#000'
    });
    let className = $(this).attr('id').replace("-button", "");
    if (parent !== null) {
      if ($(parent).hasClass(className)) {
        let bgColor = getComputedStyle(document.documentElement,null).getPropertyValue("--ic-brand-button--secondary-bgd-darkened-5");
        $(this).css({
          'background-color': bgColor,
          'color': '#fff'
        });
      }
    }
  });
}
function addCustomThemeParent() {
  let body = tinyMCE.activeEditor.getBody();
  $(body).prepend(`
    <div id="btech-theme-parent" style="border: 1px solid #000; padding: 5px;">
      <span>
        This information will all be hidden on render. Just make sure that when applying changes you have selected the entire element. (triple click or drag select from the starting # to the ending #)
      </span>
      <br />
      <span class="btech-theme-header" style="background-color: #3366ff; color: #ffffff;">
        #HEADER STYLE# 
      </span>
      <br />
      <span class="btech-theme-header-hover" style="background-color: #000080; color: #ffffff;">
        #HEADER HOVER STYLE#
      </span>
    </div>
  `);
}
async function _init() {
  let editor = await getEditor();
  let topPart = null;
  if (tinymce.majorVersion === "4") {
    topPart = await getElement(".mce-top-part");
  } else if (tinymce.majorVersion === "5") {
    topPart = await getElement(".tox-toolbar-overlord");
  }
  if (topPart !== null && $("#btech-custom-editor-buttons-container").length === 0) {
    editor.addShortcut("ctrl+alt+h", "The highlighted font will be hidden until the reader highlights it.", hideOnHover);
    editor.addShortcut("ctrl+alt+e", "the highlighted font will be put inside of an emphasis box.", exampleBox);
    editor.addShortcut("ctrl+alt+d", "the highlighted font will display a definition on hover.", exampleBox);
    editor.addShortcut("ctrl+alt+g", "Insert a table that is linked to a google sheet.", googleSheetsTable);
    topPart.after("<div id='btech-custom-editor-buttons-container'></div>");
    let customButtonsContainer = $("#btech-custom-editor-buttons-container");
    customButtonsContainer.prepend("<select id='btech-custom-editor-buttons-color' name='colors'></select>")
    addColor("d22232", "Red");
    addColor("2232d2", "Blue");
    addColor("32A852", "Green");
    addColor("E2A208", "Gold");
    addColor("000", "Black");
    addColor("fff", "White", "000")
    addButton("Box", exampleBox);
    addButton("Hover Reveal", hideOnHover);
    addButton("Hover Text", hoverDefinition);
    addButton("Google Sheets Table", googleSheetsTable);
    addButton("Custom Theme", addCustomThemeParent);
    for (let i = 0; i < tableOptions.length; i++) {
      let className = tableOptions[i];
      let optionName = "Table->" + className.replace("btech-", "").replace("-table", "");
      let btn = await addButton(optionName, function () {
        addClassToTable(className);
        resetTableButtons();
      }, 'btech-table-edit-button');
      btn.attr('id', className + '-button');
    }
    //whenever you click in the editor, see if it's selected a table with one of the classes
    tinymce.activeEditor.on("click", function () {
      resetTableButtons();
    });
  }
}
if (window.location.pathname.includes("edit")) _init();