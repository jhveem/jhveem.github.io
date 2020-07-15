$(window).on("load", function () {
  let img = $(".btech-image-map-image");
  let table = $(".btech-image-map-table");
  let container = $(".btech-image-map-container");
  container.width(img.width());
  container.height(img.height());
  let backdrop = $("<div style='position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8);'></div>");
  let player = $("<div style='position: absolute; width: 75%; height: 75%; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: white; padding: 10px;'></div>");
  backdrop.hide();
  backdrop.click(function () {
    $(this).hide();
    player.empty();
  });
  let currentRow = null;
  let rows = $(table.find("tbody")[0]).find("tr");
  rows.each(function () {
    let row = $(this);
    let cells = row.find('td');
    let content = $(cells[0]).html();
    console.log();
    let x = parseInt($(cells[1]).text());
    let y = parseInt($(cells[2]).text());
    let icon = $("<div height='64px' width='64px' style='position: absolute; left: " + Math.round(x) + "%; top: " + Math.round(y) + "%;'></div>");
    let iconImage = $("<img src='https://upload.wikimedia.org/wikipedia/commons/9/99/Star_icon_stylized.svg' style='width: 64px; height: 64px; position: relative;'>");
    icon.append(iconImage);
    iconImage.css({
      'top': '24px',
      'left': '24px',
      'height': '16px',
      'width': '16px'
    });
    icon.on({
      mouseenter: function () {
        iconImage.css({
          'top': '0px',
          'left': '0px',
          'height': '64px',
          'width': '64px',
          'max-height': '64px',
          'max-width': '64px'
        });
      },
      mouseleave: function () {
        iconImage.css({
          'top': '24px',
          'left': '24px',
          'height': '16px',
          'width': '16px'
        });
      }
    });
    row.on({
      mouseenter: function () {
        iconImage.css({
          'top': '0px',
          'left': '0px',
          'height': '64px',
          'width': '64px',
          'max-height': '64px',
          'max-width': '64px'
        });
      },
      mouseleave: function () {
        iconImage.css({
          'top': '24px',
          'left': '24px',
          'height': '16px',
          'width': '16px'
        });
      }
    });
    icon.click(function () {
      console.log("CLICKED");
      backdrop.show();
      currentRow = row;
      player.html(content);
    });
    container.append(icon);
  });
  backdrop.append(player);
  container.append(backdrop);
});