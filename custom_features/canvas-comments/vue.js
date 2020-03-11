MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
let vueString = `<div id="vue-app">
  <div>
  <i class="icon-settings" style="float: right; margin-right: 20px; padding-top: 10px; cursor: pointer;" @click="openModal('settings');"></i>
  <h3 class="collaborator-menu-header">{{header}}</h3>
  </div>
  ` +
  //main menu
  ``+
  //projects menu
  `
  <div v-if="menuCurrent ==='projects'">
    <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-new" @click="openModal('new-project')">
      <i class="icon-add"></i>
      New Project
    </div>
    <div v-for="(project) in loadedProjects">
      <project-item 
        :project="project"
        :open-tabs="openTabs"
        :todos="project.loadedTodos"
        :user-names="userNames"
        :settings="userSettings"
        @toggle="toggle($event);"
        @delete-project="deleteProject(project);"
        @edit-project="openModal('edit-project', $event);"
        @new-todo="openModal('new-todo', project); modalTodoProject = project;"
        @edit-todo="openModal('edit-todo', $event); modalTodoProject = project;"
        @delete-todo="deleteTodo($event);"
        @resolve-todo="resolveTodo($event);"
        @unresolve-todo="unresolveTodo($event);"
        @new-comment="openModal('new-comment', $event); newCommentTodo=$event._id;"
        @delete-comment="deleteComment($event['todo'], $event['comment']);"
      >
      </project-item>
    </div>
  </div>
  `+`
  <div v-show="modal!==''">
    <div class='canvas-collaborator-modal-background'>
      <div id='canvas-collaborator-modal' class='canvas-collaborator-modal'>
        <i style="float: right; cursor: pointer;" class="icon-end" @click="closeModal()"></i>
        <div v-if="checkModal('new-project')">
          <h2>Create Project</h2>
          <label>Name</label>
          <input type="text" v-model="newProjectName"></input>
          <div class="canvas-collaborator-button" @click="createProject(); closeModal();">Save</div>
        </div>
        <div v-if="checkModal('edit-project')">
          <edit-project
            :project="modalObject"
          >
          </edit-project>
        </div>
        <div v-if="checkModal('new-todo')">
          <new-todo
            :current-page-type="pageType"
            :page-types="pageTypes"
            :page-id="pageId"
            :user-names="userNames"
            :project="modalTodoProject"
            :project-members="projectMembers"
            :project-tags="modalTodoProject.tags"
            @create-todo="createTodo($event); closeModal();"
          >
          </new-todo>
        </div> 
        <div v-if="checkModal('edit-todo')">
          <edit-todo 
            :current-page-type="pageType"
            :todo="modalObject"
            :page-types="pageTypes"
            :page-id="pageId"
            :user-names="userNames"
            :project="modalTodoProject"
            :project-members="projectMembers"
            :project-tags="modalTodoProject.tags"
          >
          </edit-todo>
        </div>
        <div v-if="checkModal('new-comment')">
          <h2>Comment</h2>
          <textarea type="text" style="height: 200px;" v-model="newCommentText" />
          <div class="canvas-collaborator-button" @click="createComment(modalObject); closeModal();">Comment</div>
        </div> 
        <div v-if="checkModal('settings')">
          <settings
            :settings="userSettings"
          >
          </settings>
        </div>
      </div>
    </div>
  </div> 
</div>`
+``;
let canvasbody = $("#application");
//Look at doing an html import using https://www.w3schools.com/howto/howto_html_include.asp
//This could be useful once it's life and it's no longer more convenient to have auto updates from tampermonkey
//OR once it's all hosted on my site and on github, then updates will be instant as well
canvasbody.after('<div id="canvas-collaborator-container"></div>');
$('#left-side').append("<a id='canvas-collaborator-toggler' class='btn'>Collaborator</a>")
$("#canvas-collaborator-toggler").click(function() {
  APP.toggleWindow();
});
$("#canvas-collaborator-container").hide();
//$('#main').css("margin-right", "300px");
//$('#main').append('<div id="canvas-collaborator-container" style="display: block; position: absolute; top: 0%; right: -300px; width: 300px;"></div>');
$("#canvas-collaborator-container").append(vueString);
APP = new Vue({
  el: '#vue-app',
  mounted: async function() {
    //get information from the url
    if (this.rPagesURL.test(window.location.pathname)) {
      //page specific menu
      let pieces = window.location.pathname.match(this.rPagesURL);
      this.courseId = parseInt(pieces[1]);
      this.pageType = pieces[2];
      this.pageId = pieces[3];
    } else if (this.rMainURL.test(window.location.pathname)) {
      //not in a specific page
      let pieces = window.location.pathname.match(this.rMainURL);
      this.courseId = parseInt(pieces[1]);
    }
    //this.loadSettings();
    let settingsGeneralData = await this.api.loadSettingsGeneral(this.userId);
    if (settingsGeneralData !== undefined) {
      let settingsGeneral = settingsGeneralData.data; 
      if (settingsGeneral.showMenu !== undefined) {
        let showMenu = (settingsGeneral.showMenu === "true");
        this.toggleWindow(showMenu);
      }
      if (settingsGeneral.userSettings !== undefined) {
        this.userSettings = settingsGeneral.userSettings;
        for (var setting in this.userSettings) {
          let value = this.userSettings[setting];
          if (value === "true") {
            this.userSettings[setting] = true;
          } 
          if (value === "false") {
            this.userSettings[setting] = false;
          } 
        }
      }
    }

    let settingsCourseData = await this.api.loadSettingsCourse(this.userId, this.courseId);
    if (settingsCourseData !== undefined) {
      let settingsCourse = settingsCourseData.data; 
      if (settingsCourse.openTabs !== undefined && settingsCourse.openTabs !== '') {
        this.openTabs = settingsCourse.openTabs;
      }
    }
    /* This needs to happen async so the stuff that matters isn't caught up on it
    this.canvasQuizzes = await this.api.getCourseQuizzes(this.courseId);
    this.canvasPages = await this.api.getCoursePages(this.courseId);
    this.canvasAssignments = await this.api.getCourseAssignments(this.courseId);
    */
    await this.loadProjects();
    for (let i = 0; i < this.projectMembers.length; i++) {
      let userId = this.projectMembers[i];
      this.loadUserName(userId);
    }
    this.$set(this, 'pageTypes', this.pageTypes);
    $("#canvas-collaborator-modal").draggable();

    //get page/quiz/assignment info for progress data
  },
  data: function() { 
    return {
      userSettings: {
        showResolved: true, 
      },
      openTabs: [],
      canvasQuizzes: [],
      canvasPages: [],
      canvasAssignments: [],
      modal: '',
      userNames: {},
      userId: ENV.current_user_id,
      menuCurrent: "projects",
      currentProject: null,
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      api: CANVAS_COMMENTS_API,
      pageType: '',
      pageId: '',
      header: 'projects',
      menuItems: [],
      loadedProjects: [],
      pageTypes: { 
        quizzes: 'quizzes',
        assignments: 'assignments',
        pages: 'pages'
      },
      modalObject: {},
      newProjectName: '',
      modalTodoProject: {},
      newTodoName: '',
      newTodoPageTypes: [],
      newTodoProject: '',
      projectTags: [],
      newTodoAssignments: [],
      newCommentText: '',
      newCommentTodo: '',
      projectMembers: [
        '1893418', //Josh 
        '1864953', //Danni
        '1891741', //Katie
        '1638854', //Mason
        '1922029', //Makenzie
        '1807337', //Jon
      ]
    }
  },
  methods: {
    goto: function(menuName) {
      this.menuCurrent = menuName;
      this.menuItems = this.menus[menuName];
      this.header = menuName;
    },
    loadProjects: async function() {
      let projects = await this.api.getProjects(this.courseId);
      for (let p in projects) {
        let project = projects[p];
        if (project.tags === undefined) {
          project['tags'] = {};
        }
      }
      this.updateProjectList(projects);
    },
    updateProjectList(projects) {
      for (let p = 0; p < projects.length; p++) {
        let project = projects[p];
        this.updateProjectInList(project);
      }
    },
    updateProjectInList(project) {
      let exists = false;
      for (let i =0; i < this.loadedProjects.length; i++) {
        let checkProject = this.loadedProjects[i];
        if (checkProject._id === project._id) {
          for (let key in project) {
            this.$set(checkProject, key, project[key]);
          }
          exists = true;
        }
      }
      //might be able to get rid of this, because we're no longer adding additional variable of collapsed, so we can read straight from the projects variable
      if (exists === false) {
        project.loadedTodos = [];
        this.loadedProjects.push(project);
        this.setProjectTodos(project);
      }
    },
    async createProject() {
      let project = await this.api.createProject(this.courseId, this.newProjectName);
      this.updateProjectInList(project);
    },
    async updateProject(project) {
      //possible base this off of modal object
      let updatePackage = {
        name: project.name,
      };
      await this.api.updateProject(project._id, updatePackage);
    },
    async deleteProject(project) {
      await this.api.deleteProject(project._id);
      //remove project from list
      for (let i =0; i < this.loadedProjects.length; i++) {
        let checkProject = this.loadedProjects[i];
        if (project._id === checkProject._id) {
          this.loadedProjects.splice(i, 1);
          break;
        }
      }
    },
    async setProjectTodos(project) {
      let todos = await this.getTodos(project);
      for (let t = 0; t < todos.length; t++) {
        let todo = todos[t];
        todo['loadedComments'] = [];
      }
      this.$set(project, 'loadedTodos', todos);
    },
    async getTodos(project) {
      let todos;
      if (this.pageType !== '') {
        todos = await this.api.getTodosPage(project._id, this.pageType, this.pageId);
      } else {
        todos = await this.api.getTodosProject(project._id);
      }
      for (let t in todos) {
        let todo = todos[t];
        this.calcTodoProgress(todo);
      }
      return todos;
    },
    async createTodo(todoData) {
      let pageId = '';
      if (todoData.pageSpecific) {
        pageId = this.pageId; 
        todoData.pageTypes = [this.pageType];
      }
      let todo = await this.api.createTodo(todoData.projectId, todoData.name, todoData.pageTypes, todoData.assignments, pageId);
      todo.loadedComments = [];
      for (let i =0; i < this.loadedProjects.length; i++) {
        let project = this.loadedProjects[i];
        if (todoData.projectId === project._id) {
          project.loadedTodos.push(todo);
          break;
        }
      }
    },
    async updateTodo(todo) {
      //possible base this off of modal object
      if (todo.pageSpecific) {
        todo.pageTypes = [this.pageType];
        todo.pageId = this.pageId;
      } else {
        todo.pageId = '';
      }
      let updatePackage = {
        name: todo.name,
        assignments: todo.assignments,
        pageTypes: todo.pageTypes,
        pageId: todo.pageId,
        tags: todo.tags
      };
      await this.api.updateTodo(todo._id, updatePackage);
    },
    async assignTodo(todo, assignments) {
      await this.api.assignTodo(todo._id, assignments)
      todo.assignments.push(assigments);
      this.$set(todo, 'assignments', todo.assignments);
    },
    async resolveTodo(todo) {
      await this.api.resolveTodoPage(todo._id, this.pageType, this.pageId);
      todo.pages.push({'pageType': this.pageType, 'pageId': this.pageId});
    },
    async unresolveTodo(todo) {
      await this.api.unresolveTodoPage(todo._id, this.pageType, this.pageId);
      for (let p = 0; p < todo.pages.length; p++) {
        let page = todo.pages[p];
        if (page.pageType === this.pageType && page.pageId === this.pageId) {
          todo.pages.splice(p, 1);
          break;
        }
      }
    },
    async calcTodoProgress(todo) {
      let counts = {};
      counts['quizzes'] = (this.canvasQuizzes.length);
      counts['pages'] = (this.canvasPages.length);
      counts['assignments'] = (this.canvasAssignments.length);
      let resolved = {};
      resolved['quizzes'] = 0;
      resolved['pages'] = 0;
      resolved['assignments'] = 0;
      let total = 0;
      let resolvedTotal = 0;
      for (let pd in todo.pages) {
        let pageData = todo.pages[pd];
        resolved[pageData.pageType] += 1;
      }
      for (let p in todo.pageTypes) {
        let type = todo.pageTypes[p];
        total += counts[type];
        resolvedTotal += resolved[type];
      }
      todo.progress = ((resolvedTotal / total) * 100).toFixed(2);
    },
    async deleteTodo(todo) {
      //some kind of check to make sure this worked
      for (let p = 0; p < this.loadedProjects.length; p++) {
        let project = this.loadedProjects[p];
        if (project._id === todo.projectId) {
          let todos = project.loadedTodos;
          for (let t = 0; t < todos.length; t++) {
            if (todos[t]._id === todo._id) {
              todos.splice(t, 1);
              break;
            }
          }
          break;
        }
      }
      await this.api.deleteTodo(todo._id);
    },
    async loadUserName(userId) {
      let userName = '';
      if (this.userNames[userId] === undefined) {
        userName = await this.api.getUserName(userId);
        this.userNames[userId] = userName;
      }
    },
    async setUserName(comment) {
      if (this.userNames[comment.user] === undefined) {
        comment.userName = await this.api.getUserName(comment.user);
        this.userNames[comment.user] = comment.userName;
      } else {
        comment.userName = this.userNames[comment.user];
      }
      return;
    },
    async loadComments(todo) {
      let comments = await this.api.getComments(todo._id, this.pageType, this.pageId);
      for (let c = 0; c < comments.length; c++) {
        let comment = comments[c];
        await this.setUserName(comment);
      }
      this.$set(todo, 'loadedComments', comments);
    },
    async createComment(todo) {
      let comment = await this.api.createComment(this.newCommentTodo, this.newCommentText, this.pageType, this.pageId);
      await this.setUserName(comment);
      if (todo.loadedComments === undefined) {
        todo.loadedComments = [];
      }
      todo.loadedComments.push(comment);
      this.newCommentText = '';
    },
    async deleteComment(todo, comment) {
      for (let t = 0; t < todo.loadedComments.length; t++) {
        let checkComment = todo.loadedComments[t];
        if (comment._id === checkComment._id) {
          todo.loadedComments.splice(t, 1);
        }
      }
    },
    async toggle(obj) {
      if (this.openTabs.includes(obj._id)) { //if it's already open, remove it
        this.openTabs = this.openTabs.filter(function(e) { return e !== obj._id });
      } else { //add it
        this.openTabs.push(obj._id);
      }
      this.api.saveSettingCourse(this.userId, this.courseId, 'openTabs', this.openTabs);
    },
    openModal(name, modalObject) {
      this.modal=name;
      this.modalObject = modalObject;
      if (name === 'edit-todo') {
        this.modalObject.pageSpecific = !(modalObject.pageId === '');
      }
    },
    checkModal(name) {
      return this.modal===name;
    },
    closeModal() {
      if (this.modal === 'edit-project') {
        this.updateProject(this.modalObject);
      }
      if (this.modal === 'edit-todo') {
        this.updateTodo(this.modalObject);
      }
      if (this.modal === 'settings') {
        this.api.saveSettingGeneral(this.userId, 'userSettings', this.userSettings);
      }
      this.modalObject = {};
      this.modal = '';
      this.newTodoName = '';
      this.newTodoPageTypes = [];
      this.newProjectName = '';
      this.newCommentTodo = '';
      this.newTodoAssignments = [];
    },  
    toggleWindow(show=null) {
      let canvasbody = $("#application");
      if (show === null) {
        let mRight = canvasbody.css("margin-right");
        if (mRight === "300px") {
          show = false;
        }
        if (mRight === "0px") {
          show = true;
        }
      }
      this.api.saveSettingGeneral(this.userId, 'showMenu', show);
      if (!show) {
        canvasbody.css("margin-right", "0px");
        $("#canvas-collaborator-container").hide();
      }
      if (show) {
        canvasbody.css("margin-right", "300px");
        $("#canvas-collaborator-container").show();
      }
    }
  },

});