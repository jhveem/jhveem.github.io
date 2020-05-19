if (/^\/courses\/[0-9]+\/modules/.test(window.location.pathname)) {
  //get course id
  let rPieces = /^\/courses\/([0-9]+)\/modules/;
  let pieces = window.location.pathname.match(rPieces);
  let courseId = parseInt(pieces[1]);
  $.get("/api/v1/courses/"+courseId+"/pages/btech-custom-settings", function(data) {
    //if custom settings page exists, look for the appropriate header
    $('body').append("<settings id='btech-custom-settings'></settings>");
    let settings = $('settings#btech-custom-settings');
    settings.html(data.body);
    let page = settings.find('#modules-page-header');
    if (page.length > 0) {
      //get header on modules page and add an empty div
      let moduleModal = $(".header-bar");
      let frontPage = $("<div></div>");
      moduleModal.after(frontPage);

      //get the name of the page to append and then grab the page
      let pageName = page.text();
      $.get("/api/v1/courses/" + courseId + "/" + pageName, function (data) {
        frontPage.append(data.body);
      });
    }
  })
}