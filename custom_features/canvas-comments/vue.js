let vueString = `<div id="vue-app" style="left: 0; top: 0;">
  <h3 class="collaborator-menu-header">{{header}}</h3>` +
  //main menu
  ``+
  //projects menu
  `
  <div v-if="menuCurrent ==='projects'">
    <div class="canvas-collaborator-menu-item" @click="openModal('new-project')">
      <i class="icon-add"></i>
      New Project
    </div>
    <div v-for="(project) in projectList">
      <div class="canvas-collaborator-menu-item"> 
        <div @click="" style="display: inline-block;">
          <i class="icon-collection"></i>
          <i class="icon-trash" @click="deleteProject(project.data)"></i>
          {{project.data.name}}
        </div>
        <div class="canvas-collaborator-menu-item-toggle-icon">
          <i v-if="project.collapsed" :class="'icon-mini-arrow-right'" @click="toggle(project)"></i>
          <i v-else :class="'icon-mini-arrow-down'" @click="toggle(project)"></i>
        </div>
      </div>
      <div v-if="!project.collapsed">
        <div class="canvas-collaborator-menu-item" @click="openModal('new-todo'); newTodoProject=project.data._id;">
          <i class="icon-add"></i>
          New Todo 
        </div>
        <div v-for="(todo, x) in project.data.todos">
          <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todos" v-if="todo.pageTypes.includes(pageType)||pageType==''" @click="openModal('edit-todo'); loadComments(todo); newTodoPageTypes=todo.pageTypes; newTodoName=todo.name;">
            <i v-if="checkResolvedTodoPage(todo, project)" class="icon-publish icon-Solid" @click="unresolveTodo(todo)"></i>
            <i v-else class="icon-publish" @click="resolveTodo(todo)"></i>
            <i class="icon-trash" @click="deleteTodo(todo)"></i>
            {{todo.name}}
          </div>
        </div>
      </div>
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
          <div v-for="pageType in pageTypes">
            <input type="checkbox" v-model="newTodoPageTypes" :value="pageType"/> <label> {{pageType}}</label>
          </div>
          <br>
          <div class="canvas-collaborator-button" @click="createTodo(); closeModal();">Save</div>
        </div> 
        <div v-if="checkModal('edit-todo')">
          <h2>Create Project</h2>
          <label>Name</label>
          <input type="text" v-model="newTodoName" />
          <div v-for="pageType in pageTypes">
            <input type="checkbox" v-model="newTodoPageTypes" :value="pageType"/> <label> {{pageType}}</label>
          </div>
          <br>
          <label>Comment</label>
          <input type="text" v-model="newCommentText" />
          <div class="canvas-collaborator-button" @click="createComment();">Comment</div>
        </div> 
      </div>
    </div>
  </div> 
</div>`
+``;
$('#main').css("margin-right", "300px");
$('#main').append('<div id="canvas-collaborator-container" style="display: block; position: absolute; top: 0%; right: -300px; width: 300px;"></div>');
$("#canvas-collaborator-container").append(vueString);
class MenuItem {
  constructor(name, icon='', action=function(){}, submenu=[]) {
    this.name = name;
    this.action = action;
    this.collapsed = true;
    this.submenu = submenu;
    this.icon = '';
    if (icon !== '') {
      this.icon = 'icon-' + icon;
    }
  }
  toggle() {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {

    } else {

    }
  }
}
let APP = new Vue({
  el: '#vue-app',
  created: async function() {
    this.menuItems = this.menus.main;
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

    //get all projects for this course and add them to the menu
    /*
    for (let _id in this.projects) {
      let project = this.projects[_id];
      console.log(project);
      this.menus[project._id + "-todos"] = [];
      let submenu = this.menus[project._id + "-todos"];
      this.menus.projects.push(new MenuItem(project.name, 'collection', function(){}, submenu));
      for (let t = 0; t < project.todos.length; t++) {
        let todo = project.todos[t];
        submenu.push(new MenuItem(todo.name, '', function() {}, todo.name+'-comments'));
      }
      console.log(project.todos);
    }
    */
  },
  mounted: async function() {
    await this.loadProjects();
  },
  data: function() { 
    let APP = this;
    return {
      modal: '',
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
      projects: {
        'test': 'test',
        'test1': 'test1'
      },
      pageTypes: [
        'quizzes',
        'assignments',
        'pages',
        'project level'
      ],
      projectList: [],
      newProjectName: '',
      newTodoName: '',
      newTodoPageTypes: [],
      newTodoProject: '',
      newCommentText: '',
      newCommentTodo: '',
      menus: {
        main: [
          new MenuItem('Projects', 'collection', function(){APP.goto('projects')}),
          new MenuItem('Settings', 'settings', function(){APP.goto('projects')}),
        ],
        projects: [
          new MenuItem('New Project', 'add', function(){}),
        ],
      }
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
      console.log(projects);
      for (let p = 0; p < projects.length; p++) {
        let project = projects[p];
        this.updateProjectInList(project);
      }
      console.log(this.projectList);
    },
    updateProjectInList(project) {
        let data = {'collapsed': true, 'data': project};
        let exists = false;
        for (let i =0; i < this.projectList.length; i++) {
          let checkProject = this.projectList[i];
          if (checkProject.data._id === project._id) {
            checkProject.data = project;
            exists = true;
          }
        }
        if (exists === false) {
          this.projectList.push(data);
        }
    },
    async createProject() {
      let project = await this.api.createProject(this.courseId, this.newProjectName);
      this.updateProjectInList(project);
    },
    async deleteProject(project) {
      await this.api.deleteProject(project._id);
      //remove project from list
      for (let i =0; i < this.projectList.length; i++) {
        let checkProject = this.projectList[i];
        if (project._id === checkProject.data._id) {
          this.projectList.splice(i, 1);
          break;
        }
      }
    },
    checkResolvedTodoPage(todo) {
      for (let p = 0; p < todo.pages.length; p++) {
        let page = todo.pages[p];
        if (page.pageType === this.pageType && page.pageId === this.pageId) {
          return true;
        }
      }
      return false;
    },
    async createTodo() {
      newTodoProject = this.newTodoProject;
      let todo = await this.api.createTodo(this.newTodoProject, this.newTodoName, this.newTodoPageTypes);
      for (let i =0; i < this.projectList.length; i++) {
        let project = this.projectList[i];
        console.log(project.data._id);
        console.log(newTodoProject);
        if (newTodoProject === project.data._id) {
          console.log("ADD");
          project.data.todos.push(todo);
          break;
        }
      }
      console.log(todo);
    },
    resolveTodo: async function(todo) {
      let pages = await this.api.resolveTodoPage(todo._id, this.pageType, this.pageId);
      this.$set(todo, 'pages', pages);
    },
    unresolveTodo: async function(todo) {
      let pages = await this.api.unresolveTodoPage(todo._id, this.pageType, this.pageId);
      this.$set(todo, 'pages', pages);
    },
    async deleteTodo(todo) {
      let project = await this.api.deleteTodoPage(todo._id);
      console.log(project);
      this.updateProjectInList(project);
    },
    async loadComments(todo) {
      let comments = await this.api.getComments(todo._id);
      this.newCommentTodo = todo._id;
      console.log(comments);
    },
    async createComment() {
      let comments = await this.api.createComment(this.newCommentTodo, this.newCommentText);
      this.newCommentText = '';
      console.log(comments);
    },
    toggle: async function(obj) {
      obj.collapsed = !obj.collapsed;
    },
    openModal(name) {
      this.modal=name;
    },
    checkModal(name) {
      return this.modal===name;
    },
    closeModal() {
      this.modal = '';
      this.newTodoProject = '';
      this.newTodoName = '';
      this.newTodoPageTypes = [];
      this.newProjectName = '';
      this.newCommentTodo = '';
    },
  },
});