
if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
    let url = "date_display/add_current_year"; 
    FEATURES[url] = {
        initiated: false, 
        async _init() {
            let feature = this;
            feature.setAssignmentSubmittedDateHeader("span.submission-details-header__time");
            feature.setAssignmentSubmittedDateHeader("div.quiz-submission.headless", "#preview_frame");
        },
        
        async setAssignmentSubmittedDateHeader(selectorText, iframe="") {
            let header = await getElement(selectorText, iframe);
            header.html(header.html().replace(/ubmitted ([a-z|A-Z]+) ([0-9]+) at/, "ubmitted $1 $2, 2020 at"));
        }
    }
}