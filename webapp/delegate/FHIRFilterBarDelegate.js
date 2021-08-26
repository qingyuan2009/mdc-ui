sap.ui.define(
[   "sap/ui/mdc/FilterBarDelegate", 
	"sap/ui/fhir/delegate/FHIRFieldBaseDelegate",
	"sap/ui/mdc/util/IdentifierUtil", "sap/ui/core/Core",
	"sap/ui/fhir/util/FHIRMetadataProvider",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils", "sap/ui/fhir/delegate/FHIRTypeUtil" ],
	function(FilterBarDelegate, FieldBaseDelegate, IdentifierUtil, Core,
			FHIRMetadataProvider, JsControlTreeModifier, FlUtils, FHIRTypeUtil) {

	"use strict";

	const FHIRFilterBarDelegate = Object.assign({},
			FilterBarDelegate);

	FHIRFilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		// properties need to be fetched on this to execute the potentially inherited method of a derived delegate!
		return this.fetchProperties(oFilterBar).then(function(aProperties) {
			 const oProperty = aProperties.find(function(oPropertyInfo) {
				return (IdentifierUtil.getPropertyKey(oPropertyInfo) === sPropertyName);
			});
			if (oProperty) {
				return Promise.resolve(FHIRFilterBarDelegate._createFilterField(oProperty, oFilterBar, mPropertyBag));
			} else {
				return Promise.resolve(null);
			}
		});
	};
	
	FHIRFilterBarDelegate.getTypeUtil = function (oPayload) {
		return FHIRTypeUtil;
	}

	FHIRFilterBarDelegate._createFilterField = function(
			oProperty, oFilterBar, mPropertyBag) {
		const oModifier = mPropertyBag ? mPropertyBag.modifier
				: JsControlTreeModifier;
		const oAppComponent = mPropertyBag ? mPropertyBag.appComponent
				: FlUtils.getAppComponentForControl(oFilterBar);
		const oView = (mPropertyBag && mPropertyBag.view) ? mPropertyBag.view
				: FlUtils.getViewForControl(oFilterBar);
		const sViewId = mPropertyBag ? mPropertyBag.viewId : null;
		const sName = oProperty.path || oProperty.name;
		const oSelector = {};

		if (oFilterBar.getId) {
			oSelector.id = oFilterBar.getId();
		} else {
			oSelector.id = oFilterBar.id;
		}

		const sSelectorId = oModifier.getControlIdBySelector(
				oSelector, oAppComponent);

		const sId = sSelectorId + "--filter--" + IdentifierUtil.replace(sName);

		let oExistingFilterField = sap.ui.getCore().byId(sId);

		if (oExistingFilterField) {
			return Promise.resolve(oExistingFilterField);
		}
		
		let that = this;

		return oModifier.createControl("sap.ui.mdc.FilterField", oAppComponent, oView, sId,
			{
				dataType : oProperty.typeConfig.className,
				conditions : "{$filters>/conditions/" + sName + '}',
				required : oProperty.required,
				label : oProperty.label || oProperty.name,
				maxConditions : oProperty.maxConditions,
				delegate : {
					name : "sap/ui/fhir/delegate/FHIRFieldBaseDelegate",
					payload : {}
				}
			}, true)
				.then(function(oFilterField) {						
					if (oProperty.valueSetUri) {
						that._createFieldValueHelp(oFilterBar, oFilterField, oProperty);
					}
					if (oProperty.fieldHelp) {
						var sFieldHelp = oProperty.fieldHelp;
						if (!sViewId) { // viewId is
							// only set during xmlTree processing
							sFieldHelp = oView.createId(oProperty.fieldHelp);
						} else {
							sFieldHelp = sViewId + "--" + oProperty.fieldHelp;
						}
						oModifier.setAssociation(oFilterField, "fieldHelp", sFieldHelp);
					}
					if (oProperty.filterOperators) {
						if (oFilterBar.getId) {
							oModifier.setProperty(
									oFilterField,
									"operators",
									oProperty.filterOperators);
						} else {
							oModifier.setProperty(
									oFilterField,
									"operators",
									oProperty.filterOperators
									.join(','));
						}
					}

					if (oProperty.tooltip) {
						oModifier.setProperty(
								oFilterField,
								"tooltip",
								oProperty.tooltip);
					}

					if (oProperty.constraints) {
						oModifier.setProperty(
								oFilterField,
								"dataTypeConstraints",
								oProperty.constraints);
					}

					if (oProperty.formatOptions) {
						oModifier
						.setProperty(
								oFilterField,
								"dataTypeFormatOptions",
								oProperty.formatOptions);
					}

					if (oProperty.display) {
						oModifier.setProperty(
								oFilterField,
								"display",
								oProperty.display);
					}
					return oFilterField;
				});
	};

	FHIRFilterBarDelegate.fetchProperties = function(
			oFilterBar) {
		const resourceType = oFilterBar.getDelegate().payload.collectionName; 
		
		return FHIRMetadataProvider.getFilterProperties(resourceType).then( 
				function(properties) { 
					if (!this.aProps) {
						this.aProps = properties.map(function(oProp) {
							// type config is needed in Condition Model!
							if (oProp.type) {
								oProp.typeConfig = this.getTypeUtil()
								.getTypeConfig(oProp.type);
								delete oProp.type;
							}	
							return oProp;
						}.bind(this));
					}
					return this.aProps;
					// return Promise.resolve(oProps); 
				}.bind(this) );
	};

	// name must fit with the data collection field name !!!
	
	FHIRFilterBarDelegate._createFieldValueHelp = function(oFilterBar, oFilterField, oProperty) {
			const oFieldValueHelp = new sap.ui.mdc.field.FieldValueHelp(
					{
						filterFields : "*name*",
						title : oProperty.label || oProperty.short,
						id : "FH" + oProperty.name,
						noDialog : true,
						keyPath : "code",
						descriptionPath : "display"
					}  
			);
			oFilterBar.addDependent(oFieldValueHelp);
			oFilterField.setFieldHelp(oFieldValueHelp);	
			
			const tableWrapper = new sap.ui.mdc.field.FieldValueHelpMTableWrapper();
			oFieldValueHelp.setContent(tableWrapper);
			
			const oTable = new sap.m.Table({
					columns: [
						new sap.m.Column({header: new sap.m.Text({text: "Code"})}),
						new sap.m.Column({header: new sap.m.Text({text: "Display"})})
					]
			});
			oTable.setWidth("350px");
			tableWrapper.setTable(oTable);
			// bind the Table items to the data collection
			// hack: id = last segment of uri
			let idx = oProperty.valueSetUri.lastIndexOf("/");
			let valueSetId = oProperty.valueSetUri.substring(idx + 1); 
			
			oTable.bindItems({
				path: "/ValueSet/" + valueSetId,
				parameters: {
					request: {
						url: oProperty.valueSetUri
					}
				},
				template : new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({text: "{code}"}),
						new sap.m.Text({text: "{display}"})
					]
				}),
				growing : true,
				growingScrollToLoad : true,
				growingThreshold : "20"
			});
	};	
	
	FHIRFilterBarDelegate.getTypeUtil = function (oPayload) {
		return FHIRTypeUtil;
	};


	return FHIRFilterBarDelegate;
});