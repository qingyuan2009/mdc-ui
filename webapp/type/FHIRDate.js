sap.ui.define([
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/CalendarType',
	'sap/ui/fhir/type/FHIRBaseType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(
		DateFormat,
		CalendarType,
		FHIRBaseType,
		FormatException,
		ParseException,
		ValidateException,
		jQuery,
		isEmptyObject
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
	var FHIRDate = FHIRBaseType.extend("sap.ui.fhir.type.FHIRDate", /** @lends sap.ui.model.type.Date.prototype */ {

		constructor : function (oFormatOptions, oConstraints) {
			//FHIRBaseType.apply(this, arguments);
			this.oFormatOptions = oFormatOptions;
			this.oConstraints = oConstraints;
			this.sName = "FHIRDate";
		}

	});
	
	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Date} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 */

	FHIRDate.prototype.getFormatter = function(oType) {
		if (!oType.oFormat) {
			const oFormatOptions = jQuery.extend({strictParsing : true}, oType.oFormatOptions);
			oFormatOptions.UTC = false;
			oType.oFormat = DateFormat.getDateInstance(oFormatOptions);
		}
		return oType.oFormat;
	}
	
	/**
	 * Returns a formatter that formats the date into yyyy-MM-dd. Creates it lazily.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 */
	
	FHIRDate.prototype.getModelFormatter = function() {
		if (!this.oModelFormatter) {
			this.oModelFormatter = DateFormat.getDateInstance({
				calendarType : CalendarType.Gregorian,
				pattern : 'yyyy-MM-dd',
				strictParsing : true,
				UTC : false,
			});
		}
		return this.oModelFormatter;
	}
	
	FHIRDate.prototype.getModelFormatter2 = function() {
		if (!this.oModelFormatter2) {
			this.oModelFormatter2 = DateFormat.getDateInstance({
				calendarType : CalendarType.Gregorian,
				pattern : "yyyy-MM-dd'T'HH:mm:ss.sss'Z'",
				strictParsing : true,
				UTC : false,
			});
		}
		return this.oModelFormatter2;
	}
	
	// transforms from model to external representation
	// transforms the vValue in to targetType
	// Dateformat.format: Date -> string
	// DateFormat.parse: string -> Date
	// sTragetType type is the JScript type
	// the only method needed for read operations

	FHIRDate.prototype.formatValue = function(vValue, sTargetType) {
		if (vValue === undefined || vValue === null) {
			return null;
		}
		
		
		
		switch (this.getPrimitiveType(sTargetType)) {
		
			case "any":
				return vValue;
			case "string":
				var dateStr = null;		
				var oResult = null;	
				var  objRegExp= /^(\d{4})(-)(\d{1,2})(-)(\d{1,2})/;
				if (objRegExp.test(vValue)){					
					const oDate = this.getModelFormatter().parse(vValue);	
					// transform the result date to the external representation -> local time zone, no UTC!
					oResult = this.getFormatter(this).format(oDate);
				}								
				// check if data maps with YYYY-MM-DDThh:mm:ss.sssZ
				var objRegExp2 = /^(\d{4})(-)(\d{1,2})(-)(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2}).(\d{1,3})Z/;
				if (objRegExp2.test(vValue)) {
					const oDate = this.getModelFormatter2().parse(vValue);	
					// transform the result date to the external representation -> local time zone, no UTC!
					oResult = this.getFormatter(this).format(oDate);
				}	
				if (oResult === null || oResult === undefined){
					throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
				}else{
					return oResult;
				}
				
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
		
	};
	
	// transforms the external format to the model format = string
	FHIRDate.prototype.parseValue = function(vValue, sSourceType) {
		if (vValue === "" || vValue === null) {
			return null;
		}
		switch (this.getPrimitiveType(sSourceType)) {
			case "object":
				// assuming vValue is a Date format it to string via model formatter
				return this.getModelFormatter().format(vValue, false);
			case "string":
				// transform the external string using the formatter to Date
				// shall not use UTC transformation as FHIR specifies not to transform dates into UTC (always local date!))  
				const oDate = this.getFormatter(this).parse(vValue, false);
				if (!oDate) {
					throw new ParseException(this.getErrorMessage(this));
				}
				// transforms the result date to the model string format
				const sResult = this.getModelFormatter().format(oDate);
				return sResult;
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};
		
	FHIRDate.prototype.validateValue = function(sValue) {
		// ToDo: evaluate min/max condition 
	};
		
	return FHIRDate;
});