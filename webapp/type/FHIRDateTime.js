/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/CalendarType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/fhir/type/FHIRBaseType",
	"sap/ui/thirdparty/jquery"
], function (Log, DateFormat, CalendarType, FormatException, ParseException, ValidateException, FHIRBaseType,
		jQuery) {
	"use strict";

	/**
	 * Base constructor for the primitive types <code>Edm.DateTime</code> and
	 * <code>Edm.DateTimeOffset</code>.
	 *
	 * @param {object} [oFormatOptions]
	 *   Type-specific format options; see subtypes
	 * @param {object} [oConstraints]
	 *   Constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean} [oConstraints.isDateOnly=false]
	 *   If <code>true</code>, only the date part is used, the time part is always 00:00:00 and
	 *   the time zone is UTC to avoid time-zone-related problems
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is accepted
	 * @param {boolean} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid string value
	 *   (OData V4 only); only integer values between 0 and 12 are valid (since 1.37.0)
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.DateTimeBase
	 * @author SAP SE
	 * @class This is an abstract base class for the OData primitive types
	 *   <code>Edm.DateTime</code> and <code>Edm.DateTimeOffset</code>.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.27.0
	 * @version 1.90.0-SNAPSHOT
	 */
	var FHIRDateTime = FHIRBaseType.extend("sap.ui.fhir.type.FHIRDateTime", {
			constructor : function (oFormatOptions, oConstraints) {
//				FHIRBaseType.apply(this, arguments);
				this.sName = "FHIRDateTime";
				this.oFormatOptions = oFormatOptions;
				this.oConstraints = oConstraints;
			},

		});
	
	/*
	 * Returns true if the type uses only the date.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type
	 */
	FHIRDateTime.prototype.isDateOnly = function(oType) {
		return oType.oConstraints && oType.oConstraints.isDateOnly;
	}

	/*
	 * Returns the matching locale-dependent error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type
	 * @returns {string}
	 *   The locale-dependent error message
	 */
	FHIRDateTime.prototype.getErrorMessage = function(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(
			this.isDateOnly(oType) ? "EnterDate" : "EnterDateTime",
				[oType.formatValue(this.isDateOnly(oType) ? oDemoDate : oDemoDateTime, "string")]);
	}

	/*
	 * Returns the formatter. Creates it lazily.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type instance
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 */
	FHIRDateTime.prototype.getFormatter = function(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = jQuery.extend({strictParsing : true}, oType.oFormatOptions);
			if (this.isDateOnly(oType)) {
				oFormatOptions.UTC = false;
				oType.oFormat = DateFormat.getDateInstance(oFormatOptions);
			} else {
				oType.oFormat = DateFormat.getDateTimeInstance(oFormatOptions);
			}
		}
		return oType.oFormat;
	}
	
	/**
	 * Returns a formatter that formats the date into yyyy-MM-dd. Creates it lazily.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 */
	
	FHIRDateTime.prototype.getModelFormatter = function() {
		if (!this.oModelFormatter) {
			if (this.isDateOnly(this)) {
				this.oModelFormatter = DateFormat.getDateInstance({
					calendarType : CalendarType.Gregorian,
					pattern : "yyyy-MM-dd",
					strictParsing : true,
					UTC : true
				});	

			} else {
				this.oModelFormatter = DateFormat.getDateTimeInstance({
					calendarType : CalendarType.Gregorian,
					pattern : "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
					strictParsing : true,
					UTC : true
				});
			}
		}
		return this.oModelFormatter;
	}
	
	FHIRDateTime.prototype.formatValue = function (oValue, sTargetType) {
		if (oValue === null || oValue === undefined) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "any":
				return oValue;
			case "string":
				// transform model string (is always a string!) to Date
				const oDate = this.getModelFormatter().parse(oValue);
				// transform the result date to the external representation -> local time zone, no UTC!
				const sResult = this.getFormatter(this).format(oDate);
				return sResult;
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}		
	};

	/**
	 * Parses the given value to a <code>Date</code> instance (OData V2).
	 *
	 * @param {string|Date} vValue
	 *   The value to be parsed; the empty string and <code>null</code> are parsed to
	 *   <code>null</code>
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>), must be
	 *   "object" (since 1.69.0), "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Date|string}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the given string cannot be parsed to a
	 *   Date
	 *
	 * @public
	 * @since 1.27.0
	 */
	
	// transform to the model format: string!

	
	FHIRDateTime.prototype.parseValue = function (vValue, sSourceType) {
		if (vValue === null || vValue === "") {
			return null;
		}
		switch (this.getPrimitiveType(sSourceType)) {
			case "object":
				return vValue;
			case "string":
				// transform the external string using the formatter to Date
				// shall use local timezone if no time zone is configured for the formatter 
				const oDate = this.getFormatter(this).parse(vValue, false);
				if (!oDate) {
					throw new ParseException(this.getErrorMessage(this));
				}	
				// transforms the result date to the model string format transforming to UTC
				const sResult = this.getModelFormatter().format(oDate);
				return sResult;
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};

	/**
	 * Called by the framework when any localization setting is changed.
	 *
	 * @private
	 */
	FHIRDateTime.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 *
	 * @param {Date} oValue
	 *   The value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 * @since 1.27.0
	 */
	FHIRDateTime.prototype.validateValue = function (oValue) {
		// ToDo: evaluate min/max condition 
	};

	/**
	 * Returns the type's name.
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.DateTimeBase#getName
	 * @protected
	 * @see sap.ui.model.Type#getName
	 */

	return FHIRDateTime;
});