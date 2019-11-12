
//add_javascript_library("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js");
add_javascript_library("https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js");

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
function makeSortable() {
  $('table.rubric_table tbody').sortable();
}
function attachButton() {
  makeSortable();
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