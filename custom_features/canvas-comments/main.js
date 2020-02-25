  async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getElement(selectorText, iframe = "") {
    let element;
    if (iframe === "") {
      element = $(selectorText);
    } else {
      element = $(iframe).contents().find(selectorText);
    }
    if (element.length > 0 && element.html().trim() !== "") {
      return element;
    } else {
      await delay(1000);
      return getElement(selectorText, iframe);
    }
  }

  $.put = function (url, data) {
    return $.ajax({
      url: url,
      data: data,
      type: 'PUT'
    });
  }

  CANVAS_COMMENTS = {
    courseId: null,
    pageType: null,
    pageId: null,
    left: null,
    top: null,
    currentMenu: null,
    currentProject: null,
    userId: ENV.current_user_id,
    rMainURL: /^\/courses\/([0-9]+)/,
    rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
    async _init() {
      let self = this;
      if (self.rPagesURL.test(window.location.pathname)) {
        //page specific menu
        let pieces = window.location.pathname.match(self.rPagesURL);
        self.courseId = parseInt(pieces[1]);
        self.pageType = pieces[2];
        self.pageId = pieces[3];
        await self.getSavedSettings();
        self.currentMenu = CANVAS_COMMENTS_MENU_PAGE;
      } else if (self.rMainURL.test(window.location.pathname)) {
        //not in a specific page
        let pieces = window.location.pathname.match(self.rMainURL);
        self.courseId = parseInt(pieces[1]);
        await self.getSavedSettings();
        self.currentMenu = CANVAS_COMMENTS_MENU_GENERAL;
      }
      self.currentMenu._init();
      CANVAS_COMMENTS_MODALS._init(self.currentMenu);
      if (self.left !== null && self.right !== null) {
        self.currentMenu.container.css("left", (self.left * 100) + "%");
        self.currentMenu.container.css("top", (self.top * 100) + "%");
      }
    },
    async getSavedSettings() {
      let self = this;
      returnData = null;
      try {
        let url = "/api/v1/users/"+self.userId+"/custom_data/canvas_collaboration/"+self.courseId+"";
        await $.get(url, {
          'ns': 'edu.btech.canvas-app'
        }, function(data) {
          console.log(data.data);
          self.currentProject = data.data.currentProject;
          if (data.data.menuPosition !== undefined) {
            self.left = data.data.menuPosition.left;
            self.top = data.data.menuPosition.top;
          }
        });
      } catch (err) {
        console.log(err);
      }
      return returnData;
    }
  }
  
  //API Functions

  //SELECT CUSTOM FEATURES