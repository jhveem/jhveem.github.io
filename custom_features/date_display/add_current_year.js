
async function setAssignmentSubmittedDateHeader(selectorText, iframe="") {
    let header = await getElement(selectorText, iframe);
    header.html(header.html().replace(/ubmitted ([a-z|A-Z]+) ([0-9]+) at/, "ubmitted $1 $2, 2020 at"));
}
if (/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/.test(window.location.pathname)) {
    setAssignmentSubmittedDateHeader("span.submission-details-header__time");
    setAssignmentSubmittedDateHeader("div.quiz-submission.headless", "#preview_frame");
}