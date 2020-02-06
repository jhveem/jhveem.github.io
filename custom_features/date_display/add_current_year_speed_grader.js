if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  let url = "date_display/add_current_year_speed_grader"; 
  FEATURES[url] = {
    initiated: false, 
    async _init() { 
      window.onload = function() {
        var
        oldHref = document.location.href,
        bodyList = document.querySelector("#right_side"),
        observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (oldHref != document.location.href) {
              oldHref = document.location.href;
              checkElements();
            }
          });
        });
        var config = {
          childList: true,
          subtree: true
        };
        observer.observe(bodyList, config);
      };
      checkElements();
    },
    async checkElements() {
      let list = await getElement("#submission_to_view");
      list.find("option").each(function() {
        addCurrentYear(this);
      });
      let comments = await getElement("#comments");
      comments.find("div.comment span.posted_at").each(function() {
        addCurrentYear(this);
      });
    },
    addCurrentYear() {
      let html = $(element).html();
      html = html.replace(/([A-Z][a-z]+) ([0-9]+) at/, "$1 $2, 2020 at");
      $(element).html(html);
    }
    //WHATEVER ELSE YOU WANT OT ADD IN. IT'S JUST A JAVASCRIPT OBJECT
  }
}