sap.ui.define([
	'sap/ui/mdc/field/FieldBaseDelegate', 
	'sap/ui/fhir/delegate/FHIRTypeUtil'
], function(
	BaseDelegate, TypeUtil
) {
	"use strict";

	/**
	 * @class Delegate class for <code>sap.ui.mdc.field.FieldBase</code>.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.72
	 * @since 1.72.0
	 * @alias sap.ui.mdc.field.FieldBaseDelegate
	 */
	var FHIRFieldBaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Maps the Edm type names to real type names
	 *
	 * If a real type has already been defined, this type is returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {string} sType Given EDM type
	 * @returns {string} Data type name
	 * @private
	 * @deprecated please use sap.ui.mdc.util.TypeUtil.getDataTypeClass instead
	 */
	FHIRFieldBaseDelegate.getDataTypeClass = function(oPayload, sType) {
		return TypeUtil.getDataTypeClassName(sType);
	};

	/**
	 * To know what control is rendered the <code>Field</code> or </code>FilterField</code>
	 * needs to know if the type represents a date, a number or something else in a normalized way.
	 *
	 * As default <code>string</code> is returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {string} sType Given type
	 * @param {object} oFormatOptions Used <code>FormatOptions</code>
	 * @param {object} oConstraints Used <code>Constraints</code>
	 * @returns {sap.ui.mdc.condition.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
	 * @private
	 * @deprecated please use sap.ui.mdc.util.TypeUtil.getBaseType instead
	 */
	FHIRFieldBaseDelegate.getBaseType = function(oPayload, sType, oFormatOptions, oConstraints) {
		return TypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
	};

	FHIRFieldBaseDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return FHIRFieldBaseDelegate;
});