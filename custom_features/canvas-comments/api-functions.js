CANVAS_COMMENTS_API = {
  URL_BASE: "https://jhveem.xyz/api/",
  async getProjects(courseId) {
    let self = this;
    let url = self.URL_BASE + "projects/courses/" + courseId;
    let res = await axios.get(url);
    return res.data;
  },
  async createProject(courseId, name) {
    let self = this;
    let url = self.URL_BASE + "projects/courses/" + courseId;
    let returnData = null;
    let res = await axios.post(url, {
      'name': name,
      'course': courseId
    });
    return res.data;
  },
  async getUserName(userId) {
    let url = "/api/v1/users/"+userId;
    let res = await axios.get(url);
    return res.data.name;
  },
  async deleteProject(projectId) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId;
    await axios.delete(url);
    return;
  },
  async createTodo(projectId, name, pageTypes = ['']) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId + "/todo";
    let res = await axios.post(url, {
      'name': name,
      'pageTypes': pageTypes
    });
    return res.data;
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
  async deleteTodo(todoId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    let res = await axios.delete(url);
    return res.data;
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
    let returnData = null;
    await $.get(url).done(function (data) {
      returnData = data;
    });
    return returnData;
  },
  async deleteComment(commentId) {
    let self = this;
    let url = self.URL_BASE + "comments/" + commentId;
    let res = await axios.delete(url);
    return res.data;
  },
  async updateComment(commentId, data) {
    let self = this;
    let url = self.URL_BASE + "comments/" + commentId;
    return axios.put(url, data);
  },
  async loadSettingsGeneral(userId) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/general";
    console.log(url);
    try {
      let res = await axios.get(url, {
        params: {
          ns: 'edu.btech.canvas-app'
        }
      });
      let settings = res.settings;
      console.log(settings);
    } catch (e) {
      console.log(e);
    }
  },
  async loadSettingsCourse() {

  },
  async saveSettingGeneral(userId, setting, val) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/general";
    let data = {};
    data[setting] = val;
    try {
      await axios.put(url, {
        params: {
          ns: 'edu.btech.canvas-app',
        },
        data: data 
      });
    } catch (e) {
      console.log(e);
    }
  },
  saveSettingCourse(userId, setting, val) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/"+this.courseId;
    let data = {};
    data[setting] = val;
    try {
      axios.put(url, {
        ns: 'edu.btech.canvas-app',
        data: data
      });
    } catch (err) {
      console.log(err);
    }
  },
}
