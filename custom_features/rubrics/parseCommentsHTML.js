(function() {
  IMPORTED_FEATURE = {};
  let rWindowSpeedGrader = /^\/courses\/[0-9]+\/gradebook\/speed_grader/;
  let rWindowVanilla = /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/;
  if (rWindowSpeedGrader.test(window.location.pathname) || rWindowVanilla.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
      initiated: false,
      _init() {
        let feature = this;
        feature.parseCommentHTML();
      },
      async parseCommentHTML() {
        let feature = this;
        let element = await getElement("div.comment span, tr.comments");
        element.each(function() {
          var html = $(this).html();
          html = html.replace(/&lt;(\/{0,1}.+?)&gt;/g, "<$1>");
          $(this).html(html);

          let collapses = $(this).find('div.btech-comment-collapse');
          //go through each comment
          collapses.each(function() {
            let parent = $(this).parent();
            if (parent.find("h4.btech-toggler").length === 0) {
              //make sure there's not already a toggler for this comment
              let criteria_id = "criteria_" + Math.round(Math.random() * 100000000);
              let toggleHeader = '<br><h4 class="element_toggler btech-toggler" role="button" aria-controls="'+criteria_id+'" aria-expanded="false" aria-label="Toggler toggle list visibility"><i class="fal fa-comments" aria-hidden="true"></i><strong>Individual Criteria</strong></h4><br>';
              $(this).attr("id",criteria_id);
              $(this).css("display", "none");
              $(toggleHeader).insertBefore(this);
            }
          });
        });
        feature.createObserver();
      },
      async createObserver() {
        let feature = this;
        let selector;
        if (rWindowSpeedGrader.test(window.location.pathname)) {
          selector = "div#comments";
        }
        if (rWindowVanilla.test(window.location.pathname)) {
          selector = "div.comment_list";
        }
        let element = await getElement(selector);
        let observer = new MutationObserver(function(mutations) {
          feature.parseCommentHTML();
          observer.disconnect();
        });
        let config = {
          childList: true,
          subtree: true
        };
        observer.observe(element[0], config);
      },
    }
    IMPORTED_FEATURE._init();
  }
})();