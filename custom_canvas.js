//THIS MUST BE UPDATED IN THE THEMES SECTION OF CANVAS

//check for custom theme info, will probably only run on pages, quizzes, and assignments, but who knows
let themeParent = $('#btech-theme-parent');
if (themeParent.length === 1) {
  let header = themeParent.find('.btech-theme-header');
  if (header.length === 1) {
    document.documentElement.style.setProperty('--btech-theme-header-background-color', header.css('background-color'));
    document.documentElement.style.setProperty('--btech-theme-header-color', header.css('color'));
  }

  let headerHover = themeParent.find('.btech-theme-header-hover');
  if (headerHover.length === 1) {
    document.documentElement.style.setProperty('--btech-theme-header-hover-background-color', headerHover.css('background-color'));
    document.documentElement.style.setProperty('--btech-theme-header-hover-color', headerHover.css('color'));
  }
}

/*EvaluationKIT START*/
var BETA = false;
if (window.location.href.includes("btech.beta.instructure.com")) {
  BETA = true;
} else {
  BETA = false;
}
var CDDIDS = [
  1893418, //Josh 
  1864953, //Danni
  1891741, //Katie
  1638854, //Mason
  1922029, //Makenzie
  1807337, //Jon
  1950359, //Morgan
];
var IS_TEACHER = ENV.current_user_roles.includes("teacher");

var FEATURES = {};
var IMPORTED_FEATURE = {};

var MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getElement(selectorText, iframe = "") {
  let element;
  if (iframe === "") {
    element = $(selectorText);
  } else {
    element = $(iframe).contents().find(selectorText);
  }
  if (element.length > 0 && element.html().trim() !== "") {
    return element;
  } else {
    await delay(250);
    return getElement(selectorText, iframe);
  }
}

function add_javascript_library(url) {
  var s = document.createElement("script");
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(s);
}

function feature(f, data = {}) {
  //feature is the name of the feature file without .js, if it's in a subfolder, include that too
  //potentially flesh out these files so they're objects with methods. Then call an init function on load with the data variable having all the custom variables needed for each department
  //if you go this route, you could save each feature in a dict with the string provided here as the key and then in the feature itself, store itself in the dict
  //reset IMPORTED_FEATURE;
  $.getScript("https://jhveem.github.io/custom_features/" + f + ".js").done(function () {
    if (!$.isEmptyObject(IMPORTED_FEATURE)) {
      if (!(f in FEATURES)) {
        FEATURES[f] = IMPORTED_FEATURE;
      }
    }
    if (f in FEATURES) {
      let feature = FEATURES[f];
      //make sure it hasn't already been called to avoid messing up the page
      if (feature.initiated === false) {
        feature.initiated = true;
        feature._init(data);
      }
    }
  });
}

function featureBeta(f, data = {}) {
  if (BETA) feature(f, data);
}

//USED TO TEST IN A SINGLE COURSE
function featurePilot(f, courseId = 0, pilotCourseIds = 0, data = {}) {
  if (courseId !== 0) { //Make sure you didn't forget to put a course Id in
    //set individual pilotCourseId to array
    if (!Array.isArray(pilotCourseIds)) pilotCourseIds = [pilotCourseIds];
    //check if current course is in array
    if (pilotCourseIds.includes(courseId)) feature(f, data);
  }
}

function featureCDD(f, data = {}) {
  let userId = parseInt(ENV.current_user.id);
  if (CDDIDS.includes(userId)) feature(f, data);
}


function addToModuleItemMenu(name, description, func, type = "all") {
  let courseId = ENV.COURSE_ID;
  $("div.context_module").each(function () {
    let module = $(this);
    let moduleId = $(this).attr("data-module-id");
    module.find("li.context_module_item").each(function () {
      let item = $(this);
      let itemType = item.find(".type_icon").attr("title");
      if (itemType === type || type === "all") {
        let menu = item.find("ul.al-options");
        let liTag = $("<li></li>");
        let aTag = $(`<a href="" title="` + description + `"><i class="icon-forward"></i>` + name + `</a>`);
        liTag.append(aTag);
        menu.append(liTag);
        aTag.click(function () {
          func(courseId, moduleId, item)
        });
      }
    });
  });
}

