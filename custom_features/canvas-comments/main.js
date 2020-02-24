(function() {
  const URL_BASE = "https://jhveem.xyz/api/";
  //getLibraries();
  async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getElement(selectorText, iframe="") {
    let element;
    if (iframe === "") {
        element = $(selectorText);
    } else {
        element = $(iframe).contents().find(selectorText);
    }
    if (element.length > 0 && element.html().trim() !== "") {
        return element;
    } else {
        await delay(1000);
        return getElement(selectorText, iframe);
    }
  }

  $.put = function(url, data){
    return $.ajax({
        url: url,
        data: data,
        type: 'PUT'
    });
  }
  
  //API Functions
  async function createProject(courseId, name) {
      let url = URL_BASE + "projects/courses/" + courseId;
      return $.post(url, {'name': name}, function(data) {
          console.log(data);
      });
  }
  async function getProjects(courseId) {
      let url = URL_BASE + "projects/courses/" + courseId;
      return $.get(url, function(data) {
          console.log(data);
      });
  }
  async function createTodo(projectId, name, pageTypes=['all']) {
      let url = URL_BASE + "projects/" + projectId + "/todo";
      return $.post(url, {'name': name, 'pageTypes': pageTypes}, function(data) {
          console.log(data);
      });
  }
  async function createComment(projectId, courseId, pageType, pageId, text) {
      let url = URL_BASE + "projects/" + projectId + "/pages/" + pageType + "/" + pageId + "/comment";
      return $.post(url, {'text': text, 'course': courseId, 'user': ENV.current_user_id}, function(data) {
          console.log(data);
      });
  }
  async function getComments(projectId, pageType, pageId) {
      let url = URL_BASE + "projects/" + projectId + "/pages/" + pageType + "/" + pageId + "/comments";
      return $.get(url, function(data) {
          console.log(data);
      });
  }
  async function updateComment(commentId, data) {
      let url = URL_BASE + "comments/" +commentId;
      return $.put(url, data);
  }

  canvasCommentsMenuProjectsPop() {
    let body = $("#canvas-comments-menu-projects");
    body.empty();
    body.append(`<div id="canvas-comments-menu-projects-new" class="canvas-comments-menu-item"><i class="icon-add"></i>New Project</div>`);
    
  }

  //SELECT CUSTOM FEATURES
  let rMainURL = /^\/courses\/([0-9]+)/; 
  if (rMainURL.test(window.location.pathname)) {
    let pieces = window.location.pathname.match(rMainURL);
    let courseId = parseInt(pieces[1]);
    getProjects(courseId);
    $('body').append(`
      <div toggle="false" id="canvas-comments-menu-container">
        <div id="canvas-comments-menu-header">TEST</div>
        <div id="canvas-comments-menu-body">
          <div id="canvas-comments-menu-projects"></div>
          <div id="canvas-comments-menu-todos"></div>
          <div id="canvas-comments-menu-comments"></div>
        </div>
      </div>
      <div class="canvas-comments-input-background"></div>
      <div class="canvas-comments-input-modal" id="canvas-comments-input-new-project">
        <h2>New Project</h2>
        <label>Project Name:</label>
        <input type="text" id="canvas-comments-input-new-project-input-name"></input>
        <button id="canvas-comments-input-new-project-save">Save</button>
      </div>
      `);
    //Hide all the stuff that doesn't need to be shown just yet
    $("#canvas-comments-menu-body").hide();
    $(".canvas-comments-input-background").hide();
    $("#canvas-comments-input-new-project").hide();

    $("#canvas-comments-menu-item-new")
      .click(function() {
        $(".canvas-comments-input-background").show();
        $("#canvas-comments-input-new-project").show();
      });
    $("#canvas-comments-menu-container")
      .draggable({
        handle: "#canvas-comments-menu-header",
        allowEventDefault: true
      })
      .click(function() {
        if ($(this).attr("toggle") === "true") {
          $("#canvas-comments-menu-body").toggle();
        } else {
          //add in a save to the user's settings to save where they place the modal on the screen so it pops up in the same spot whenever they open canvas
        }
        $(this).attr("toggle", "false");

      });
    $("#canvas-comments-menu-header")
      .click(function(){
        let container = $("#canvas-comments-menu-container");
        container.attr('toggle', 'true')
      });
  }
  let rPagesURL = /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/; 
  if (rPagesURL.test(window.location.pathname)) {
    let pieces = window.location.pathname.match(rPagesURL);
    let courseId = parseInt(pieces[1]);
    let pageType = parseInt(pieces[2]);
    let pageId = parseInt(pieces[3]);
    let userId = ENV.current_user_id;
    
  }
})();