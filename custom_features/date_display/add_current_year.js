IMPORTED_FEATURE = {};
if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
        initiated: false, 
        async _init() {
            let feature = this;
            feature.setAssignmentSubmittedDateHeader("span.submission-details-header__time");
            feature.setAssignmentSubmittedDateHeader("div.quiz-submission.headless", "#preview_frame");
            feature.setAssignmentSubmittedDateHeader("div.comment_list span.posted_at");
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