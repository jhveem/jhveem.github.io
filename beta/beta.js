
//can only call this once per element
function waitForKeyElements (
  selectorTxt,    /* Required: The jQuery selector string that
                      specifies the desired element(s).
                  */
  actionFunction, /* Required: The code to run when elements are
                      found. It is passed a jNode to the matched
                      element.
                  */
  bWaitOnce,      /* Optional: If false, will continue to scan for
                      new elements even after the first match is
                      found.
                  */
  iframeSelector  /* Optional: If set, identifies the iframe to
                      search.
                  */
) {
  var targetNodes, btargetsFound;

  if (typeof iframeSelector == "undefined")
    targetNodes     = $(selectorTxt);
  else
    targetNodes     = $(iframeSelector).contents ()
                                        .find (selectorTxt);

  if (targetNodes  &&  targetNodes.length > 0) {
    btargetsFound   = true;
    /*--- Found target node(s).  Go through each and act if they
      are new.
    */
    targetNodes.each ( function () {
      var jThis        = $(this);
      var alreadyFound = jThis.data ('alreadyFound')  ||  false;

      if (!alreadyFound) {
        //--- Call the payload function.
        var cancelFound     = actionFunction (jThis);
        if (cancelFound)
          btargetsFound   = false;
        else
          jThis.data ('alreadyFound', true);
      }
    } );
  }
  else {
    btargetsFound   = false;
  }

  //--- Get the timer-control variable for this selector.
  var controlObj      = waitForKeyElements.controlObj  ||  {};
  var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
  var timeControl     = controlObj [controlKey];

  //--- Now set or clear the timer as appropriate.
  if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
    //--- The only condition where we need to clear the timer.
    clearInterval (timeControl);
    delete controlObj [controlKey]
  }
  else {
    //--- Set a timer, if needed.
    if ( ! timeControl) {
      timeControl = setInterval ( function () {
          waitForKeyElements (  selectorTxt,
                                actionFunction,
                                bWaitOnce,
                                iframeSelector
                              );
        },
        300
      );
      controlObj [controlKey] = timeControl;
    }
  }
  waitForKeyElements.controlObj   = controlObj;
}

function add_javascript_library(url) {
	var s = document.createElement("script");
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(s);
}

//*
if (window.location.pathname.includes("/rubrics") === true || window.location.pathname.includes("/assignments/") === true) {
  var scriptElement = document.createElement( "script" );
  scriptElement.src = "https://jhveem.github.io/beta/rubrics.js";
  document.body.appendChild( scriptElement )
  scriptElement.onload = function() {
    waitForKeyElements('#add_learning_outcome_link', attachButton);
  }
}

if (/^\/courses\/[0-9]+\/users/.test(window.location.pathname)) {
  waitForKeyElements("table.roster", function() {
      sorttable.makeSortable($("table.roster")[0]);
  });
}

if (/^\/courses\/473716\/gradebook\/speed_grader/.test(window.location.pathname)) {
  console.log("RUBRIC TEST");
  $.put = function(url, data){
    return $.ajax({
      url: url,
      type: 'PUT'
    });
  }
  $(".save_rubric_button").on("click", function() {
      let comment = "-RUBRIC-%0A";
      let rows = $("div#rubric_full").find("tr");
      comment += ($(rows[rows.length - 2]).text().trim() + "%0A%0A");
      $("div#rubric_full").find("tr.rubric-criterion").each(function(index) {
          let description = $(this).find("th.description-header").find("div.description").text();
          let points_val = $(this).find("td.criterion_points").find("div.graded-points").find("input").val();
          let points = $(this).find("td.criterion_points").find("div.graded-points").text();
          comment += (description + "%0A" + points_val + points.replace("Points", "") + "%0A%0A");
      });
      $.put("https://btech.beta.instructure.com/api/v1/courses/"+ENV.course_id+"/assignments/"+ENV.assignment_id+"/submissions/"+ENV.RUBRIC_ASSESSMENT.assessment_user_id+"?comment[text_comment]="+comment,{} );
  });
}
/*
if (/^\/courses\/[0-9]+\/pages/.test(window.location.pathname) && window.location.pathname.includes('syllabus')) {
    var scriptElement = document.createElement( "script" );
    scriptElement.src = "https://jhveem.github.io/beta/syllabus-review.js";
    document.body.appendChild( scriptElement )
    scriptElement.onload = function() {
    waitForKeyElements(".user_content", function() {
      processSyllabusPage();
    });
  }
}
*/