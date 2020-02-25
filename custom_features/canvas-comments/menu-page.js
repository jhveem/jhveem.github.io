
  CANVAS_COMMENTS_MENU_PAGE = {
    modals: null, 
    menuCurrent: 'main',
    main: CANVAS_COMMENTS,
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
        popFunction();
      });
    },
    
    menuMainPop() {
      let self = this;
      let body = $("#canvas-comments-menu-main");
      body.empty();
      self.menuMainItemCreate('Projects', 'collection', function() {self.menuProjectsPop()});
      self.menuMainItemCreate('Settings', 'settings', function() {self.menuSettingsPop()});
    },

    menuSettingsPop() {
      let self = this;
      let body = $("#canvas-comments-menu-main");
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
            <div id="canvas-comments-menu-main"></div>
          </div>
          `);
      //Handle dragging and menu collapsing/showing
        self.container.draggable({
            handle: "#canvas-comments-menu-header",
            stop: function() {
              let left = parseFloat($(this).css('left')) / window.innerWidth;
              let top = parseFloat($(this).css('top')) / window.innerHeight;
              let url = "/api/v1/users/"+self.main.userId+"/custom_data/canvas_collaboration/"+self.main.courseId+"/menuPosition";
              $.put(url, {
                'ns': 'edu.btech.canvas-app',
                'data': {
                  'left': left,
                  'top': top
                } 
              })
              console.log(left);
              console.log(top);
            }
          });
        $("#canvas-comments-menu-header-toggle")
          .click(function () {
            $("#canvas-comments-menu-body").toggle();
          });
      //Hide all the stuff that doesn't need to be shown just yet
      $("#canvas-comments-menu-header-back").hide();
      $("#canvas-comments-menu-header-back").click(function() {
        $(this).hide();
        $("#canvas-comments-menu-header-toggle").show();
        self.menuMainPop();
      });
      $("#canvas-comments-menu-body").hide();
      $(".canvas-comments-input-background").hide();
      self.menuMainPop();
      //see if there's a currentProject,
      for (let i = 0; i < self.projects.length; i++) {
        let project = self.projects[i];
        if (project._id === self.main.currentProject) {
          self.menuTodosPop(project._id);
          $("#canvas-comments-menu-header-back").show();
          $("#canvas-comments-menu-header-toggle").hide();
          $("#canvas-comments-menu-body").show();
          return;
        }
      }
      //if not, set up the general projects menu
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

    async toggleTodo(todo, icon) {
      let self = this;
      if (icon.hasClass('icon-Solid')) { //it's checked, so uncheck it
        icon.removeClass('icon-Solid');
        todo.pages = await self.api.uncompleteTodoPage(todo._id, self.main.pageType, self.main.pageId);
      } else { //it's unchecked, so check it
        icon.addClass('icon-Solid');
        todo.pages = await self.api.completeTodoPage(todo._id, self.main.pageType, self.main.pageId);
      }
    },

    async menuTodosPop(projectId='') {
      let self = this;
      let body = $("#canvas-comments-menu-main");
      body.empty();
      let todos = [];
      //get the existing todos
      for (let i = 0; i < self.projects.length; i++) {
        let project  = self.projects[i];
        if (project._id === projectId) {
          todos = project.todos;
          for (let j = 0; j < todos.length; j++) {
            let todo = todos[j];
            if (todo.pageTypes.includes(self.main.pageType)) {
              console.log(todo);
              let todoElement = $(`
                <div projectId='`+todo._id+`' class="canvas-comments-menu-item"><i class="icon-publish"></i>`+todo.name+`</div>
              `);
              let currentPageData = {
                pageType: self.main.pageType,
                pageId: self.main.pageId,
              }
              let icon = todoElement.find('i');
              todoElement.appendTo(body);
              for (let k = 0; k < todo.pages.length; k++) {
                let pageData = todo.pages[k];
                if (pageData.pageType === currentPageData.pageType && pageData.pageId === currentPageData.pageId) {
                    console.log(pageData);
                    icon.addClass('icon-Solid');
                    console.log(icon.html());
                    break;
                }
              }
              todoElement.click(function() {
                self.toggleTodo(todo, icon);
              });
            }
          }
          break;
        }
      }
      //populate menu with todos

      //add a button for adding new todos
      self.createModalOpenMenuItem(body, "New Todo", function() {
        self.modal.newTodoInit(projectId);
      });
    },

    async menuProjectsPop() {
      let self = this;
      let body = $("#canvas-comments-menu-main");
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
          let url = "/api/v1/users/"+self.main.userId+"/custom_data/canvas_collaboration/"+self.main.courseId+"/currentProject";
          $.put(url, {
            'ns': 'edu.btech.canvas-app',
            'data': projectId
          })
        });
      }
      self.createModalOpenMenuItem(body, "New Project", function() {
        self.modal.newProjectInit();
      });
    },
  }