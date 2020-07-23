(async function () {
  async function parseCommentHTML() {
    let feature = this;
    let element = $(".btech-html-practice");
    element.each(function () {
      let html = $(this).text();
      console.log(html);
      html = html.replace(/&lt;(\/{0,1}.+?)&gt;/g, "<$1>");
      let input = $("<textarea style='width: 100%; box-sizing:border-box;'></textarea>");
      let display = $("<div></div>");
      input.on('input', function () {
        display.html($(this).val());
        if ($(this).val().toLowerCase() == html.toLowerCase()) correct.show();
      });
      $(this).after(input);
      input.after(display);
      let correct = $("<div style='width: 100%; background-color: #2B3; color: #FFF; text-align: center; font-size: 1.5em;'>Correct!</div>");
      correct.hide();
      $(this).after(correct);
      $(this).after(html);
    });
  }

  parseCommentHTML();
})();