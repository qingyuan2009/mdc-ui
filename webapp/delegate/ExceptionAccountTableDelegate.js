sap.ui.define([ "sap/ui/fhir/delegate/FHIRTableDelegate", "sap/ui/mdc/table/Column",
		"sap/m/Text", "sap/ui/fhir/util/HttpHandler", "sap/ui/fhir/util/FHIRMetadataProvider", "sap/ui/fl/Utils" ], 
		function(FHIRTableDelegate, Column, Text, HttpHandler, FHIRMetadataProvider, FlUtils) {
	"use strict";
		
	var ExceptionAccountTableDelegate = Object.assign({}, FHIRTableDelegate);

	ExceptionAccountTableDelegate.fetchProperties = function(oTable) {
		
		return FHIRTableDelegate.fetchProperties(oTable).then( 
					function(properties) { 
						if (!this.aProps) {							
							const oAppComponent = FlUtils.getAppComponentForControl(oTable);
							const oResourceModel = oAppComponent.getModel("i18n");
							this.aProps = properties; 
							for (let property of properties) {
								if (oResourceModel) {
									const sLanguageKey = property.path + "FieldHeader";
									const label = oResourceModel.getProperty(sLanguageKey);
									if (label != sLanguageKey) {
										property.label = label;
									}
								}
								if (property.name == "start") {
									property.constraints = {
											isDateOnly : false
									}
								} 
							} 
						}
						return Promise.resolve(this.aProps);
					}.bind(this));
	};
		
/*		// as last exit
		return Promise.resolve([ {
			type : "sap.ui.model.type.String",
			name : "id",
			label : "Billing Case id",
			sortable : true,
			filterable : true
		}, 
		{
			type : "sap.ui.model.type.String",
			name : "identifier",
			label : "Case Number",
			sortable : true,
			filterable : true
		},
		{
			type : "sap.ui.model.type.String",
			name : "start",
			label : "Start Date",
			sortable : true,
			filterable : true
		},  {
			type : "sap.ui.model.type.String",
			name : "end",
			label : "End date",
			sortable : true,
			filterable : true
		}, 
		{
			type : "sap.ui.model.type.String",
			name : "patientName",
			label : "Patient Name",
			sortable : true,
			filterable : true
		}, {
			type : "sap.ui.model.type.String",
			name : "organizationName",
			label : "Department Name",
			sortable : true,
			filterable : true
		}, {
			type : "sap.ui.model.type.Integer",
			name : "numberOfTasks",
			label : "Exceptions",
			sortable : true,
			filterable : true
		}
		]); */
		
	return ExceptionAccountTableDelegate;
}, /* bExport= */false);
