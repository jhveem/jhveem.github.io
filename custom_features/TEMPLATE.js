(function() {
  IMPORTED_FEATURE = {};
  if (true) { //check the window location
    //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
    IMPORTED_FEATURE = {
      initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
      _init(params={}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
        //THIS IS THE NAME OF THE FUNCTION CALLED FROM feature() ON THE custom_canvas.js PAGE
      },
      //WHATEVER ELSE YOU WANT OT ADD IN. IT'S JUST A JAVASCRIPT OBJECT
    }
  }
})();