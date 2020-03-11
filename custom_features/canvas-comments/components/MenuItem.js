'use strict';
//look at this for emits with multiple arguments. I hope I haven't broken this... :D
//https://stackoverflow.com/questions/49729384/vue-emit-passing-argument-to-a-function-that-already-have-arguments
Vue.component('project-item', {
  template: `
    <div>
      <div>
      <div style="border-left: 10px solid #49E" class="canvas-collaborator-menu-item canvas-collaborator-menu-item-project" @click="$emit('edit-project', project);"> 
        <div class="canvas-collaborator-submenu-delete">
          <i class="icon-trash" @click.stop="$emit('delete-project');"></i>
        </div>
        <div>
          <i v-if="openTabs.includes(project._id)" :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle', project);"></i>
          <i v-else :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle', project);"></i>
          <b>{{project.name}}</b>
        </div>
      </div>

      <div v-if="openTabs.includes(project._id)">
        <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-new canvas-collaborator-menu-item-todo" @click="$emit('new-todo');">
          <i class="icon-add"></i>
          New To Do 
        </div>
        <div v-for="(todo, x) in project.loadedTodos" :key="x">
          <todo-item 
            v-if="settings.showResolved || (!settings.showResolved && !checkResolvedTodoPage(todo, pageType, pageId))"
            :todo="todo" 
            :settings="settings"
            :open-tabs="openTabs"
            @edit-todo="$emit('edit-todo', todo);" 
            @resolve-todo="$emit('resolve-todo', todo);" 
            @unresolve-todo="$emit('unresolve-todo', todo);" 
            @delete-todo="$emit('delete-todo', todo);"
            @toggle="$emit('toggle', $event);"
            @load-comments="loadComments(todo);"
            @new-comment="$emit('new-comment', $event);"
            @delete-comment="$emit('delete-comment', $event);"
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
    'collapsed',
    'openTabs',
    'settings'
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
});
//<i class="icon-trash"></i>
Vue.component('todo-item', {
  template: `
  <div>
    <div v-bind:class="{'canvas-collaborator-menu-item-assigned': isAssigned}" class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todo" @click="$emit('edit-todo');">
      <div class="canvas-collaborator-submenu-delete">
        <i class="icon-trash" @click.stop="$emit('delete-todo');"></i>
      </div>
      <div>
        <i v-if="openTabs.includes(todo._id)" :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle', todo)"></i>
        <i v-else :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle', todo)"></i>
        <i v-if="checkResolvedTodoPage(todo)" class="icon-publish icon-Solid" @click.stop="$emit('unresolve-todo');"></i>
        <i v-else class="icon-publish" @click.stop="$emit('resolve-todo');"></i>
        {{todo.name}}
      </div>
    </div>
    <div v-if="openTabs.includes(todo._id)">
      <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-new canvas-collaborator-menu-item-new-comment" @click="$emit('new-comment', todo);">
        <i class="icon-add"></i>
        New Comment 
      </div>
      <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-border canvas-collaborator-menu-item-comment" v-for="(comment, x) in todo.loadedComments">
        <comment-item :todo="todo" :comment="comment"
            @delete-comment="$emit('delete-comment', $event);"
          ></comment-item>
      </div>
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
  computed: {
    isAssigned: function() {
      if (this.todo.assignments === null) {
        this.todo.assignments = [''];
      }
      return this.todo.assignments.includes(ENV.current_user_id);
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
    'openTabs'
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

Vue.component('comment-item', {
  template: `
    <div>
        <i class="icon-edit" style="float: right;"></i>
        <i class="icon-trash" style="float: right;" @click="$emit('delete-comment', {'comment': comment, 'todo': todo});"></i>
        <p>{{comment.text}}</p>
        <div style="float: right; font-size: 9px;">
          -{{comment.userName}}<br>{{formatDate(comment.date)}}
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
    'todo',
    'comment',
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
    formatDate(dateString) {
      let date = new Date(dateString);
      let output = date.getDate() + " " + MONTH_NAMES_SHORT[date.getMonth()] + ", " + date.getFullYear();
      return output;
    },
  }
});

Vue.component('settings', {
  template: `
    <div>
      <input type="checkbox" v-model="settings.showResolved"/><span> Show Resolved</span>
    </div>
  `,
  props: [
    'settings',
  ]
})