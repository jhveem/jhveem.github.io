(function () {
  //Get this from console.cloude.google.com -> APIs & Services -> Credentials
  //currently using OAuth client, might need to switc to Apps Script client id if it doesn't work
  //I'm thinking this works because it was run in Chrome where I'm already logged into a google account that has access. May need playing with.
  var CLIENT_ID = '598926114418-m4tc7umecfnoct45cvpgskm5o6don1jo.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyB96GeOJSbR3t0UcpNv_43KpDQuVH9bkB4';
  var API_ID = 'MQLOPUNvNvgf30djRsXIX8XXO64Zpdnmj';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://script.googleapis.com/$discovery/rest?version=v1"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = 'https://www.googleapis.com/auth/script.projects'
  $.getScript("https://apis.google.com/js/api.js").done(function () {
    function handleClientLoad() {
      gapi.load('client:auth2', initClient);
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(function () {
        callAppsScript();
      }, function (error) {
        console.log(JSON.stringify(error, null, 2));
      });
    }

    /**
     * Shows basic usage of the Apps Script API.
     *
     * Call the Apps Script API to create a new script project, upload files
     * to the project, and log the script's URL to the user.
     */
    function callAppsScript() {

      // Call the Apps Script API run method
      //   'scriptId' is the URL parameter that states what script to run
      //   'resource' describes the run request body (with the function name
      //              to execute)
      var scriptId = "10r7eWehnK6JJZIimkLpaWewTp8STCXXYMpP_QD-mgGsBpXz5cJCofVSt";
      gapi.client.script.scripts.run({
        'scriptId': scriptId,
        'resource': {
          'function': 'getFormData',
          'parameters': ["1FycisSwARHeefqX9s0YkeoyvPyKAfxg2OlqIBbZ9Cmg"]
        }
      }).then(function (resp) {
        console.log(resp.result.response.result);
      });
    }
    handleClientLoad();
    
  });

})();