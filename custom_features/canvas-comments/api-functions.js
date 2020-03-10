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
  async updateProject(projectId, updatePackage) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId;
    await axios.put(url, updatePackage);
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
  async getTodos(projectId) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId + "/todos";
    let res = await axios.get(url);
    return res.data;
  },
  async getTodosPage(projectId, pageType, pageId) {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId + "/todos/pages/"+pageType+"/"+pageId;
    let res = await axios.get(url);
    return res.data;
  },
  async createTodo(projectId, name, pageTypes = [''], assignments = [''], pageId = '') {
    let self = this;
    let url = self.URL_BASE + "projects/" + projectId + "/todo";
    if (typeof assignments === 'string') assignments = [assignments];
    let res = await axios.post(url, {
      'name': name,
      'pageTypes': pageTypes,
      'assignments': assignments,
      'pageId': pageId
    });
    return res.data;
  },
  async updateTodo(todoId, updatePackage) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    await axios.put(url, updatePackage);
  },
  async resolveTodoPage(todoId, pageType, pageId) {
    //the page type and page id might be unnecessary
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/resolve";
    let returnData = null;
    await $.put(url, {
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
    await axios.put(url, {
      'pageType': pageType,
      'pageId': pageId
    });
    return;
  },
  async assignTodo(todoId, assignments) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/assignment";
    await axios.put(url, {
      'assignments': assignments
    });
  },
  async deleteTodo(todoId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    await axios.delete(url);
    return;
  },
  async createComment(todoId, text, pageType, pageId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comment";
    let returnData = null;
    await $.post(url, {
      'text': text,
      'user': ENV.current_user_id,
      'pageType': pageType,
      'pageId': pageId
    }, function (data) {
      returnData = data;
    });
    return returnData;
  },
  async getComments(todoId, pageType='', pageId='') {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comments";
    if (pageType !== '' || pageId !== '') {
      url = self.URL_BASE + "todos/" + todoId + "/comments/pages/"+pageType+"/"+pageId;
    }
    let returnData = null;
    let res = await axios.get(url);
    return res.data;
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
    try {
      let res = await axios.get(url, {
        params: {
          ns: 'edu.btech.canvas-app'
        }
      });
      let settings = res.data;
      return settings;
    } catch (e) {
      console.log(e);
    }
  },
  async loadSettingsCourse() {

  },
  async saveSettingGeneral(userId, setting, val) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/general?ns=edu.btech.canvas-app&data["+setting+"]="+val;
    try {
      await $.put(url);
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
