CANVAS_COMMENTS_MODALS = {
  menu: null,
  modal: $(`<div class="canvas-comments-input-modal"></div>`).appendTo('body').hide(),
  background: $(`<div class="canvas-comments-input-background"></div>`).appendTo('body').hide(),
  api: null,

  _init(menu) {
    let self = this;
    self.api = CANVAS_COMMENTS_API;
    self.menu = menu;
    self.background.click(function() {
      self.closeModal();
    });
  },

  openModal() {
    let self = this;
    self.menu.container.hide();
    self.background.show();
    self.modal.empty();
    self.modal.show();
  },

  closeModal() {
    let self = this;
    self.menu.container.show();
    self.modal.empty();
    self.modal.hide();
    self.background.hide();
  },

  async newProjectSave() {
    let self = this;
    let nameInput = $("#canvas-comments-modal-input-name");
    let name = nameInput.val();
    self.modal.hide();
    await self.api.createProject(CANVAS_COMMENTS.courseId, name);
    self.closeModal();
    self.menu.projects = await self.api.getProjects(CANVAS_COMMENTS.courseId);
    self.menu.menuProjectsPop();
  },

  async newProjectInit() {
    let self = this;
    self.openModal();
    self.modal.html(`
          <h2>New Project</h2>
          <label>Project Name:</label>
          <input type="text" id="canvas-comments-modal-input-name"></input>
          <button id="canvas-comments-modal-save">Save</button>
        `);
    $("#canvas-comments-input-new-project-input-name").focus();
    $("#canvas-comments-modal-save").click(function() {
      self.newProjectSave();
    });
  },

  async newTodoSave(projectId) {
    let self = this;
    let nameInput = $("#canvas-comments-modal-input-name");
    let name = nameInput.val();
    self.modal.hide();
    let pageTypes = [];
    $(self.modal).find('.canvas-comments-modal-checkbox').each(function() {
      if ($(this).prop("checked") === true) {
      pageTypes.push($(this).val());
      }
    });
    await self.api.createTodo(projectId, name, pageTypes);
    self.closeModal();
    self.menu.projects = await self.api.getProjects(CANVAS_COMMENTS.courseId);
    self.menu.menuTodosPop(projectId);
  },

  async newTodoInit(projectId) {
    let self = this;
    self.openModal();
    self.modal.html(`
          <h2>New Todo</h2>
          <label>Todo Description:</label>
          <input type="text" id="canvas-comments-modal-input-name"></input>
          <label>Page Types to Include this Todo Item:</label>
          <br>
          <input type="checkbox" class="canvas-comments-modal-checkbox" value="quizzes"><label>Quizzes</label>
          <input type="checkbox" class="canvas-comments-modal-checkbox" value="assignments"><label>Assignments</label>
          <input type="checkbox" class="canvas-comments-modal-checkbox" value="pages"><label>Pages</label>
          <br>
          <button id="canvas-comments-modal-save">Save</button>
        `);
    $("#canvas-comments-input-new-project-input-description").focus();
    $("#canvas-comments-modal-save").click(function() {
      self.newTodoSave(projectId);
    });
  }
}