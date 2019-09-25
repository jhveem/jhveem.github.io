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
function createHeaderRow() {
	let row = $('<tr></tr>');
	let count = 0;
	for (let key in columns) {
		let sortable_type = columns[key].sortable_type;
		let description = columns[key].description;
		row.append("<th title='"+description+"' class='"+sortable_type+"'style='text-align:center; padding:10px;'>"+key.replace(/_/g, " ").toUpperCase()+"</th>");
		count += 1;
	}
	return row;
}
function keyToHeading(key) {
    return key.replace(/_/g, " ").toUpperCase();
}

function keyToCSS(key) {
    return key.replace(/_/g, "-");
}

function updateAverage(key, dict) {
	let total = 0;
	let count = 0;
	for (var course_id in dict) {
		let course = dict[course_id];
		let val = course[key];
		if (val !== "N/A") {
			console.log(key);
			console.log(val);
			total += parseInt(val);
			count += 1;
		}
	}
	let average = total / count;
	let text = Math.round(average);
	if (columns[key].percent === true) text += "%";
	columns[key].average_element.html(text);
}

function getCellId(key, user_id) {
	return "btech-report-"+keyToCSS(key)+"-"+user_id
}

function updateCell(key, user_id, value, color="#FFF") {
	let cellId = getCellId(key, user_id);
	let cell = $("#"+cellId);
	cell.css("background-color",color);
	if (columns[key].percent == true && value !== "N/A") value += "%";
	cell.html(value);
}
let columns = {
	name: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The course&#39;s name. Click on the name to go to the course page. Click on 'grades' to go to their grades page for that course.",
		percent: false
	},
	state: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The student&#39;s activity state. Usually active, completed, or invited",
		percent: false
	},
	section: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The student&#39;s section. *COMING SOON",
		percent: false
	},
	grade: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This grade is calculated by canvas based on their currently submitted assignments.",
		percent: true
	},
	final_grade: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This grade is calculated based on all assignments and treats unsubmitted grades as 0.",
		percent: true
	},
	progress: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This takes the point value of all submitted assignments (the possible points in the assignment, not the student&#39;s score) and divides it by the total possible points in the course to estimate the students progress in the course.",
		percent: true
	}
};

class Course {
    constructor(id, name, user_id) {
        this.id = id;
	this.user_id = user_id;
        this.name = name;
        this.assignments = [];
        this.state = "";
        this.grade = "N/A";
        this.progress = 0;
        this.final_grade = "N/A";
        this.row = this.genRow();
        this.row.appendTo($('#btech-report-table-body'));
        this.updateCell('name', "<a target='_blank' href='https://btech.instructure.com/courses/"+id+"'>"+this.name+"</a>(<a target='_blank' href='https://btech.instructure.com/courses/"+id+"/grades/"+this.user_id+"'>grades</a>)");
    }
    genRow() {
        let row = $('<tr id="btech-modal-report-'+this.id+'"></tr>');
        for (let key in columns) {
            row.append("<td id='"+getCellId(key, this.id)+"' style='text-align:left; padding:10px;'>N/A</td>");
        }
        return row;
    }
    updateCell(key, value, color="#FFF") {
        let cellId = getCellId(key, this.id);
        let cell = $("#"+cellId);
        cell.css("background-color",color);
        if (columns[key].percent == true && value !== "N/A") value += "%";
        cell.html(value);
    }
}
