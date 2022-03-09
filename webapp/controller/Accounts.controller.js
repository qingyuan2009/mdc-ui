sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/fhir/util/HttpHandler",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/ui/fhir/type/FHIRDate",
	"sap/ui/fhir/type/FHIRDateTime"
], function (Controller, UIComponent, HttpHandler, FHIRFilter, FHIRFiltertype, FHIRDate, FHIRDateTime) {

	"use strict";

	return Controller.extend("sap.ui.fhir.controller.Accounts", {
						
		onInit: function() {
			UIComponent.getRouterFor(this).getRoute("accounts").attachPatternMatched(this._onRouteMatched, this);
			//const fd = new FHIRDate();
			//const i = 0;			
			//const oTable = this.getView();
			//oTable.addEventDelegate({
			       //onAfterRendering: function() {
			    	   //sap.m.MessageBox.show("get layout");
			        //}			      
			   //}, oTable);
			
		},

		onRowPress: function (oEvent) {
			const oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();
			UIComponent.getRouterFor(this).navTo("accountdetails", {
				accountId: oContext.getProperty("id"),
			});
		},
				
		_onRouteMatched : function (oEvent) {
			const table = this.getView().byId("accountsTable");
			const rowBinding = table.getRowBinding();
			if (rowBinding) {
				rowBinding.refresh();
			}
		},
		
		onColumnPress: function (oEvent) {
			sap.m.MessageBox.show("get layout");
		
		}
		
		
	});
});