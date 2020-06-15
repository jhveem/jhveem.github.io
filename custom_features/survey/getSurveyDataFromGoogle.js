(function () {
  var url = "https://script.google.com/a/btech.edu/macros/s/AKfycbwIgHHMYbih2XnJf7mjDw8g3grdeHhn9s6JIvH6Qg7mfZ0ElbWr/exec?formId=" + "1FycisSwARHeefqX9s0YkeoyvPyKAfxg2OlqIBbZ9Cmg";
      var request = jQuery.ajax({
        crossDomain: true,
        url: url,
        method: "GET",
        dataType: "jsonp"
      }).done(function (res) {
console.log(res);
      });
})();