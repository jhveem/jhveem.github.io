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
Vue.component('edit-todo', {
  template: `
    <div>
      <h2>Edit Todo</h2>
      <label>Name</label>
      <input type="text" v-model="todo.name" />
      <chosen-select data-placeholder="View on page type..." class="canvas-collaborator-chosen-select" v-model="todo.pageTypes" multiple>
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
    pageTypes: {
      type: Array
    },
    projectMembers: {
      type: Array
    } 
  },
});