function addToModuleMenu(name, description, func, icon = "icon-plus") {
  let courseId = ENV.COURSE_ID;
  $("div.context_module").each(function () {
    let module = $(this);
    let moduleId = $(this).attr("data-module-id");
    module.find("div.ig-header-admin").each(function () {
      let item = $(this);
      let rTitle = /Module ([0-9]+)/;
      let title = item.find('.name').text();
      let titleMatch = title.match(rTitle);
      if (titleMatch !== null) {
        let modTitle = "Module " + titleMatch[1];
        console.log(modTitle);
        let menu = item.find("ul.al-options");
        let liTag = $("<li></li>");
        let aTag = $(`<a href="" title="` + description + `"><i class="`+icon+`"></i>` + name + `</a>`);
        liTag.append(aTag);
        menu.append(liTag);
        aTag.click(function () {
          func(courseId, moduleId, item, modTitle)
        });
      }
    });
  });
}

$.put = function (url, data) {
  return $.ajax({
    url: url,
    data: data,
    type: 'PUT'
  });
}

$.delete = function (url, data) {
  return $.ajax({
    url: url,
    data: data,
    type: 'DELETE'
  });
}

add_javascript_library("https://cdn.jsdelivr.net/npm/vue");
add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
$.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
  let currentUser = parseInt(ENV.current_user.id);
  const IS_ME = (currentUser === 1893418);
  //GENERAL FEATURES

  //COURSE FEATURES
  let rCheckInCourse = /^\/courses\/([0-9]+)/;
  if (rCheckInCourse.test(window.location.pathname)) {
    //AVAILABLE TO EVERYONE
    feature('date_display/add_current_year_speed_grader');
    feature('date_display/add_current_year');
    featureBeta('rubrics/gen_comment');
    feature('page_formatting/dropdown_from_table');
    feature('page_formatting/tabs_from_table');
    feature('page_formatting/google_sheets_table');
    feature('modules/convert_to_page');
    featureBeta('modules/course_features');
    featureCDD("page_formatting/tinymce_font_size");

    let courseId = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
    //COURSE SPECIFIC FEATURES
    featurePilot("change_2019_to_2019-2020", courseId, [489538]); //IV Therapy
    featurePilot("rubrics/attempts_data", courseId, [498455]); //Dental 1010 pilot
    featurePilot("rubrics/gen_comment", courseId, [498455, 489058, 489702, 489089]); //Dental 1010 pilot, Dental I, Dental III, Micro Controllers I
    featurePilot("highlight_comments_same_date", courseId, [498455]); //Dental 1010 pilot
    featurePilot("page_formatting/tinymce_buttons", courseId, [425334]);
    //DEPARTMENT SPECIFIC IMPORTS
    let departmentId = 0;
    //DETERMINE CURRENT DEPARTMENT FROM DEPARTMENT LIST
    for (let d in COURSE_LIST) {
      if (COURSE_LIST[d].includes(courseId)) {
        departmentId = parseInt(d);
        break;
      }
    }
    if (departmentId === 3824) { // DENTAL
      feature("highlighted_grades_page_items");
      feature("speed_grader_screen_split");
      feature("previous-enrollment-data/previous_enrollment_period_grades");
      if (IS_TEACHER) featureBeta("previous-enrollment-data/set_hours_form");
      if (currentUser === 1225484 || currentUser === 817257) {
        feature("previous-enrollment-data/set_hours_form");
      }
    }
    if (departmentId === 3819 || departmentId === 3832) { // AMAR && ELEC
      feature("modules/points_to_hours_header");
      feature("page_formatting/tinymce_buttons");
      feature("department_specific/amar_elec_add_module_items"); 
    }
    if (departmentId === 3847) {
      feature("previous-enrollment-data/previous_enrollment_period_grades");
    }
    if (departmentId === 3841) { //cosmetology
      feature("department_specific/esthetics_cosmetology_services");
    }
  }

  //JUST ME
  /*
  if (CDDIDS.includes(currentUser) && !IS_ME) {
    if (/^\/courses\/([0-9]+)/.test(window.location.pathname)) {
      $.getScript("https://jhveem.xyz/collaborator/import.js");
    }
  }
  if (IS_ME) {
    if (/^\/courses\/([0-9]+)/.test(window.location.pathname)) {
      $.getScript("https://jhveem.xyz/collaborator-beta/import-beta.js");
    }
  }
  */

  //CDD ONLY
  featureCDD("rubrics/sortable");
  featureCDD("quizzes/question_bank_sorter");
  featureCDD("previous-enrollment-data/previous_enrollment_period_grades");
  featureCDD("help_tab");
  featureCDD("rubrics/add_criteria_from_csv");
  featureCDD("rubrics/create_rubric_from_csv");
  featureCDD('page_formatting/tinymce_buttons');
});

/*EvaluationKIT END*/

window.ALLY_CFG = {
  'baseUrl': 'https://prod.ally.ac',
  'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');