if (/^\/courses\/[0-9]+\/modules/.test(window.location.pathname)) {
  //get course id
  let rPieces = /^\/courses\/([0-9]+)\/modules/;
  let pieces = window.location.pathname.match(rPieces);
  let courseId = parseInt(pieces[1]);
  //get header on modules page and add an empty div
  let moduleModal = $(".header-bar");
  let moduleHeader = $("<div></div>");
  moduleModal.after(moduleHeader);
  if (IS_TEACHER) {
    let select = $("<select></select>");
    moduleHeader.append(select);
    $.get("/api/v1/courses/"+courseId+"/pages").done(function(data) {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        let pageData = data[i];
        select.append("<option value='"+pageData.url+"'>"+pageData.title+"</option>"); 
      }
    });
  }
  $.get("/api/v1/courses/"+courseId+"/pages/btech-custom-settings", function(data) {
    //if custom settings page exists, look for the appropriate header
    $('body').append("<settings id='btech-custom-settings'></settings>");
    let settings = $('settings#btech-custom-settings');
    settings.html(data.body);
    let page = settings.find('#modules-page-header');
    if (page.length > 0) {
      //get the name of the page to append and then grab the page
      let pageName = page.text();
      $.get("/api/v1/courses/" + courseId + "/pages/" + pageName, function (data) {
        moduleHeader.append(data.body);
      });
    }
    //Once it's all done remove the settings tag
    settings.remove();
  })
}