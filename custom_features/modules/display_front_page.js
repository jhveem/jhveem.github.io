(function () {
  IMPORTED_FEATURE = {};
  if (true) { //check the window location
    //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
    IMPORTED_FEATURE = {
      initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
      courseId: '',
      settingsEl: '',
      async getSettings() {
        let feature = this;
        await $.get("/api/v1/courses/" + this.courseId + "/pages/btech-custom-settings", function (data) {
          //if custom settings page exists, look for the appropriate header
          $('body').append("<settings id='btech-custom-settings'></settings>");
          feature.settingsEl = $("#btech-custom-settings");
          feature.settingsEl.hide();
          feature.settingsEl.html(data.body);
        });
        return;
      },
      async getSettingData(settingId) {
        let settings = this.settingsEl;
        let setting = settings.find('#'+settingId);
        let val = "";
        if (setting.length > 0) {
          //get the name of the page to append and then grab the page
          val = setting.text();
        }
        return val;
      },
      async updateSetting(settingId, value) {
        let setting = this.settingsEl.find("#" + settingId);
        setting.text(value);
      },
      async _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
        let feature = this;
        let rPieces = /^\/courses\/([0-9]+)/;
        let pieces = window.location.pathname.match(rPieces);
        feature.courseId = parseInt(pieces[1]);

        await this.getSettings();
        //get header on modules page and add an empty div
        let moduleModal = $(".header-bar");
        let moduleHeader = $("<div></div>");
        moduleModal.after(moduleHeader);
        let modulesPage = false;

        if (/^\/courses\/[0-9]+\/modules/.test(window.location.pathname)) {
          modulesPage = true;
        } else if (/^\/courses\/[0-9]+/.test(window.location.pathname)) {
          if (ENV.COURSE.default_view === 'modules') {
            modulesPage = true;
          }
        }
        if (modulesPage) {
          //get course id
          let pageName = await this.getSettingData('modules-page-header')
          $.get("/api/v1/courses/" + feature.courseId + "/pages/" + pageName, function (data) {
            moduleHeader.append(data.body);
          });
          if (IS_TEACHER) {
            let select = $("<select></select>");
            select.append("<option selected disabled>-select a page-</option>");
            moduleHeader.append(select);
            $.get("/api/v1/courses/" + feature.courseId + "/pages").done(function (data) {
              for (let i = 0; i < data.length; i++) {
                let pageData = data[i];
                if (pageData.url !== 'btech-custom-settings') {
                  select.append("<option value='" + pageData.url + "'>" + pageData.title + "</option>");
                }
              }
              select.on('change', function () {
                feature.updateSetting('modules-page-header', $(this).val());
                $.put("/api/v1/courses/" + feature.courseId + "/pages/btech-custom-settings", {
                  wiki_page: {
                    title: 'btech-custom-settings',
                    body: feature.settingsEl.html(), 
                    published: true
                  }
                }).done(function() {
                  location.reload(true);
                });
              });
            });
          }
        }
      },
    }
  }
})();