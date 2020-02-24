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
    userId: ENV.current_user_id,
    rMainURL: /^\/courses\/([0-9]+)/,
    rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
    async _init() {
      let self = this;
      if (self.rPagesURL.test(window.location.pathname)) {
        //page specific menu
        let pieces = window.location.pathname.match(self.rPagesURL);
        self.courseId = parseInt(pieces[1]);
        self.pageType = parseInt(pieces[2]);
        self.pageId = parseInt(pieces[3]);
      } else if (self.rMainURL.test(window.location.pathname)) {
        //not in a specific page
        let pieces = window.location.pathname.match(self.rMainURL);
        self.courseId = parseInt(pieces[1]);
        CANVAS_COMMENTS_MENU_GENERAL._init();
        CANVAS_COMMENTS_MODALS._init(CANVAS_COMMENTS_MENU_GENERAL);
      }
    },
  }
  
  //API Functions

  //SELECT CUSTOM FEATURES