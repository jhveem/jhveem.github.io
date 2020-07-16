(async function () {
  imageOptions = [
    'btech-image-map'
  ];
  //escape if not on the editor page
  if (!TOOLBAR.checkEditorPage()) return;
  async function addClassToImage(className) {
    //get the currently selected node
    let node = tinyMCE.activeEditor.selection.getNode();
    //get the parent
    let parent = tinyMCE.activeEditor.dom.getParent(node, "img");
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
    return parent;
  }

  function resetImageButtons() {
    let node = tinyMCE.activeEditor.selection.getNode();
    let parent = tinyMCE.activeEditor.dom.getParent(node, "img");
    $('.btech-image-edit-button').each(function () {
      $(this).css({
        'background-color': '#eee',
        'color': '#000'
      });
      let className = $(this).attr('id').replace("-button", "");
      if (parent !== null) {
        if ($(parent).hasClass(className)) {
          let bgColor = getComputedStyle(document.documentElement, null).getPropertyValue("--ic-brand-button--secondary-bgd-darkened-5");
          $(this).css({
            'background-color': bgColor,
            'color': '#fff'
          });
        }
      }
    });
  }

  function imageMapCreate() {
    let img = addClassToImage("btech-image-map-image");
    $(img).after("<table><tbody><tr><td>TEST</td></tr></tbody></table>");
  }

  await TOOLBAR.checkReady();
  TOOLBAR.addButtonIcon("far fa-star", "Convert an image to an Image Map.", imageMapCreate);

  //whenever you click in the editor, see if it's selected a table with one of the classes
  tinymce.activeEditor.on("click", function () {
    resetImageButtons();
  });
})();
/*  add in once you figure out what to do with this
let img = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-image")[0]);
let table = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-table")[0]);
let container = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-container")[0]);
container.css({
  'position': 'relative'
});
img.click(function (e) {
  var offset = $(this).offset();
  let width = $(this).width();
  let height = $(this).height();
  var relativeX = Math.round((e.pageX - offset.left) / width * 100);
  var relativeY = Math.round((e.pageY - offset.top) / height * 100);
  // let icon = $("<i class='icon-video' style='position: absolute;'></i>")
  let row = $("<tr><td>-INSERT VIDEO-</td><td>" + relativeX + "</td><td>" + relativeY + "</td></tr>");
  table.find("tbody").append(row)
});
*/