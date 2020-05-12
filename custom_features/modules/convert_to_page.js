(function () {
  console.log("TEST 1")
  function convertAssignmentToPage() {
    event.preventDefault();
    let itemId = item.find("div.ig-admin span").attr("data-content-id");
    let moduleItemId = item.find("div.ig-admin span").attr("data-module-item-id");
    $.get("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId, function (data) {
      let oldModuleItemData = data;
      $.get("/api/v1/courses/" + courseId + "/assignments/" + itemId, function (data) {
        $.post("/api/v1/courses/" + courseId + "/pages", {
          wiki_page: {
            title: data.name,
            body: data.description,
            published: oldModuleItemData.published
          }
        }, function (data) {
          $.post("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items", {
            module_item: {
              title: data.title,
              type: 'Page',
              position: oldModuleItemData.position,
              indent: oldModuleItemData.indent,
              page_url: data.url
            }
          }, function (data) {
            $.delete("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId).done(function () {
              $.delete("/api/v1/courses/" + courseId + "/assignments/" + oldModuleItemData.content_id).done(function () {
                location.reload(true);
              });
            });
          });
        });
      });
    });
  }
  function addToModuleItemMenu(name, description, func) {
    let courseId = ENV.COURSE_ID;
    $("div.context_module").each(function () {
      let module = $(this);
      let moduleId = $(this).attr("data-module-id");
      module.find("li.context_module_item").each(function () {
        let item = $(this);
        let type = item.find(".type_icon").attr("title");
        if (type === "Assignment") {
          let menu = item.find("ul.al-options");
          let liTag = $("<li></li>");
          let aTag = $(`<a href="" title="`+description+`"><i class="icon-forward"></i>`+name+`</a>`);
          liTag.append(aTag);
          menu.append(liTag);
          aTag.click(function() {
            func(courseId, moduleId, item)
          });
        }
      });
    });
  }
  addToModuleItemMenu("Convert To Page", "Remove this item from the module", convertAssignmentToPage)
})();