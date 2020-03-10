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
      <div v-if="pageId!==''"><input type="checkbox" v-model="pageSpecific"/><label>Page Specific Todo?</label></div>
      <br>
      <select-2 
        v-if="!pageSpecific" 
        :options="pageTypes"
        :default="currentPageType"
        placeholder="View on page type..." 
        v-model="todoPageTypes" 
        multiple=true
       >
      </select-2>
      <br>
      <select-2 
        :options="projectMembers"
        :output-dictionary="userNames"
        placeholder="Assign to..." 
        v-model="todoAssignments" 
        multiple=true
       >
      </select-2>
      <br>
      <select-2 
        :options="projectTags"
        :new-tags="true"
        placeholder="Add a tag"
        v-model="todoTags"
        multiple=true
      >
      </select-2>
      <br>
      <div class="canvas-collaborator-button" 
        @click="$emit('create-todo', {
          pageSpecific: pageSpecific,
          name: todoName, 
          pageTypes: todoPageTypes, 
          assignments: todoAssignments,
          tags: todoTags,
          projectId: project._id,
        });"
      >
        Save
      </div>
    </div>
  `,
  props: {
    currentPageType: String,
    userNames: Object,
    pageTypes: {
      type: Array
    },
    project: Object,
    projectMembers: {
      type: Array
    },
    projectTags: {
      type: Array
    },
    pageId: String,
  },
  data: function() {
    return {
      pageSpecific: false,
      todoName: '',
      todoAssignments: [],
      todoPageTypes: [],
      todoTags: [],
    }
  },
});
Vue.component('edit-todo', {
  template: `
    <div>
      <h2>Edit Todo</h2>
      <label>Name</label>
      <input type="text" v-model="todo.name" />
      <div v-if="pageId!==''"><input type="checkbox" @click="todo.pageSpecific = !todo.pageSpecific; pageSpecific = todo.pageSpecific;" v-model="todo.pageSpecific"/><label>Page Specific Todo?</label></div>
      <br>
      <select-2 
        :options="pageTypes"
        v-if="!pageSpecific" 
        placeholder="View on page type..." 
        v-model="todo.pageTypes" 
        multiple=true
       >
      </select-2>
      <br>
      <select-2 
        :options="projectMembers"
        :output-dictionary="userNames"
        placeholder="Assign to..." 
        v-model="todo.assignments" 
        multiple=true
       >
      </select-2>
      <br>
      <select-2 
        :options="projectTags"
        :name="'Tags'"
        :new-tags="true"
        :placeholder="'Add a tag'"
        v-model="todo.tags"
        multiple=true
      >
      </select-2>
    </div> 
  `,
  props: { 
    todo: Object, 
    userNames: Object,
    currentPageType: String,
    project: Object,
    projectTags: {
      type: Array
    },
    pageTypes: {
      type: Array
    },
    pageId: String,
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