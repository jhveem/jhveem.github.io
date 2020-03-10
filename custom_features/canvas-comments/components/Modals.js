Vue.component('edit-project', {
  template: `
    <div>
      <h2>Edit Project</h2>
      <label>Name</label>
      <input type="text" v-model="project.name" />
    </div> 
  `,
  props: { 
    project: Object, 
  },
});
Vue.component('new-todo', {
  template: `
    <div>
      <h2>Create Todo</h2>
      <label>Name</label>
      <input type="text" v-model="todoName" />
      <input type="checkbox" v-model="pageSpecific"/><label>Page Specific Todo?</label>
      <br>
      <chosen-select v-if="!pageSpecific" :default="currentPageType" data-placeholder="View on page type..." class="canvas-collaborator-chosen-select" v-model="todoPageTypes" multiple>
        <option v-for="pageType in pageTypes" :value="pageType">{{pageType}}</option>
      </chosen-select>
      <chosen-select data-placeholder="Assign to..." v-model="todoAssignments" multiple>
        <option v-for="user in projectMembers" :value="user">{{userNames[user]}}</option>
      </chosen-select>
      <br>
      <div class="canvas-collaborator-button" 
        @click="$emit('create-todo', {
          pageSpecific: pageSpecific,
          name: todoName, 
          pageTypes: todoPageTypes, 
          assignments: todoAssignments,
          projectId: projectId
        });"
      >
        Save
      </div>
    </div>
  `,
  props: {
    currentPageType: String,
    projectId: String,
    userNames: Object,
    pageTypes: {
      type: Array
    },
    projectMembers: {
      type: Array
    }
  },
  data: function() {
    return {
      pageSpecific: false,
      todoName: '',
      todoAssignments: [],
      todoPageTypes: [],
    }
  },
});
Vue.component('edit-todo', {
  template: `
    <div>
      <h2>Edit Todo</h2>
      <label>Name</label>
      <input type="text" v-model="todo.name" />
      <input type="checkbox" @click="todo.pageSpecific = !todo.pageSpecific; pageSpecific = todo.pageSpecific;" v-model="todo.pageSpecific"/><label>Page Specific Todo?</label>
      <br>
      <chosen-select v-if="!pageSpecific" data-placeholder="View on page type..." class="canvas-collaborator-chosen-select" v-model="todo.pageTypes" multiple>
        <option v-for="pageType in pageTypes" :value="pageType">{{pageType}}</option>
      </chosen-select>
      <chosen-select data-placeholder="Assign to..." v-model="todo.assignments" multiple>
        <option v-for="user in projectMembers" :value="user">{{userNames[user]}}</option>
      </chosen-select>
    </div> 
  `,
  props: { 
    todo: Object, 
    userNames: Object,
    currentPageType: String,
    projectId: String,
    pageTypes: {
      type: Array
    },
    projectMembers: {
      type: Array
    } 
  },
  data: function() {
    return {
      pageSpecific: this.todo.pageSpecific,
    }
  }
});