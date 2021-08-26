sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.fhir.graphql",
		settings : {
			id : "graphql"
		},
		async: true
	}).placeAt("content");
});