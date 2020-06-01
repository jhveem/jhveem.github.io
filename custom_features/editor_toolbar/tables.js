(async function () {
  tableOptions = [
    'btech-tabs-table',
    'btech-dropdown-table'
  ];
  //escape if not on the editor page
  if (!TOOLBAR.checkEditorPage()) return;
  async function addClassToTable(className) {
    //get the currently selected node
    let node = tinyMCE.activeEditor.selection.getNode();
    //get the parent
    let parent = tinyMCE.activeEditor.dom.getParent(node, "table");
    if (parent !== null) {
      //see if it's already got the class in question, if so remove it, otherwise remove all other classes and add that one
      if ($(parent).hasClass(className)) {
        tinyMCE.activeEditor.dom.removeClass(parent, className);
      } else {
        for (let i = 0; i < tableOptions.length; i++) {
          let _class = tableOptions[i];
          tinyMCE.activeEditor.dom.removeClass(parent, _class);
        }
        tinyMCE.activeEditor.dom.addClass(parent, className);
      }
    }
  }

  function resetTableButtons() {
    let node = tinyMCE.activeEditor.selection.getNode();
    let parent = tinyMCE.activeEditor.dom.getParent(node, "table");
    $('.btech-table-edit-button').each(function () {
      $(this).css({
        'background-color': '#eee',
        'color': '#000'
      });
      let className = $(this).attr('id').replace("-button", "");
      if (parent !== null) {
        if ($(parent).hasClass(className)) {
          let bgColor = getComputedStyle(document.documentElement, null).getPropertyValue("--ic-brand-button--secondary-bgd-darkened-5");
          $(this).css({
            'background-color': bgColor,
            'color': '#fff'
          });
        }
      }
    });
  }

  await TOOLBAR.checkReady();
  console.log("TABLES");
  for (let i = 0; i < tableOptions.length; i++) {
    let className = tableOptions[i];
    let optionName = "Table->" + className.replace("btech-", "").replace("-table", "");
    let btn = await TOOLBAR.addButton(optionName, function () {
      addClassToTable(className);
      resetTableButtons();
    }, 'btech-table-edit-button');
    btn.attr('id', className + '-button');
  }

  //whenever you click in the editor, see if it's selected a table with one of the classes
  tinymce.activeEditor.on("click", function () {
    resetTableButtons();
  });
})();