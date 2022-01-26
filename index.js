var EventSource = require("eventsource");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const color = require("colors");

var url = "https://stream.wikimedia.org/v2/stream/revision-create";

const {
	processUserReportEvent,
	processDomainReportEvent,
	sortUserReport,
	sortDomainReport,
	messageType,
} = require("./helper.js");

console.log(`Connecting to EventStreams at ${url}`);

const MIN_DURATION = 59; // seconds ;
const LONG_WINDOW_DURATION = argv.LONG_WINDOW_DURATION; // in minutes for task2  ;
const DOMAIN_FILTER = "en.wikipedia.org" || argv.DOMAIN_FILTER; // user report filter for domain ;

var eventSource = new EventSource(url);

eventSource.onopen = function (event) {
	console.log("--- Opened connection.");
	START_OP = true;
};

eventSource.onerror = function (event) {
	console.error("--- Encountered error", event);
};

const processEvent = (events, user_report_per_sec, domain_report_per_sec) => {
	try {
		const parseJSON = JSON.parse(events.toString());
		processDomainReportEvent(parseJSON, domain_report_per_sec);
		processUserReportEvent(
			parseJSON,
			user_report_per_sec,
			DOMAIN_FILTER
		);
		return;
	} catch (err) {
		console.log(err);
	}
};

// GLOBAL VARIABLEs
let report_obj = [];
let second_counter = 0;
let user_report = {};
let mintue_counter = 0;
let domain_report = {};

setInterval(() => {
	second_counter++;
	console.log(
		color.cyan(
			"seconds= " +
				second_counter +
				" minutes= " +
				mintue_counter
		)
	);
	try {
		eventSource.onmessage = (event) => {
			// collecting wanted event in empty user_report & domain_report global variable
			processEvent(event.data, user_report, domain_report);
			if (second_counter >= MIN_DURATION) {
				report_obj.push({
					user_report: user_report,
					domain_report: domain_report,
				});

				// empty object for another round of filling
				user_report = {};
				domain_report = {};
				// start another minute when 60 seconds over
				second_counter = 0;
				printToConsole(report_obj);
				// when running for task 2 duration is
				if (LONG_WINDOW_DURATION !== undefined) {
					mintue_counter++;
					// only start removing first element
					// when we have > 5 elements
					if (
						parseInt(
							mintue_counter /
								LONG_WINDOW_DURATION
						) > 0
					) {
						report_obj.shift();
					}
				} else {
					// remove first element after printing
					// & pushing in it the next minute ;
					report_obj.shift();
				}
			}
		};
	} catch (err) {
		console.log("There is some error!", err);
	}
}, 1000);

const printToConsole = (report_obj) => {
	// sort  acc to rules
	//  getting arroy of objects after mapping
	//  merging into one object for easier in sorting wrt rules
	let user_result = report_obj.map((val) => {
		return val.user_report;
	});

	let combined_user_result = user_result.reduce(function (
		result,
		current
	) {
		return Object.assign(result, current);
	},
	{});

	// same extra steps
	// above explained
	let domain_result = report_obj.map((val) => {
		return val.domain_report;
	});

	let combined_domain_result = domain_result.reduce(function (
		result,
		current
	) {
		return Object.assign(result, current);
	},
	{});

	let domain_sorted_result = sortDomainReport(combined_domain_result);

	let user_sorted_result = sortUserReport(combined_user_result);

	// PRINT THE REPORT AS ASKED : \o/ :
	console.log(color.red("Users who made changes to " + DOMAIN_FILTER));
	console.iterate(user_sorted_result);

	console.log(
		color.red(
			"Total number of Wikipedia Domains Updated : " +
				Object.keys(combined_domain_result).length
		)
	);
	console.iterate(domain_sorted_result);
};

console.iterate = (object) => {
	for ([key, val] of Object.entries(object)) {
		console.log(color.blue(key + " " + messageType(val)));
	}
};

// STRUCTURE OF THE OBJECT USED FOR EVENT PROCESSING
// report_obj = [  //first minute ;
// {
// 		user_report : {
// 			"<user_name@first_minute>" : <max_edit_count>,
// 			"<user_nam2@first_minute>" : <max_edit_count>,
// 		},
// 		domain_report : {
// 			"<domain1@first_minute>" : [
//                              "<page_titli0>",
//                              "<page_title1>"
// 			] ,
// 			"<doman2i@first_minute>" : [
//                              "<page_titli0>",
//                              "<page_title1>"
// 			]
//
// 		}
// },
// // second minute
// {
// 		user_report : {
// 			"<user_name@second_minute>" : <max_edit_count>,
// 			"<user_nam2@second_minute>" : <max_edit_count>,
// 		},
// 		domain_report : {
// 			"<domain1@second_minute>" : [
//                       "<page_titli0>"
// 			] ,
// 			"<doman2@second_minute>" : [
//                       "<page_titli0>"
// 			]
// 		}
// }
//]
