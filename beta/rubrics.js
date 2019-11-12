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
add_javascript_library("https://gist.github.com/raw/2625891/waitForKeyElements.js");
add_javascript_library("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js");
add_javascript_library("https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js");

waitForKeyElements('#add_learning_outcome_link', attachButton);

function pastToPresent(verb) {
  let newVerb = '';
  let vowels = ['a', 'e', 'i', 'o', 'u'];
  if (verb === 'did') {
    newVerb = 'do';
  } else if (verb ==='took') {
    newVerb = 'take';
  } else {
    newVerb = verb.replace("ed", "");
    if (newVerb !== verb) {
      let prepenultimateChar = newVerb.charAt(newVerb.length - 3);
      let penultimateChar = newVerb.charAt(newVerb.length - 2);
      let ultimateChar = newVerb.charAt(newVerb.length - 1);
      if (vowels.includes(penultimateChar) && !vowels.includes(prepenultimateChar) && ultimateChar !== 'l') {
        newVerb += 'e';
      }
    }
  }
  return newVerb;
}

function trimCriteria(criteria) {
  criteria = criteria.replace(" properly","");
  criteria = criteria.replace(" correctly","");
  return criteria;
}

function getVerb(pos) {
}

function createSkilled(original) {
  let pos = original.indexOf('tudent') + 7;
  let output = [original.slice(0, pos), 'correctly ', original.slice(pos)].join('');
  output = original;
  return output;
}
function createModeratelySkilled(original) {
  let pos = original.indexOf('tudent') + 7;
  let trimmed = trimCriteria(original);
  let verbEndPos = trimmed.indexOf(' ', pos);
  let verb = trimmed.substring(pos, verbEndPos);
  let newVerb = pastToPresent(verb);
  trimmed = trimmed.replace(verb, newVerb);
  let output = [trimmed.slice(0, pos), 'needed some prompting to ', trimmed.slice(pos)].join('');
  return output;
}

function createTryAgain(original) {
  let pos = original.indexOf('tudent') + 7;
  let trimmed = trimCriteria(original);
  let verbEndPos = trimmed.indexOf(' ', pos);
  let verb = trimmed.substring(pos, verbEndPos);
  let newVerb = pastToPresent(verb);
  trimmed = trimmed.replace(verb, newVerb);
  let output = [trimmed.slice(0, pos), 'was unable to ', trimmed.slice(pos)].join('');
  return output;
}

function attachButton() {
  $('table.rubric_table tbody').sortable();
  $('table.rubric_table tbody').children('tr').each(function(element) {
    let toolList = $(this).find('td.criterion_description div.editing');
    let criteriaDescription = $(this).find('td.criterion_description span.description_title').text();
    toolList.find('button').remove();
    toolList.append('<button class="fill_ratings">+</button>');
    toolList.find('.fill_ratings').click({parent: this, criteria: criteriaDescription}, function(event) {
      let parent = event.data.parent;
      let criteriaDescription = event.data.criteria;
      if (criteriaDescription.indexOf(' ') === -1 || criteriaDescription === "Description of criterion") {
        criteriaDescription = "Student did a task";
        $(parent).find('td.criterion_description span.description_title').text(criteriaDescription);
      }
      let cells = $(parent).find('table.ratings').find("td");
      let skilled = cells.get(0);
      $(skilled).find('.rating_long_description').text(createSkilled(criteriaDescription));
      $(skilled).find('.rating_description_value').text("Skilled");
      let moderatelySkilled = cells.get(1);
      $(moderatelySkilled).find('.rating_long_description').text(createModeratelySkilled(criteriaDescription));
      $(moderatelySkilled).find('.rating_description_value').text("Moderately Skilled");
      if (cells.get(2) !== undefined) {
        let tryAgain = cells.get(2);
        $(tryAgain).find('.rating_long_description').text(createTryAgain(criteriaDescription));
        $(tryAgain).find('.rating_description_value').text("Try Again");
      }
    });
  });
}