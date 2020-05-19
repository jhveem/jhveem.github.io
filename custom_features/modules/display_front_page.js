(function () {
  IMPORTED_FEATURE = {};
  if (true) { //check the window location
    //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
    IMPORTED_FEATURE = {
      initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
      courseId: '',
      settingsEl: '',
      async getSettings() {
        await $.get("/api/v1/courses/" + this.courseId + "/pages/btech-custom-settings", function (data) {
          let feature = this;
          //if custom settings page exists, look for the appropriate header
          $('body').append("<settings id='btech-custom-settings'></settings>");
          feature.settingsEl = $("#btech-custom-settings");
          feature.settingsEl.hide();
          feature.settingsEl.html(data.body);
        });
        return;
      },
      async getSettingData(settingId) {
        console.log(this.settingsEl);
        let settings = this.settingsEl;
        let setting = settings.find('#'+settingId);
        let val = "";
        if (setting.length > 0) {
          //get the name of the page to append and then grab the page
          val = setting.text();
        }
        return val;
      },
      async updateSetting(settingId) {

      },
      async _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
        let feature = this;
        let rPieces = /^\/courses\/([0-9]+)\/modules/;
        let pieces = window.location.pathname.match(rPieces);
        feature.courseId = parseInt(pieces[1]);

        await this.getSettings();
        //get header on modules page and add an empty div
        let moduleModal = $(".header-bar");
        let moduleHeader = $("<div></div>");
        moduleModal.after(moduleHeader);
        if (/^\/courses\/[0-9]+\/modules/.test(window.location.pathname)) {
          //get course id
          let pageName = this.getSettingData('modules-page-header')
          $.get("/api/v1/courses/" + feature.courseId + "/pages/" + pageName, function (data) {
            moduleHeader.append(data.body);
          });
          if (IS_TEACHER) {
            let select = $("<select></select>");
            moduleHeader.append(select);
            $.get("/api/v1/courses/" + feature.courseId + "/pages").done(function (data) {
              console.log(data);
              for (let i = 0; i < data.length; i++) {
                let pageData = data[i];
                if (pageData.url !== 'btech-custom-settings') {
                  select.append("<option value='" + pageData.url + "'>" + pageData.title + "</option>");
                }
              }
              select.on('change', function () {
                console.log($(this).val());
                $.put("/api/v1/courses/" + feature.courseId + "/pages/btech-custom-settings", {
                  wiki_page: {
                    title: 'btech-custom-settings',
                    body: '',
                    published: true
                  }
                })
              });
            });
          }
        }
      },
      //WHATEVER ELSE YOU WANT OT ADD IN. IT'S JUST A JAVASCRIPT OBJECT
    }
  }
})();