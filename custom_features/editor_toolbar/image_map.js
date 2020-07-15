let img = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-image")[0]);
let table = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-table")[0]);
let container = $(tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByClassName("btech-image-map-container")[0]);
container.css({'position': 'relative'});
img.click(function(e) {
var offset = $(this).offset();
        var relativeX = (e.pageX - offset.left);
        var relativeY = (e.pageY - offset.top);
        let icon = $("<i class='icon-video' style='position: absolute;'></i>")
        container.append(icon);
        let row = $("<tr><td>-INSERT VIDEO-</td><td>"+relativeX+"</td><td>"+relativeY+"</td></tr>");
        table.find("tbody").append(row)
});