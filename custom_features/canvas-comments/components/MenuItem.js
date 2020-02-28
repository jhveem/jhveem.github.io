'use strict';
//look at this for emits with multiple arguments. I hope I haven't broken this... :D
//https://stackoverflow.com/questions/49729384/vue-emit-passing-argument-to-a-function-that-already-have-arguments
Vue.component('project-item', {
  template: `
    <div>
      <div class="canvas-collaborator-menu-item" @click="$emit('edit-project');"> 
        <div class="canvas-collaborator-submenu-delete">
          <i class="icon-trash" @click.stop="$emit('delete-project');"></i>
        </div>
        <div>
          <i v-if="project.collapsed" :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle');"></i>
          <i v-else :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle');"></i>
          <b>{{project.data.name}}</b>
        </div>
      </div>
      <div v-if="!collapsed">
        <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todo" @click="openModal('new-todo'); newTodoProject=project.data._id;">
          <i class="icon-add"></i>
          New Todo 
        </div>
        <div v-for="(todo, x) in todos" :key="x">
          <todo-item 
              v-if="todo.pageTypes.includes(pageType)||pageType==''" 
              :pageType="pageType" 
              :pageId="pageId" 
              :todo="todo" 
              @edit-todo="openModal('edit-todo'); newTodoPageTypes=todo.pageTypes; newTodoName=todo.name;" 
              @resolve-todo="resolveTodo(todo);" 
              @unresolve-todo="unresolveTodo(todo);" 
              @delete-todo="deleteTodo(todo);"
              @toggle-comments="toggleComments(todo);"
              @load-comments="loadComments(todo);"
            >
          </todo-item>
        </div>
      </div>
    </div>
    `,
  data: function() {
    return {
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      showMenu: false,
      pageType: '',
      pageId: ''
    }
  },
  props: [
    'project',
    'todos',
    'collapsed'
  ],
  created: function() {
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

  },
  methods: {
    toggle: async function(obj) {
      obj.collapsed = !obj.collapsed;
    },
  }
});
//<i class="icon-trash"></i>
Vue.component('todo-item', {
  template: `
    <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todo" @click="$emit('edit-todo');">
      <div class="canvas-collaborator-submenu-delete">
        <i class="icon-trash" @click.stop="$emit('delete-todo');"></i>
      </div>
      <div>
        <i v-if="todo.collapsed" :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle-comments')"></i>
        <i v-else :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle-comments')"></i>
        <i v-if="checkResolvedTodoPage(todo)" class="icon-publish icon-Solid" @click.stop="$emit('unresolve-todo');"></i>
        <i v-else class="icon-publish" @click.stop="$emit('resolve-todo');"></i>
        {{todo.name}}
      </div>
    </div>
  `,
  created: function() {
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

  },
  data: function() {
    return {
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      showMenu: false,
      pageType: '',
      pageId: ''
    }
  },
  props: [
    'todo',
    'project',
  ],
  methods: {
    checkResolvedTodoPage(todo, pageType, pageId) {
      for (let p = 0; p < todo.pages.length; p++) {
        let page = todo.pages[p];
        if (page.pageType === this.pageType && page.pageId === this.pageId) {
          return true;
        }
      }
      return false;
    }
  }
})