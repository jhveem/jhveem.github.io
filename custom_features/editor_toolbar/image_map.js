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