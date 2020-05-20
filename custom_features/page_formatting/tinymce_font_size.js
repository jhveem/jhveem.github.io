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
  //divides by .75 because of some weird stuff going on in the editor.
  editor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML + "h2 {font-size: " + Math.round(18) + "px; font-weight: bold;} h3 {font-size: " + Math.round(14 / .75) + "px; font-weight: bold;} h4 {font-size: " + Math.round(12 / .75) + "px; font-weight: bold;}";
}
_init();