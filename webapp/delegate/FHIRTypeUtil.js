sap.ui.define([
		'sap/ui/mdc/util/TypeUtil',
		'sap/ui/mdc/enum/BaseType',
		'sap/base/util/ObjectPath'
	], function(BaseTypeUtil, BaseType, ObjectPath) {
	"use strict";

	var FHIRTypeUtil = Object.assign({}, BaseTypeUtil);
	
	FHIRTypeUtil.getBaseType = function(sType, oFormatOptions, oConstraints) {

		switch (sType) {
			case "sap.ui.fhir.type.FHIRDate":
				return BaseType.Date;

			case "sap.ui.fhir.type.FHIRDateTime":
				return BaseType.DateTime;	
				
			default:
				return BaseTypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
		}
	}
		
	FHIRTypeUtil.getDataTypeClassName = function(sType) {
		switch(sType) {
			case "string": 
			case "http://hl7.org/fhirpath/System.String":	
			case "code":
			case "uri":
			case "url":
			case "canonical":
			case "uuid":
			case "oid":
			case "markdown":
			case "xhtml":	
				return "sap.ui.model.type.String";
			case "date":
				return "sap.ui.fhir.type.FHIRDate";
			case "boolean":
				return "sap.ui.model.type.Boolean";
			case "decimal":	
				return "sap.ui.model.type.Float";
			case "integer":	
			case "unsigendInt":
			case "positiveInt":	
				return "sap.ui.model.type.Integer";
			case "dateTime":
				return "sap.ui.fhir.type.FHIRDateTime";
			default:
				return BaseTypeUtil.getDataTypeClassName(sType);
		}		
	};
	
	return FHIRTypeUtil;

}, /* bExport= */ true);