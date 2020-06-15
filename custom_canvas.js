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
var CURRENT_COURSE_ID = null;
var CURRENT_DEPARTMENT_ID = null;
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

function feature(f, data = {}, regex = "") {
  //feature is the name of the feature file without .js, if it's in a subfolder, include that too
  //potentially flesh out these files so they're objects with methods. Then call an init function on load with the data variable having all the custom variables needed for each department
  //if you go this route, you could save each feature in a dict with the string provided here as the key and then in the feature itself, store itself in the dict
  //reset IMPORTED_FEATURE;
  let check = false;
  if (regex === "") {
    check = true;
  } else {
    if (!Array.isArray(regex)) regex = [regex];
    for (var i = 0; i < regex.length; i++) {
      let reg = regex[i];
      if (reg.test(window.location.pathname)) {
        check = true;
      }
    }
  }
  if (check) {
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
}

function featureBeta(f, data = {}, regex = "") {
  if (BETA) feature(f, data, regex);
}

//USED TO TEST IN A SINGLE COURSE
function featurePilot(f, courseId = 0, pilotCourseIds = 0, data = {}, regex = "") {
  if (courseId !== 0) { //Make sure you didn't forget to put a course Id in
    //set individual pilotCourseId to array
    if (!Array.isArray(pilotCourseIds)) pilotCourseIds = [pilotCourseIds];
    //check if current course is in array
    if (pilotCourseIds.includes(courseId)) feature(f, data, regex);
  }
}

function featureCDD(f, data = {}, regex) {
  let userId = parseInt(ENV.current_user.id);
  if (CDDIDS.includes(userId)) feature(f, data, regex);
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
        let aTag = $(`<a href="" title="` + description + `"><i class="` + icon + `"></i>` + name + `</a>`);
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

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var user = getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  }
}

add_javascript_library("https://btech.evaluationkit.com/CanvasScripts/btech.js?v=2");
add_javascript_library("https://jhveem.github.io/custom_canvas_import.js");
$.getScript("https://cdn.jsdelivr.net/npm/vue").done(function () {
  $.getScript("https://jhveem.github.io/custom_features/editor_toolbar/toolbar.js").done(() => {
    $.getScript("https://jhveem.github.io/course_list/course_list.js").done(() => {
      let currentUser = parseInt(ENV.current_user.id);
      const IS_ME = (currentUser === 1893418);
      //GENERAL FEATURES
      if (IS_TEACHER) {
        feature("reports/grades_page/report", {}, /^\/courses\/[0-9]+\/gradebook$/);
        feature("reports/individual_page/report", {}, [/^\/courses\/[0-9]+\/users\/[0-9]+$/, /^\/users\/[0-9]+$/]);
      }
      //COURSE FEATURES
      let rCheckInCourse = /^\/courses\/([0-9]+)/;
      if (rCheckInCourse.test(window.location.pathname)) {
        CURRENT_COURSE_ID = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
        //AVAILABLE TO EVERYONE
        feature('page_formatting/dropdown_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
        feature('page_formatting/tabs_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
        feature('page_formatting/google_sheets_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
        feature("page_formatting/tinymce_font_size", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)\/(.+?)\/edit/);

        feature("editor_toolbar/basics", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)\/(.+?)\/edit/);

        //This may need to be removed/revisited until next COE if other issues pop up.
        // feature('date_display/add_current_year_speed_grader', {}, /^\/courses\/[0-9]+\/gradebook\/speed_grader/);
        // feature('date_display/add_current_year', {}, /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/);

        feature('modules/convert_to_page');

        featureBeta('rubrics/gen_comment');
        featureBeta('modules/course_features');
        let courseId = CURRENT_COURSE_ID;
        //COURSE SPECIFIC FEATURES
        featurePilot("change_2019_to_2019-2020", courseId, [489538]); //IV Therapy
        featurePilot("rubrics/attempts_data", courseId, [498455]); //Dental 1010 pilot
        featurePilot("rubrics/gen_comment", courseId, [498455, 489058, 489702, 489089]); //Dental 1010 pilot, Dental I, Dental III, Micro Controllers I
        featurePilot("highlight_comments_same_date", courseId, [498455]); //Dental 1010 pilot
        featurePilot("previous-enrollment-data/previous_enrollment_period_grades", courseId, [511596]); //Business High School Summer
        //DEPARTMENT SPECIFIC IMPORTS
        let departmentId = 0;
        //DETERMINE CURRENT DEPARTMENT FROM DEPARTMENT LIST
        for (let d in COURSE_LIST) {
          if (COURSE_LIST[d].includes(courseId)) {
            departmentId = parseInt(d);
            break;
          }
        }
        CURRENT_DEPARTMENT_ID = departmentId;
        if (departmentId === 3824) { // DENTAL
          feature("highlighted_grades_page_items");
          feature("speed_grader_screen_split");
          feature("previous-enrollment-data/previous_enrollment_period_grades");
          if (IS_TEACHER) featureBeta("previous-enrollment-data/set_hours_form");
          if (currentUser === 1225484 || currentUser === 817257) {
            feature("previous-enrollment-data/set_hours_form");
          }
        }
        if (departmentId === 3827 || departmentId === 3828) { //Practical Nursing && Health Sciences General
          feature("editor_toolbar/syllabi", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
        }
        if (departmentId === 3833) {
          feature("department_specific/business_hs");
        }
        if (departmentId === 3819 || departmentId === 3832) { // AMAR && ELEC
          feature("modules/points_to_hours_header");
          feature("department_specific/amar_elec_add_module_items");
        }
        if (departmentId === 3847) { //meats
          feature("previous-enrollment-data/previous_enrollment_period_grades");
        }
        if (departmentId === 3841 || departmentId === 3947) { //cosmetology && master esthetics
          feature("department_specific/esthetics_cosmetology_services");
        }
      }

      //CDD ONLY
      featureCDD("rubrics/sortable");
      featureCDD("quizzes/question_bank_sorter");
      //featureCDD("previous-enrollment-data/previous_enrollment_period_grades");
      featureCDD("help_tab");
      featureCDD("rubrics/add_criteria_from_csv", {}, new RegExp('/(rubrics|assignments\/)'));
      featureCDD("rubrics/create_rubric_from_csv", {}, new RegExp('^/(course|account)s/([0-9]+)/rubrics$'));
      featureCDD("editor_toolbar/tables", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
      featureCDD("surveys");
      featureCDD("survey/survey");
      if (IS_ME) featureCDD("editor_toolbar/syllabi", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes)/);
      featureBeta("department_specific/business_hs");

      //Survey
      if (currentUser === 1507313) { //Lisa Balling
        feature("survey/survey");
      }
    });
  });
});

window.ALLY_CFG = {
  'baseUrl': 'https://prod.ally.ac',
  'clientId': 1164
};
$.getScript(ALLY_CFG.baseUrl + '/integration/canvas/ally.js');