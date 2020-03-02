MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
let vueString = `<div id="vue-app">
  <h3 class="collaborator-menu-header">{{header}}</h3>` +
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
          :todos="project.loadedTodos"
          :collapsed="project.collapsed"
          :user-names="userNames"
          @toggle="toggle(project);"
          @delete-project="deleteProject(project);"
          @edit-project="openModal('edit-project', $event);"
          @new-todo="openModal('new-todo', project); newTodoProject=project._id;"
          @edit-todo="openModal('edit-todo', $event);"
          @delete-todo="deleteTodo($event);"
          @resolve-todo="resolveTodo($event);"
          @unresolve-todo="unresolveTodo($event);"
          @toggle-comments="toggleComments($event);"
          @new-comment="openModal('new-comment', $event); newCommentTodo=$event._id;"
          @delete-comment="deleteComment($event['todo'], $event['comment']);"
        >
      </project-item>
    </div>
  </div>
  `+`
  <div v-if="modal!==''">
    <div class='canvas-collaborator-modal-background'>
      <div class='canvas-collaborator-modal'>
        <i style="float: right; cursor: pointer;" class="icon-end" @click="closeModal()"></i>
        <div v-if="checkModal('new-project')">
          <h2>Create Project</h2>
          <label>Name</label>
          <input type="text" v-model="newProjectName"></input>
          <div class="canvas-collaborator-button" @click="createProject(); closeModal();">Save</div>
        </div>
        <div v-if="checkModal('new-todo')">
          <h2>Create Project</h2>
          <label>Name</label>
          <input type="text" v-model="newTodoName" />
          <chosen-select :default="pageType" data-placeholder="View on page type..." class="canvas-collaborator-chosen-select" v-model="newTodoPageTypes" multiple>
            <option v-for="pageType in pageTypes" :value="pageType">{{pageType}}</option>
          </chosen-select>
          <chosen-select data-placeholder="Assign to..." v-model="newTodoAssignments" multiple>
            <option v-for="user in projectMembers" :value="user">{{userNames[user]}}</option>
          </chosen-select>
          <br>
          <div class="canvas-collaborator-button" @click="createTodo(); closeModal();">Save</div>
        </div> 
        <div v-if="checkModal('edit-project')">
          <edit-project
            :project="modalObject"
            >
          </edit-project>
        </div>
        <div v-if="checkModal('edit-todo')">
          <edit-todo 
            :todo="modalObject"
            :page-types="pageTypes"
            :user-names="userNames"
            :project-members="projectMembers"
            >
          </edit-todo>
        </div>
        <div v-if="checkModal('new-comment')">
          <h2>Comment</h2>
          <textarea type="text" style="height: 200px;" v-model="newCommentText" />
          <div class="canvas-collaborator-button" @click="createComment(modalObject); closeModal();">Comment</div>
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
  created: async function() {

  },
  mounted: async function() {
    //get information from the url
    if (this.rPagesURL.test(window.location.pathname)) {
      //page specific menu
      let pieces = window.location.pathname.match(this.rPagesURL);
      this.courseId = parseInt(pieces[1]);
      this.pageType = pieces[2];
      this.pageId = pieces[3];
      //await self.getSavedSettings();
    } else if (this.rMainURL.test(window.location.pathname)) {
      //not in a specific page
      let pieces = window.location.pathname.match(this.rMainURL);
      this.courseId = parseInt(pieces[1]);
      //await self.getSavedSettings();
    }
    //this.loadSettings();
    let settingsGeneralData = await this.api.loadSettingsGeneral(this.userId);
    let settingsGeneral = settingsGeneralData.data; 
    if (settingsGeneral.showMenu !== undefined) {
      let showMenu = (settingsGeneral.showMenu === "true");
      this.toggleWindow(showMenu);
    }
    this.api.loadSettingsCourse(this.userId);
    await this.loadProjects();
    for (let i = 0; i < this.projectMembers.length; i++) {
      let userId = this.projectMembers[i];
      this.loadUserName(userId);
    }
    this.$set(this, 'pageTypes', this.pageTypes);
  },
  data: function() { 
    return {
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
      pageTypes: [
        'quizzes',
        'assignments',
        'pages',
        'project level'
      ],
      modalObject: {},
      newProjectName: '',
      newTodoName: '',
      newTodoPageTypes: [],
      newTodoProject: '',
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
      //if this is the first time loading this project, get its todos and set its collapsed to tru
      if (exists === false) {
        project.loadedTodos = [];
        project.collapsed = true;
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
        todo['collapsed'] = true;
        todo['loadedComments'] = [];
      }
      this.$set(project, 'loadedTodos', todos);
    },
    async getTodos(project) {
      let todos = await this.api.getTodos(project._id);
      return todos;
    },
    async createTodo() {
      let newTodoProject = this.newTodoProject; //set because it gets voided before await createTodo finishes
      let todo = await this.api.createTodo(this.newTodoProject, this.newTodoName, this.newTodoPageTypes, this.newTodoAssignments);
      todo.collapsed = true;
      for (let i =0; i < this.loadedProjects.length; i++) {
        let project = this.loadedProjects[i];
        if (newTodoProject === project._id) {
          project.loadedTodos.push(todo);
          break;
        }
      }
    },
    async updateTodo(todo) {
      //possible base this off of modal object
      let updatePackage = {
        name: todo.name,
        pageTypes: todo.pageTypes,
        assignments: todo.assignments
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
    async toggleComments(todo) {
      this.$set(todo, 'collapsed', !todo.collapsed);
      if (todo.collapsed === false) {
        if (todo.loadedComments.length === 0) {
          this.loadComments(todo);
        }
      }
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
    toggle: async function(obj) {
      obj.collapsed = !obj.collapsed;
    },
    openModal(name, modalObject) {
      this.modal=name;
      this.modalObject = modalObject;
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
      this.modalObject = {};
      this.modal = '';
      this.newTodoProject = '';
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