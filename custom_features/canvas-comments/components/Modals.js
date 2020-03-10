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
          projectId: project._id 
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
      <chosen-select id="collaborator-edit-todos-page-types" v-if="!pageSpecific" data-placeholder="View on page type..." class="canvas-collaborator-chosen-select" v-model="todo.pageTypes" multiple>
        <option v-for="pageType in pageTypes" :value="pageType">{{pageType}}</option>
      </chosen-select>
      <chosen-select id="collaborator-edit-todo-assignments" data-placeholder="Assign to..." v-model="todo.assignments" multiple>
        <option v-for="user in projectMembers" :value="user">{{userNames[user]}}</option>
      </chosen-select>
      <chosen-select id="collaborator-edit-todo-tags" data-placeholder="Tags" v-model="todo.tags" multiple>
        <option v-for="tag in project.tags" :value="tag">{{tag}}</option>
      </chosen-select>
    </div> 
  `,
  mounted: function() {
    let app = this;
    $(".chosen-container").on('keyup',function(event) {
      if(event.which === 13) {
        let id = $(this).attr('id');
        let newVal = $(event.target).val();
        $(event.target).val('');
        if (id === 'collaborator_edit_todo_tags_chosen') {
          app.$emit('add-tag', newVal);
          $("#collaborator-edit-todo-tags").blur();
          $("#collaborator-edit-todo-tags").trigger("chosen:updated");
          $("#collaborator-edit-todo-tags").trigger("liszt:updated");
          $(event.target).blur();
          $(event.target).trigger("chosen:updated");
          $(event.target).trigger("liszt:updated");
          $("#"+id).blur();
          $("#"+id).trigger("chosen:updated");
          $("#"+id).trigger("liszt:updated");
        }
      }
    });
  },
  props: { 
    todo: Object, 
    userNames: Object,
    currentPageType: String,
    project: Object,
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