  CANVAS_COMMENTS_MENU_GENERAL = {
    modals: null, 
    api: CANVAS_COMMENTS_API,
    container: $('<div toggle="false" id="canvas-comments-menu-container"></div>').appendTo('body'),
    projects: [],
    async _init() {
      let self = this;
      self.modal = CANVAS_COMMENTS_MODALS;
      self.projects = await self.api.getProjects(CANVAS_COMMENTS.courseId);
      self.menuContainerPop();
    },
    menuMainItemCreate(name, icon, popFunction) {
      let lName = name.toLowerCase();
      let menuBody = $("#canvas-comments-menu-body");
      let menu = $("#canvas-comments-menu-main");
      let id = "canvas-comments-menu-main-item-"+lName;
      //add menu item to main menu
      menu.append(`
        <div id="`+id+`" class="canvas-comments-menu-item"><i class="icon-`+icon+`"></i> `+name+`</div>
        `);
      //create sub menu that this item will access

      //make it so that clicking on this item will access the sub menu and hide the main menu
      $("#"+id).click(function(){
        $("#canvas-comments-menu-header-back").show();
        $("#canvas-comments-menu-header-toggle").hide();
        menu.hide();
        $("#canvas-comments-submenu").show();
        popFunction();
      });
    },
    
    menuMainPop() {
      let self = this;
      self.menuMainItemCreate('Projects', 'collection', function() {self.menuProjectsPop()});
      self.menuMainItemCreate('Settings', 'settings', function() {self.menuSettingsPop()});
    },

    menuSettingsPop() {
      let self = this;
      let body = $("#canvas-comments-submenu");
      body.empty();
    },

    menuContainerPop() {
      let self = this;
      self.container.append(`
          <div id="canvas-comments-menu-header">
            <div id="canvas-comments-menu-header-toggle" style="float:left; padding-right:10px;">
              <i class="icon-discussion-reply"></i>
            </div>
            <div id="canvas-comments-menu-header-back" style="float:left; padding-right:10px;">
              <i class="icon-arrow-left"></i>
            </div>
            Collaboration 
          </div>
          <div id="canvas-comments-menu-body">
            <div id="canvas-comments-menu-main"></div>
            <div id="canvas-comments-submenu"></div>
          </div>
          `);
        $("#canvas-comments-submenu").hide();
      //Handle dragging and menu collapsing/showing
          self.container.draggable({
            handle: "#canvas-comments-menu-header",
          })
        $("#canvas-comments-menu-header-toggle")
          .click(function () {
            $("#canvas-comments-menu-body").toggle();
          });
      //Hide all the stuff that doesn't need to be shown just yet
      $("#canvas-comments-menu-header-back").hide();
      $("#canvas-comments-menu-header-back").click(function() {
        $(this).hide();
        $("#canvas-comments-menu-header-toggle").show();
        $("#canvas-comments-submenu").hide();
        $("#canvas-comments-menu-main").show();
      });
      $("#canvas-comments-menu-body").hide();
      $(".canvas-comments-input-background").hide();
      self.menuMainPop();
      self.menuProjectsPop();
    },

    async createModalOpenMenuItem(body, text, modalFunction) {
      let element = $(`
        <div class="canvas-comments-menu-item"><i class="icon-add"></i>`+text+`</div>
        `);
      body.append(element);
      element
        .click(function () {
          modalFunction();
        });
      return element;
    },

    async menuTodosPop(projectId='') {
      let self = this;
      let body = $("#canvas-comments-submenu");
      body.empty();
      let todos = [];
      //get the existing todos
      for (let i = 0; i < self.projects.length; i++) {
        let project  = self.projects[i];
        if (project._id === projectId) {
          todos = project.todos;
          break;
        }
      }
      console.log(todos);
      //populate menu with todos

      //add a button for adding new todos
      self.createModalOpenMenuItem(body, "New Todo", function() {
        self.modal.newTodoInit(projectId);
      });
    },

    async menuProjectsPop() {
      let self = this;
      let body = $("#canvas-comments-submenu");
      body.empty();

      for (let i = 0; i < self.projects.length; i++) {
        let project = self.projects[i];
        let projectElement = $(`
          <div projectId='`+project._id+`' class="canvas-comments-menu-item">`+project.name+`</div>
        `);
        projectElement.appendTo(body);
        projectElement.click(function() {
          let projectId = $(this).attr('projectId');
          self.menuTodosPop(projectId);
        });
      }
      self.createModalOpenMenuItem(body, "New Project", function() {
        self.modal.newProjectInit();
      });
    },
  }