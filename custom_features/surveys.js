(function () {
  IMPORTED_FEATURE = {};
  if (true) {
    IMPORTED_FEATURE = {
      initiated: false,
      _init(params = {}) {
        addToModuleMenu("Add Course Survey", "Add a link to the course survey.", this.addSurvey);
      },
      addSurvey() {
        console.log("add survey");
      }
    }
  }
})();