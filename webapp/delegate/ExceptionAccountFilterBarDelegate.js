sap.ui.define(
[  "sap/ui/fhir/delegate/FHIRFilterBarDelegate",
	"sap/ui/mdc/util/IdentifierUtil", "sap/ui/core/Core",
	"sap/ui/fhir/util/FHIRMetadataProvider",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils",
	"sap/ui/core/CalendarType",],
	function(FHIRFilterBarDelegate, IdentifierUtil, Core,
			FHIRMetadataProvider, JsControlTreeModifier, FlUtils, CalendarType) {
	"use strict";

	var ExceptionAccountFilterBarDelegate = Object.assign({},
			FHIRFilterBarDelegate);


	ExceptionAccountFilterBarDelegate.fetchProperties = function(
			oFilterBar) {

		return FHIRFilterBarDelegate.fetchProperties(oFilterBar).then( 
				function(properties) { 
					if (!this.aProps) {
						this.aProps = properties; 
						for (let property of properties) {						
							if (property.name == "organizationName") { 
								property.fieldHelp = "FHDepartmentName"; 
							} else if (property.name == "patientName") { 
								property.fieldHelp = "FHPatientName"; 
							} else if (property.name == "start" || property.name == "end") {
								property.filterOperators.unshift("CURRENT_YEAR");
								property.filterOperators.unshift("LAST_YEAR");
								property.filterOperators.unshift("CUSTOMRANGE");
								property.fieldHelp = "fhAdod";
								if (property.name == "start") {
									property.constraints = {
											isDateOnly : true,
											displayFormat : "Date"
									};
								}
							} else if (property.name == "birthDate") {
								//property.fieldHelp = "fhAdod";
								/*property.formatOptions = {
										calendarType : CalendarType.Gregorian,
										pattern : 'yyyy-MM',
										strictParsing : true,
										UTC : false,
								}*/
							} else  { 					
								property.group = "extended";
								property.groupLabel = "Extended";
							} 
						} 
					}
					return Promise.resolve(this.aProps); 
				}.bind(this) );

		// last exit: hard coded data
/*		return Promise.resolve([ {
			name : "patientName",
			groupLabel : "none",
			label : "Patient name",
			type : "String",
			required : false,
			hiddenFilter : false,
			visible : true,
			maxConditions : -1,
			fieldHelp : "FHPatientName",
		}, {
			name : "id",
			groupLabel : "none",
			label : "Billing Case",
			type : "String"
		}, {
			name : "type",
			groupLabel : "none",
			label : "Scenario",
			type : "String",
			maxConditions : -1,
			fieldHelp : "FHPatientGender",
		},
		{
			name : "organizationName",
			groupLabel : "none",
			label : "Department",
			type : "String",
			maxConditions : -1,
			fieldHelp : "FHDepartmentName",
		}, {
			name : "numberOfTasks",
			groupLabel : "none",
			label : "Department",
			type : "Integer",
			maxConditions : -1
		} ].map(function(oProp) {
			oProp.typeConfig = this.getTypeUtil()
			.getTypeConfig(oProp.type);
			delete oProp.type;
			return oProp;
		}.bind(this))); */
	};
	return ExceptionAccountFilterBarDelegate;
});