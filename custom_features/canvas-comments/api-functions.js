CANVAS_COMMENTS_API = {
  URL_BASE: "https://jhveem.xyz/api/",
  async getProjects(courseId) {
    let self = this;
    let url = self.URL_BASE + "projects/courses/" + courseId;
    let returnData = null;
    await $.get(url).done(function(data) {
      returnData = data;
    });
    return returnData;
  },
  async createProject(courseId, name) {
    let self = this;
    let url = self.URL_BASE + "projects/courses/" + courseId;
    let returnData = null;
    await $.post(url, {
      'name': name,
      'course': courseId
    }).done(function(data) {
      console.log(data);
      returnData = data;
    });
    return returnData;
  },
  async deleteProject(projectId) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId;
    await $.delete(url);
    return;
  },
  async createTodo(projectId, name, pageTypes = ['']) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId + "/todo";
    let returnData = null;
    await $.post(url, {
      'name': name,
      'pageTypes': pageTypes
    }, function (data) {
      returnData = data;
    });
    return returnData;
  },
  async resolveTodoPage(todoId, pageType, pageId) {
    //the page type and page id might be unnecessary
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/resolve";
    let returnData = null;
    await $.post(url, {
      'pageType': pageType,
      'pageId': pageId
    }, function(data) {
      returnData = data;
    });
    return returnData;
  },
  async unresolveTodoPage(todoId, pageType, pageId) {
    //the page type and page id might be unnecessary
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/unresolve";
    let returnData = null;
    await $.post(url, {
      'pageType': pageType,
      'pageId': pageId
    }, function(data) {
      returnData = data;
    });
    return returnData;
  },
  async deleteTodoPage(todoId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    let returnData = null;
    await $.delete(url).done(function(data) {
      console.log("done");
      returnData = data;
    });
    return returnData;
  },
  async createComment(todoId, text) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comment";
    let returnData = null;
    await $.post(url, {
      'text': text,
      'user': ENV.current_user_id
    }, function (data) {
      returnData = data;
    });
    return returnData;
  },
  async getComments(todoId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comments";
    console.log(url);
    let returnData = null;
    await $.get(url).done(function (data) {
      returnData = data;
    });
    return returnData;
  },
  async updateComment(commentId, data) {
    let self = this;
    let url = self.URL_BASE + "comments/" + commentId;
    return $.put(url, data);
  }
}