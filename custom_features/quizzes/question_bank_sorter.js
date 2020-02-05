if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/edit/.test(window.location.pathname)) {
  let url = "quizzes/question_bank_sorter";
  FEATURES[url] = {
    _init: async function() {
      let feature = this; //allows to call the feature's methods from within functions
      let bankWidget = await getElement("#find_bank_dialog");
      //bankWidget.prepend("<button id='btech-sort-question-banks'>Sort</button>");
      let container = $("#find_bank_dialog div.find_banks");
      let bankList = $("#find_bank_dialog ul.bank_list");
      bankList.before("<table><tbody><tr id='btech-banks-table'><td style='vertical-align: top;'><ul style='position: -webkit-sticky; position:sticky; top: 0;' class='btech-question-banks-sorter' id='btech-bank-courses'></ul></td><td id='btech-bank-display'></td></tr></tbody></table>");
      var observer = new MutationObserver(function() {
        if (bankList.find("li").length > 1) {
          observer.disconnect();
          feature.sortList();
        }
      });
      observer.observe(bankList[0], {'childList': true});
    },
    sortList: function() {
      //let table = $("#btech-banks-table");
      let courseList = $("#btech-bank-courses");
      let displayLists = $("#btech-bank-display");
      let bankList = $("#find_bank_dialog ul.bank_list");
      bankList.attr('id', 'btech-banks-original');
      bankList.hide();
      let courseNames = [];
      let bankItems = bankList.find("li.bank");
      bankItems.each(function() {
        let courseName = $(this).find("div.sub_content span.cached_context_short_name").text().trim();
        if (courseName !== "") {
          let courseBankSelectorId = "btech-bank-course-"+courseName.replace(" ", "-");
          let courseBankListId = "btech-bank-list-"+courseName.replace(" ", "-");
          if (!courseNames.includes(courseName)) {
            courseNames.push(courseName);
            courseList.append("<li id='"+courseBankSelectorId+"'>"+courseName+"</li>");
            let courseBankSelector = $("#"+courseBankSelectorId);

            displayLists.append("<ul class='btech-question-banks-sorter' id='"+courseBankListId+"'></ul>");
            let courseBankList= $("#"+courseBankListId);
            courseBankList.hide();

            courseBankSelector.on("click", function() {
              $(courseList).find("li").each(function() {
                $(this).removeClass("selected");
              });
              $(this).addClass("selected");
              $(displayLists).find("ul").each(function() {
                $(this).hide();
              });
              let listId = $(this).attr("id").replace("btech-bank-course", "btech-bank-list");
              $("#"+listId).show();
            });
          }
          $("#"+courseBankListId).append($(this));
        }
      });
      courseNames.sort();
      for (let i = 0; i < courseNames.length; i++) {
        let courseName = courseNames[i];
        let courseBankSelectorId = "btech-bank-course-"+courseName.replace(" ", "-");
        courseList.append($("#"+courseBankSelectorId));
      }
    }
  }
}