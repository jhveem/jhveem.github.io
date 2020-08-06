(async function () {
  //Figure out how to await these two libraries loading then ...
  $.getScript("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/loader.min.js").done(function () {
    var s = document.createElement("link");
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('data-name', 'vs/editor/editor.main');
    s.onload = function () {


      //Do this part
      require.config({
        paths: {
          'vs': 'https://unpkg.com/monaco-editor@latest/min/vs'
        }
      });
      window.MonacoEnvironment = {
        getWorkerUrl: () => proxy
      };

      let proxy = URL.createObjectURL(new Blob([`
          self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
          };
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
        `], {
        type: 'text/javascript'
      }));

      require(["vs/editor/editor.main"], function () {
        let elements = $(".btech-html-practice");
        elements.each(function () {
          let el = this;
          let html = $(el).text();
          let button = $("<button>Run</button>");
          $(el).after(button);
          button.click(function() {
            let lines = $(el).find('.view-line');
            lines.each(function() {
              console.log($(this).text());
            });
          });
          $(el).empty();
          $(el).css({
            width: '100%',
            height: '256px'
          });
          let editor = monaco.editor.create(el, {
            value: html,
            language: 'html',
            theme: 'vs-dark'
          });
        })
      });

      //this func can go in the previous bit to replace the anonymous function. have it cycle through all els and replace with the text inside or something
      function setUpVSCode() {
        let element = $(".btech-html-practice");
      }
      setUpVSCode();
      // parseCommentHTML();
    }
    s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/editor/editor.main.min.css');
    document.getElementsByTagName('head')[0].appendChild(s);
  });
  async function parseCommentHTML() {
    let element = $(".btech-html-practice");
    element.each(function () {
      let html = $(this).text();
      console.log(html);
      html = html.replace(/&lt;(\/{0,1}.+?)&gt;/g, "<$1>");
      let input = $("<textarea style='width: 100%; box-sizing:border-box;'></textarea>");
      let display = $("<div style='outline: 1px solid #000; padding: 5px; margin-bottom: 10px;'></div>");
      input.on('input', function () {
        display.html($(this).val());
        if ($(this).val().toLowerCase() == html.toLowerCase()) correct.show();
      });
      $(this).after(input);
      input.after(display);
      let correct = $("<div style='width: 100%; background-color: #2B3; color: #FFF; text-align: center; font-size: 1em;'><b>Correct!</b></div>");
      correct.hide();
      $(this).after(correct);
      $(this).after("<div style='outline: 1px solid #000; padding: 5px; margin-bottom: 10px;'>" + html + "</div>");
    });
  }

})();