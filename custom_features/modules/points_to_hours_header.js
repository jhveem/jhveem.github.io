(function () {
  IMPORTED_FEATURE = {};
  if (/^\/courses\/[0-9]+\/modules$/.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
      initiated: false,
      _init() {
        let modules = $('div.item-group-condensed');
        let hoursTotal = 0;
        modules.each(function () {
          let headerElement = $($(this).find("div.ig-header span.name")[0]);
          let header = headerElement.text().trim();
          let headerMatch = header.match(/(.*) - [0-9]+[\.]{0,1}[0-9]* [H|h]our(s){0,1}/);
          if (headerMatch !== null) {
            header = headerMatch[1].trim();
          }
          if (header !== "") {
            let items = $(this).find("ul.ig-list div.ig-row");
            let pointsTotal = 0;
            items.each(function () {
              let info = $(this).find('div.ig-info');
              let pointsElement = info.find('span.points_possible');
              if (pointsElement.text().trim() !== "") {
                let points = parseFloat(pointsElement.text());
                pointsTotal += points;
              }
            });
            let hours = pointsTotal / 10;
            hoursTotal += hours;
            let hoursString = "Hour";
            if (hours != 1) {
              hoursString += "s";
            }
            $(headerElement.text(header + " - " + hours.toFixed(1) + " " + hoursString + " (Total: " + hoursTotal + ")"));
          }
        });
      }
    }
    if (ENV.current_user_roles.includes("teacher")) {
      IMPORTED_FEATURE._init();
    }
  }
})();