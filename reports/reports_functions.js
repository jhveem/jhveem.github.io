const month_name = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://kryogenix.org/code/browser/sorttable/sorttable.js";
$("head").append(s);

function createReport() {
	$('div#application').append("<div id='btech-modal' class='btech-modal'></div>");
	$('#btech-modal').append("<div class='btech-modal-content' id='btech-modal-content'></div>");
	$('#btech-modal-content').append("<span class='btech-close' id='btech-close'>&times;</span>");
	$('#btech-modal-content').append("<h3 style='text-align: center;'>Report</h3>");
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>");
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that column.</h5>");
	$('#btech-modal-content').append("<table class='sortable' border='1' id='btech-report-table'></table>");
	$('#btech-report-table').append("<tbody border='1' id='btech-report-table-body'></tbody>");
	$('#btech-report-table').append("<thead border='1' id='btech-report-table-head'></thead>");
	$('#btech-report-table').append("<tfoot border='1' id='btech-report-table-foot'></tfoot>");
	let gen_report_button = $('<a class="btn button-sidebar-wide" id="btech-modal-report-gen">Report</a>');
    let menu_bar = $("#right-side div").first();
    gen_report_button.appendTo(menu_bar);

	gen_report_button.click(function() {
	    let modal = $('div#btech-modal');
	    modal.show();
	});
	$('#btech-close').click(function() {
	    let modal = $('div#btech-modal');
	    modal.hide();
	});
}
