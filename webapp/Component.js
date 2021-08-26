sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/mdc/link/FakeFlpConnector",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fhir/util/FHIRMetadataProvider"
], function (UIComponent, FakeLrepConnectorLocalStorage, FakeFlpConnector, JSONModel, FHIRMetadataProvider) {
	"use strict";

	return UIComponent.extend("sap.ui.fhir.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			FakeLrepConnectorLocalStorage.enableFakeConnector();
			//this.__initFakeFlpConnector();
			
			const sServiceUri = this.getMetadata().getManifestEntry("/sap.app/dataSources/fhir/uri");
			const oResourceTypes = this.getMetadata().getManifestEntry("/sap.ui.fhir/resourceTypes");
			const configurationUri = jQuery.sap.getUriParameters().get("configuration-url"); // "/json/resource-types.json"
			
			FHIRMetadataProvider.init(sServiceUri, oResourceTypes, configurationUri);
		},
/*		
		__initFakeFlpConnector: function() {
			FakeFlpConnector.enableFakeConnector({
				'FakeFlpSemanticObject': {
					links: [
						{
							action: "action_01",
							intent: self.location.pathname + "#/Books/{ID}",
							text: "Manage book",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							isMain: true,
							description: "{title}"
						},
						{
							action: "action_02",
							intent: self.location.pathname + "#/Authors/{author_ID}",
							text: "Manage author",
							description: "{author/name}"
						}
					]
				}
			});
		}
*/
	});
});