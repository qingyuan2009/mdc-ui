sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	'sap/m/Text',
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"../Operators"
], function(Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent, startKeyUserAdaptation, Operators) {
	"use strict";

	return Controller.extend("sap.ui.fhir.controller.App", {


		onInit: function() {
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

			const oCM = new ConditionModel();
			
			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "accounts" }), "app");

			const oRouter = UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.onRouteMatched.bind(this));
		},


		onNavigate: function(oEvent) {
			const oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo(oEvent.getParameter("selectedKey"));
		},

		onExit: function() {
			const oRouter = UIComponent.getRouterFor(this);

			if (oRouter) {
				oRouter.detachRouteMatched(this.onRouteMatched);
			}
		},

		onRouteMatched: function(oEvent) {
			const oParameters = oEvent.getParameters();
			let sRouteName = oParameters.name;

			switch (sRouteName) {
				case "":
				case "accounts":
				case "accountdetails":
					sRouteName = "accounts";
					break;

				default:
					sRouteName = "accounts";
					break;
			}

			const oAppModel = this.getView().getModel("app");
			oAppModel.setProperty("/routeName", sRouteName);
		},
		
		onStartRTA: function(oEvent) {
			startKeyUserAdaptation({rootControl: this.getOwnerComponent().getAggregation("rootControl")});
		}
		
	});
});