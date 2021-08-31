sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel", "sap/m/Dialog", "sap/m/Button",
		"sap/m/ButtonType", 'sap/m/Text', "sap/m/MessageToast",
		"sap/ui/fhir/util/HttpHandler", "sap/fhir/model/r4/FHIRFilter",
		"sap/fhir/model/r4/FHIRFilterType",
		"sap/fhir/model/r4/FHIRFilterOperator",
		"sap/ui/core/Fragment", 
		"sap/ui/unified/CalendarAppointment",
		"sap/pacc/ui5/poc/FHIRCustomDateUtils"], function(Controller,
		UIComponent, JSONModel, Dialog, Button, ButtonType, Text, MessageToast,
		HttpHandler, FHIRFilter, FHIRFilterType, FHIRFilterOperator, Fragment, CalendarAppointment, FHIRCustomDateUtils) {

	"use strict";

	return Controller.extend("sap.ui.fhir.controller.AccountDetails", {

		onInit : function() {
			this.getView().attachModelContextChange(this._provideDetails.bind(this));
			UIComponent.getRouterFor(this).getRoute("accountdetails")
					.attachPatternMatched(this._onRouteMatched, this);			
		},
		
		
		_createDialog : function(fragment, title, context, dialogName) {
			return new Dialog({
					title : title,
					content : fragment,
					endButton : new Button({
						text : "Close",
						press : function() {
							context[dialogName].close();
						}.bind(context)
					})
				}
			)
		},
		
		onRowEditPress : function(oEvent) {
			const sPath = oEvent.getSource().getBindingContext().sPath;
			const idx = sPath.lastIndexOf("/");
			const id = sPath.substring(idx + 1);
			const that = this;
			if (this.editFragment && this.oEditDialog) {
				this.editFragment.bindObject({path: "/ChargeItem/" + id});
				this.oEditDialog.open();				
			} else if (this.fragment && !this.oEditDialog) {
				this.editFragment.bindObject({path: "/ChargeItem/" + id});
				this.oEditDialog = this._createDialog(this.editFragment, "Edit Billing Item", this, "oEditDialog");
				this.oEditDialog.open();
			} else {
				Fragment.load({name: "sap.ui.fhir.view.ViewChargeItem"}).then(
					function(fragment) {
						that.editFragment = fragment;
						that.oEditDialog = that._createDialog(fragment, "View Billing Item", that, "oEditDialog");
						that.getView().addDependent(that.oEditDialog);
						fragment.bindObject({path: "/ChargeItem/" + id});
						that.oEditDialog.open();
					}
				)
			}
		},
		
		onBackButtonPress : function(oEvent) {
			UIComponent.getRouterFor(this).navTo("accounts");
		},
		
		onTestButtonPress: function(oEvent) {
			var sDate = "2021-03-02";
	        sap.m.MessageBox.show(FHIRCustomDateUtils.formatDate(sDate));
		},
		
		_provideDetails : function(oEvent) {
			if (oEvent.getSource().getBindingContext()) {
				const sPatientId = this.getView().getModel().getProperty(oEvent.getSource().getBindingContext().getPath()
						+ "/subject/reference");
				// patient data
				const oPatientBox = this.getView().byId("patientBox");
				oPatientBox.bindElement({path: "/Patient/" + sPatientId});					
			}
		},

		_onRouteMatched : function(oEvent) {
			const oView = this.getView(); 
			const oArgs = oEvent.getParameter("arguments"); 
			const sAccountId = oArgs.accountId;
			if (sAccountId) {
				oView.bindElement({ path: "/Account/" + sAccountId });
				const oTable = this.getView().byId("chargeItemViewTable");
				if (oTable) {
					// does not work in the initial case
					// because the MDC Table is not initialized
					// to be checked with UI5 colleagues!
					const fhirFilter = new FHIRFilter({
						path : "account",
						operator : FHIRFilterOperator.EQ,
						valueType : FHIRFilterType.string,
						value1 : sAccountId
					});
					oTable.initialized().then(function () {
						const oBinding = oTable.getRowBinding();
						// does not work in the first call as the rowBinding is undefined!
						if (oBinding) {
							oBinding.filter([fhirFilter]);
							// iFilter Interface!!!
						}
					});
				}
			}
		}
	});
});