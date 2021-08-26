sap.ui.define([
	'sap/ui/model/SimpleType'
],
	function(
		SimpleType
	) {
	"use strict";


	/**
	 * Constructor for a Date type.
	 *
	 * @class
	 * This class represents date simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version 1.90.0-SNAPSHOT
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of options used to create a second <code>DateFormat</code> object for conversions between
	 *           string values in the data source (e.g. model) and <code>Date</code>. This second format object is used to convert from a model <code>string</code> to <code>Date</code> before
	 *           converting the <code>Date</code> to <code>string</code> with the primary format object. Vice versa, this 'source' format is also used to format an already parsed
	 *           external value (e.g. user input) into the string format that is expected by the data source.
	 *           For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 *           In case an empty object is given, the default is the ISO date notation (yyyy-MM-dd).
	 * @param {object} [oConstraints] Value constraints
	 * @param {Date|string} [oConstraints.minimum] Smallest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @param {Date|string} [oConstraints.maximum] Largest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @alias sap.ui.model.type.Date
	 */
	var FHIRBaseType = SimpleType.extend("sap.ui.fhir.type.FHIRBaseType", /** @lends sap.ui.model.type.Date.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "FHIRBaseType";
		}

	});
	
	FHIRBaseType.prototype.setConstraints = function (oConstraints) {
		// do nothing!
	};


	FHIRBaseType.prototype.setFormatOptions = function (oFormatOptions) {
		// do nothing!
	};
	
	return FHIRBaseType;

});