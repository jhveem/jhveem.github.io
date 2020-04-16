async function getEditor() {
  console.log(window.tinymce);
  if (window.tinymce === undefined) {
    await delay(500);
    return getEditor();
  } else {
    var editor;
    if (editors.wiki_page_body !== undefined) editor = editors.wiki_page_body;
    else if (editors.assignment_description !== undefined) editor = editors.assignment_description;
    return editor;
  }
}
async function hideOnHover() {
  let editor = await getEditor();
  let selection = editor.selection;
  editor.execCommand("mceReplaceContent", false, "<span class='btech-hover-show'><i>{$selection}</i></span>");
}

function exampleBox() {
  let editor = await getEditor();
  let selection = editor.selection;
  editor.execCommand("mceReplaceContent", false, `<table class="btech-example-table" style="width: 90%; border-collapse: collapse; border-color: gray; margin-left: auto; margin-right: auto; height: 62px;" border="0" cellpadding="10">
<tbody>
<tr style="background-color: #d22232;">
<td style="width: 2.5%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;</span></strong></span></td>
<td style="width: 95%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;Example</span></strong></span></td>
<td style="width: 2.5%; height: 32px;"><span style="font-size: 14pt;"><strong><span style="color: #ffffff;">&nbsp;</span></strong></span></td>
</tr>
<tr style="height: 30px;">
<td style="width: 1.72752%; height: 30px;"><span>&nbsp;</span></td>
<td style="width: 95.1494%; height: 30px;">
{$selection}
</td>
<td style="width: 2.77243%; height: 30px;"><span>&nbsp;</span></td>
</tr>
</tbody>
</table>`);
}
async function addButton(name, func) {
  let topPart = await getElement(".mce-top-part");
  let button = $("<a class='btn' style='padding: 5px; background-color: #EEE; border: 1px solid #AAA; cursor: pointer;'>" + name + "</a>");
  button.click(func);
  topPart.after(button);
}
async function _init() {
  let editor = await getEditor();
  editor.addShortcut("ctrl+alt+h", "The highlighted font will be hidden until the reader highlights it.", hideOnHover);
  editor.addShortcut("ctrl+alt+e", "the highlighted font will be put inside of an emphasis box.", exampleBox);
  addButton("Hover Text", hideOnHover);
  addButton("Example Box", exampleBox);
}
if (window.location.pathname.includes("edit")) _init();