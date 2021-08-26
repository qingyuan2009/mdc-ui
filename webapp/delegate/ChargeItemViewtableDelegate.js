sap.ui.define([ "sap/ui/fhir/delegate/FHIRTableDelegate", "sap/ui/mdc/table/Column",
		"sap/m/Text", "sap/ui/fhir/util/HttpHandler", "sap/ui/fhir/util/FHIRMetadataProvider" ], 
		function(FHIRTableDelegate, Column, Text, HttpHandler, FHIRMetadataProvider) {
	"use strict";
		
	var ChargeItemViewTableDelegate = Object.assign({}, FHIRTableDelegate);

	ChargeItemViewTableDelegate.fetchProperties = function(oTable) {
		
		// return FHIRTableDelegate.fetchProperties(oTable);
		// as last exit
		return Promise.resolve([ {
			type : "sap.ui.model.type.String",
			name : "id",
			label : "Billing Case id",
			sortable : true,
			filterable : true
		}, 
		{
			type : "sap.ui.model.type.Date",
			name : "start",
			label : "Case Number",
			sortable : true,
			filterable : true
		},
		{
			type : "sap.ui.model.type.Date",
			name : "end",
			label : "Start Date",
			sortable : true,
			filterable : true
		},  {
			type : "sap.ui.model.type.String",
			name : "code",
			label : "Code",
			sortable : true,
			filterable : true
		}, 
		{
			type : "sap.ui.model.type.String",
			name : "display",
			label : "Description",
			sortable : true,
			filterable : true
		}, {
			type : "sap.ui.model.type.Float",
			name : "price",
			label : "price",
			sortable : true,
			filterable : true
		}, {
			type : "sap.ui.model.type.String",
			name : "currency",
			label : "Currency",
			sortable : true,
			filterable : true
		}
		]);
	};
	return ChargeItemViewTableDelegate;
}, /* bExport= */false);
