async function addButton(name, func) {
  let topPart = await getElement(".mce-top-part");
  let button = $("<a class='btn' style='padding: 5px; background-color: #EEE; border: 1px solid #AAA; cursor: pointer;'>"+name+"</a>");
  button.click(func);
  topPart.after(button);
}
async function _init() {
  await getEditor();
  window.tinymce.editors.wiki_page_body.addButton('customButtonHideOnHover', {
      text: 'My Button',
      onAction: hideOnHover
  });
  window.tinymce.editors.wiki_page_body.addShortcut("ctrl+shift+h", "description", hideOnHover);
  addButton("HIDE ON HOVER", hideOnHover);
  addButton("EXAMPLE BOX", exampleBox);
}
if (window.location.pathname.includes("edit")) _init();