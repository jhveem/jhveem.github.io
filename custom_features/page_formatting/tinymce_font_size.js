async function getEditor() {
  if (window.tinymce === undefined) {
    await delay(500);
    return getEditor();
  } else {
    return tinymce.activeEditor;
  }
}
async function _init() {
  let editor = await getEditor();
  editor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML + "h2 {font-size: 24px; font-weight: bold;} h3 {font-size: 18px; font-weight: bold;} h4 {font-size: 16px; font-weight: bold;}";
}
_init();