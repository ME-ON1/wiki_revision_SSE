exports.processDomainReportEvent = (json_reports, domain_report_per_sec) => {
	if (domain_report_per_sec[json_reports.meta.domain] === undefined) {
		domain_report_per_sec[json_reports.meta.domain] = [];
		domain_report_per_sec[json_reports.meta.domain].push(
			json_reports.page_title
		);
	} else {
		if (
			domain_report_per_sec[json_reports.meta.domain].indexOf(
				json_reports.page_title
			) === -1
		) {
			domain_report_per_sec[json_reports.meta.domain].push(
				json_reports.page_title
			);
		}
	}
};

exports.processUserReportEvent = (
	json_reports,
	user_report_per_sec,
	DOMAIN_FILTER
) => {
	if (
		!json_reports.performer.user_is_bot &&
		json_reports.performer.user_edit_count !== undefined &&
		json_reports.meta.domain === DOMAIN_FILTER
	) {
		// bot excluded
		// address names excluded
		if (
			user_report_per_sec[json_reports.performer.user_text] ==
			undefined
		) {
			user_report_per_sec[json_reports.performer.user_text] =
				json_reports.performer.user_edit_count;
		} else {
			if (
				user_report_per_sec[
					json_reports.performer.user_text
				] < json_reports.performer.user_edit_count
			)
				user_report_per_sec[
					json_reports.performer.user_text
				] = json_reports.performer.user_edit_count;
		}
	}
};

exports.sortUserReport = (user_result) => {
	return Object.entries(user_result)
		.sort((a, b) => a[1] - b[1])
		.reduce(
			(_sortedObj, [k, v]) => ({
				..._sortedObj,
				[k]: v,
			}),
			{}
		);
};

exports.sortDomainReport = (domain_result) => {
	return Object.entries(domain_result)
		.sort((a, b) => {
			return a[1].length - b[1].length;
		})
		.reduce(
			(_sortedObj, [k, v]) => ({
				..._sortedObj,
				[k]: v,
			}),
			{}
		);
};

// is domain or user report
exports.messageType = (val) => {
	if (typeof val === "object") {
		return `: ${val.length} pages updated`;
	} else {
		return `: ${val}`;
	}
};
