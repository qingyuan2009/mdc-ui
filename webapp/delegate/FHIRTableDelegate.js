sap.ui.define([ "sap/ui/mdc/TableDelegate", "sap/ui/mdc/table/Column",
		"sap/m/Text", 
		"sap/ui/mdc/Field",
		"sap/ui/fhir/util/FHIRMetadataProvider", 
		"sap/ui/fhir/delegate/FHIRTypeUtil",
		"sap/ui/core/Core",
		"sap/ui/mdc/util/FilterUtil"], function(TableDelegate,
		Column, Text, Field, FHIRMetadataProvider, FHIRTypeUtil, Core, FilterUtil) {
	"use strict";

	var FHIRTableDelegate = Object.assign({}, TableDelegate);

	FHIRTableDelegate.fetchProperties = function(oTable) {
		const payload = oTable.getDelegate().payload;
		const resourceType = payload.collectionName;
		return FHIRMetadataProvider.getTableProperties(resourceType).then(
				function(properties) {
					if (!this.aProps) {
						this.aProps = properties.map(function(oProp) {
							if (oProp.type) {
								//oProp.typeConfig = this.getTypeUtil()
								//		.getTypeConfig(oProp.type);
								//delete oProp.type;
								//oProp.type = oProp.typeConfig.baseType;
							}
							return oProp;
						}.bind(this));
					}
					return Promise.resolve(this.aProps);
				}.bind(this));
	};
	

	FHIRTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		if (oTable.getModel) {
			let col = this._createColumn(sPropertyName, oTable);
			return col;
		}
		return Promise.resolve(null);
	};
	
	FHIRTableDelegate.getTypeUtil = function (oPayload) {
		return FHIRTypeUtil;
	}
	
	FHIRTableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		if (!oMDCTable) {
			return;
		}

		oMDCTable._oTable.mProperties.growingScrollToLoad = true;
        if (oBindingInfo) {
            oBindingInfo.path = oBindingInfo.path || oMDCTable.getPayload().collectionPath || "/" + oMDCTable.getPayload().collectionName;
        }

		// MDC updated, so comment the following lines and add line 51-54
		//if (oMetadataInfo && oBindingInfo) {
		//	oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		//	oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
		//}

		//if (!oBindingInfo) {
		//	oBindingInfo = {};
		//}
		
		let oFilter = Core.byId(oMDCTable.getFilter()),
			bFilterEnabled = oMDCTable.isFilteringEnabled(),
			mConditions;

		// TODO: consider a mechanism ('FilterMergeUtil' or enhance
		// 'FilterUtil') to allow the connection between different filters)
		const oFilterControl = bFilterEnabled ? oMDCTable : oFilter;
		if (oFilterControl) {
			const aPropertiesMetadata = bFilterEnabled ? [] : oFilter.getPropertyInfoSet();
			mConditions = oFilterControl.getConditions();

			const oFilterInfo = FilterUtil.getFilterInfo(oFilterControl, mConditions, aPropertiesMetadata);
			// enhance filter with type information			
			if (oFilterInfo.filters) {
				const aFilters = oFilterInfo.filters.aFilters ? oFilterInfo.filters.aFilters : [oFilterInfo.filters];
				const aFHIRFilters = aFilters.forEach(oFilter => {
					const oProperty = aPropertiesMetadata.find(oProp => oProp.path == oFilter.sPath);
					oFilter.valueType = oProperty.typeConfig.className;
				});
			} 			
			oBindingInfo.filters = oFilterInfo.filters;		
		}
	};

	
	FHIRTableDelegate._createColumn = function(sPropertyName, oTable) {
		return this.fetchProperties(oTable).then(function(aProperties) {
			var oPropertyInfo = aProperties.find(function(oCurrentPropertyInfo) {
				return oCurrentPropertyInfo.name === sPropertyName;
			});

			if (!oPropertyInfo) {
				return null;
			}

			return this._createColumnTemplate(oPropertyInfo, oTable).then(function(oTemplate) {
				var oColumnInfo = this._getColumnInfo(oPropertyInfo, oTable);
				oColumnInfo.template = oTemplate;
				oColumnInfo.dataProperty = sPropertyName;
				return new Column(oTable.getId() + "--" + oPropertyInfo.name, oColumnInfo);
			}.bind(this));
		}.bind(this));
	};
	
	FHIRTableDelegate._getColumnInfo = function(oPropertyInfo, oTable) {
		return {
			header: oPropertyInfo.label
		};
	};

	FHIRTableDelegate._getColumnTemplateInfo = function(oPropertyInfo, oTable) {
		const sType = this.getTypeUtil().getDataTypeClassName(oPropertyInfo.type);
		const oTemplateInfo = { 
				value: "{" + oPropertyInfo.path + "}",
				dataType: sType,
				editMode: "Display", 
				multipleLines: false,
				dataTypeConstraints: oPropertyInfo.constraints,
		};
		if (sType === "sap.ui.model.type.Date") {
			oTemplateInfo.dataTypeFormatOptions = {
				source: {
					calendarType : CalendarType.Gregorian,
					pattern : 'yyyy-MM-dd'
				}
			}
		}
		return oTemplateInfo;
	};

	FHIRTableDelegate._createColumnTemplate = function(oPropertyInfo, oTable) {
		return Promise.resolve(new Field(this._getColumnTemplateInfo(oPropertyInfo, oTable)));
	};
	
	return FHIRTableDelegate;
}, /* bExport= */false);
