sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/model/Filter"
], function (FilterOperatorUtil, Operator, Filter) {
	"use strict";

	var getCustomYearFormat = function (date) {
		return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
	};

	var oLastYearOperator = new Operator({
		name: "LAST_YEAR",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		tokenText: "Last Year",
		valueTypes: [],
		getModelFilter: function (oCondition, sFieldPath) {
			var currentDate = new Date();
			return new Filter({ path: sFieldPath, operator: "BT", value1: getCustomYearFormat(new Date(currentDate.getFullYear() - 1, 0, 1)), value2: getCustomYearFormat(new Date(new Date().getFullYear() - 1, 11, 31)) });

		}
	});

	var oCurrentYearOperator = new Operator({
		name: "CURRENT_YEAR",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		tokenText: "Current Year",
		valueTypes: [],
		getModelFilter: function (oCondition, sFieldPath) {
			var currentDate = new Date();
			return new Filter({ path: sFieldPath, operator: "BT", value1: getCustomYearFormat(new Date(currentDate.getFullYear(), 2, 1)), value2: getCustomYearFormat(new Date(new Date().getFullYear(), 11, 31)) });

		}
	});
	
	var oCustomRangeOperator = new Operator({
		name: "CUSTOMRANGE",
		longText: "Custom Range",
		tokenText: "Custom Range: $0-$1",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: ["sap.ui.model.type.Date", "sap.ui.model.type.Date"],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: oCondition.values[0], value2: oCondition.values[1] });
		}
	});

	
	[oLastYearOperator, oCurrentYearOperator, oCustomRangeOperator].forEach(function (oOperator) {
		FilterOperatorUtil.addOperator(oOperator);
	});

});