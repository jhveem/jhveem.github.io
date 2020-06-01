(function () {
  class Column {
    constructor(name, description) {
      this.name = name;
      this.description = description;
      this.average = false;
      this.list = [];
      this.average_element = null;
      this.median_element = null;
      this.sortable_type = '';
      this.hidden = true;
      this.percent = false;
    }
  }
  IMPORTED_FEATURE = {};
  if (true) {
    IMPORTED_FEATURE = {
      initiated: false,
      async _init(params = {}) {
        let vueString = '';
        await $.get('https://jhveem.github.io/custom_features/reports/grades_report.vue', null, function (html) {
          vueString = html.replace("<template>", "").replace("</template>", "");
        }, 'text');
        let canvasbody = $("#application");
        canvasbody.after('<div id="canvas-grades-report-vue"></div>');
        $("#canvas-grades-report-vue").append(vueString);
        this.APP = new Vue({
          el: '#canvas-grades-report-vue',
          mounted: function () {

          },
          data: function () {
            return {
              columns: [
                new Column('Name', ''),
                new Column('Section', ''),
                new Column('Grade', ''),
                new Column('Final Grade', ''),
                new Column('Points', ''),
                new Column('Submissions', ''),
                new Column('Days Since Last Submission', ''),
                new Column('Days in Course', ''),
                new Column('Ungraded', '')
              ]
            }
          }
        })
      },
      APP: {}
    }
  }
})();