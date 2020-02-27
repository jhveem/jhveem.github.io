let vueString = `<div id="vue-app">
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
      <project-item 
          :project="project"
          @new-todo="openModal('new-todo'); newTodoProject=project.data._id;" 
          @delete-project="deleteProject(project.data);"
        >
      </project-item>
      <div v-if="!project.collapsed">
        <div v-for="(todo, x) in project.data.todos">
          <todo-item 
              v-if="todo.pageTypes.includes(pageType)||pageType==''" 
              :pageType="pageType" 
              :pageId="pageId" 
              :todo="todo" 
              @edit-todo="openModal('edit-todo'); newCommentTodo=todo._id; newTodoPageTypes=todo.pageTypes; newTodoName=todo.name;" 
              @resolve-todo="resolveTodo(todo);" 
              @unresolve-todo="unresolveTodo(todo);" 
              @delete-todo="deleteTodo(todo);" newTodoPageTypes=todo.pageTypes; newTodoName=todo.name;"
              @load-comments="loadComments(todo);"
            >
          </todo-item>
          <div v-if="todo.loadedComments !== undefined">
            <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-comment" v-for="(comment, x) in todo.loadedComments">
              <i class="icon-discussion"></i>
              <p>{{comment.text}}</p>
              <p style="width: 100%; text-align=right; box-sizing=border-box;">{{comment.user}}-{{formatDate(comment.date)}}</p>
            </div>
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
let canvasbody = $("#application");
canvasbody.css("margin-right", "300px");
//Look at doing an html import using https://www.w3schools.com/howto/howto_html_include.asp
//This could be useful once it's life and it's no longer more convenient to have auto updates from tampermonkey
//OR once it's all hosted on my site and on github, then updates will be instant as well
canvasbody.after('<div id="canvas-collaborator-container"></div>');
$('#left-side').append("<a id='canvas-collaborator-toggler' class='btn'>Collaborator</a>")
$("#canvas-collaborator-toggler").click(function() {
  let mRight = canvasbody.css("margin-right");
  if (mRight === "300px") {
    canvasbody.css("margin-right", "0px");
    $("#canvas-collaborator-container").hide();
  }
  if (mRight === "0px") {
    canvasbody.css("margin-right", "300px");
    $("#canvas-collaborator-container").show();
  }
});
//$('#main').css("margin-right", "300px");
//$('#main').append('<div id="canvas-collaborator-container" style="display: block; position: absolute; top: 0%; right: -300px; width: 300px;"></div>');
$("#canvas-collaborator-container").append(vueString);
let APP = new Vue({
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
      newCommentTodo: ''
    }
  },
  methods: {
    formatDate(dateString) {
      let date = "HI";
      return date;
    },
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
    async createTodo() {
      newTodoProject = this.newTodoProject;
      let todo = await this.api.createTodo(this.newTodoProject, this.newTodoName, this.newTodoPageTypes);
      for (let i =0; i < this.projectList.length; i++) {
        let project = this.projectList[i];
        if (newTodoProject === project.data._id) {
          project.data.todos.push(todo);
          break;
        }
      }
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
      this.updateProjectInList(project);
    },
    async loadComments(todo) {
      let comments = await this.api.getComments(todo._id);
      console.log(todo.loadedComments);
      this.$set(todo, 'loadedComments', comments);
    },
    async createComment() {
      let comments = await this.api.createComment(this.newCommentTodo, this.newCommentText);
      this.newCommentText = '';
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