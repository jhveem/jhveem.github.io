if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  async function hoverByClass(classname,colorover,colorout="transparent"){
    console.log("TEST");
    let comments = await getElement("." + classname);
    console.log("TEST");
    comments.each(function() {
        console.log("TEST");
        console.log($(this));
        $(this).mouseover(function() {
            $("." + classname + "").each(function() {
                $(this).css("background-color", colorover);
            });
        });
        $(this).mouseout(function() {
            $("." + classname + "").each(function() {
                $(this).css("background-color", "transparent");
            });
        });
    });
  }
  async function prepComments() {
    let comments = await getElement("div.comment");
    let dates = [];
    comments.each(function() {
        let postedAt = $(this).find("span.posted_at").text().match(/^([A-Z][a-z]+ [0-9]+)/)[1].replace(" ", "-");
        let classname = "comment-date-" + postedAt;
        $(this).addClass(classname);
        if (!dates.includes(classname)) {
            dates.push(classname);
        }
    });
    for (var d = 0; d < dates.length; d++) {
        let date = dates[d];
        console.log(date);
        hoverByClass(date, "#FFC");
    }
  }
  prepComments();
}