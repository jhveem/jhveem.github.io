if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  let url = "date_display/add_current_year_speed_grader"; 
  FEATURES[url] = {
    initiated: false, 
    oldHref: "",
    async _init() { 
      let feature = this;
      feature.oldHref = document.location.href,
      window.onload = function() {
        var
        bodyList = document.querySelector("#right_side"),
        observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (feature.oldHref !== document.location.href) {
              feature.oldHref = document.location.href;
              feature.checkElements();
            }
          });
        });
        var config = {
          childList: true,
          subtree: true
        };
        observer.observe(bodyList, config);
      };
      feature.checkElements();
    },
    async checkElements() {
      console.log("CHECKING ELEMENTS");
      let feature = this;
      let list = await getElement("#submission_to_view");
      list.find("option").each(function() {
        feature.addCurrentYear(this);
      });
      let comments = await getElement("#comments");
      comments.find("div.comment span.posted_at").each(function() {
        feature.addCurrentYear(this);
      });
    },
    addCurrentYear(element) {
      let html = $(element).html();
      html = html.replace(/([A-Z][a-z]+) ([0-9]+) at/, "$1 $2, 2020 at");
      $(element).html(html);
    }
  }
}