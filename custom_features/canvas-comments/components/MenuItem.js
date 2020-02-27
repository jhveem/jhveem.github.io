'use strict';
Vue.component('project-item', {
  template: `
      <div class="canvas-collaborator-menu-item"> 
        <div class="canvas-collaborator-submenu-toggle">
          <i class="icon-discussion-reply" @click.stop="showMenu=!showMenu;"></i>
          <project-menu v-show="showMenu" @click="showMenu=false">
            <div class="canvas-collaborator-submenu-item" @click="$emit('edit-project');">Edit</div>
            <div class="canvas-collaborator-submenu-item" @click="$emit('new-todo');">New Todo</div>
            <div class="canvas-collaborator-submenu-item canvas-collaborator-submenu-item-last" @click="$emit('delete-project');">Delete</div>
          </project-menu>
        </div>
        <div @click="if (project.data.todos.length > 0) toggle(project);">
          <div v-if="project.data.todos.length == 0"></div>
          <i v-else-if="project.collapsed" :class="'icon-mini-arrow-right'"></i>
          <i v-else :class="'icon-mini-arrow-down'"></i>
          {{project.data.name}}
        </div>
      </div>
    `,
  data: function() {
      return {
        showMenu: false,
    }
  },
  props: [
    'project',
    'pageType'
  ],
  methods: {
    toggle: async function(obj) {
      obj.collapsed = !obj.collapsed;
    },
  }
});
//<i class="icon-trash"></i>
Vue.component('todo-item', {
  template: `
    <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todos" @click="$emit('load-comments')">
      <div class="canvas-collaborator-submenu-toggle">
        <i class="icon-discussion-reply" @click.stop="showMenu=!showMenu;"></i>
        <project-menu v-show="showMenu">
          <div class="canvas-collaborator-submenu-item" @click="$emit('edit-todo');">Edit</div>
          <div class="canvas-collaborator-submenu-item" @click="$emit('delete-todo');">Delete</div>
        </project-menu>
      </div>
      <div>
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
    },
  }
})