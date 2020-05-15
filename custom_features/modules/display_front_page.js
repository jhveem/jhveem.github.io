let moduleModal = $(".header-bar");
let frontPage = $("<div></div>");
moduleModal.after(frontPage);
if (/^\/courses\/[0-9]+\/modules/.test(window.location.pathname)) {
    let rPieces = /^\/courses\/([0-9]+)\/modules/;
    let pieces = window.location.pathname.match(rPieces);
    let courseId = parseInt(pieces[1]);
$.get("/api/v1/courses/"+courseId+"/front_page", function(data) {
frontPage.append(data.body);
});
}