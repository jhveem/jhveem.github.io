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
      let feature = this;
      await feature.setAssignmentSubmittedDateHeader("#multiple_submissions");
      await feature.setAssignmentSubmittedDateHeader("#comments div.comment span.posted_at");
    },
    async setAssignmentSubmittedDateHeader(selectorText, iframe="") {
        let elements = await getElement(selectorText, iframe);
        elements.each(function() {
            let element = $(this);
            element.html(element.html().replace(/([A-Z][a-z]+) ([0-9]+) at/g, "$1 $2, 2020 at"));
        });
    }
  }
}