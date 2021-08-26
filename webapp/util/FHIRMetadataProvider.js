sap.ui.define(["sap/ui/fhir/util/HttpHandler"], function(HttpHandler) {
	"use strict";
	
	// create a new class
	const FHIRMetadataProvider = function() {
		this.propertiesMap = {};
	};
	
	// create instance
	const instance = new FHIRMetadataProvider();

	const isComplexType = function(code) {
		return (code == "Ratio" || code == "Period" || code == "Range" || code == "Attachment" || code == "Identifier" ||
				code == "Annotation" || code == "HumanName" || code == "CodeableConcept" || code == "ContactPoint" || code == "Coding" ||
				code == "Money" || code == "Address" || code == "Timing" || code == "Quantity" || code == "SampleData" ||
				code == "Signature" || code == "Age" || code == "Distance" || code == "Duration" || code == "Count" ||
				code == "MoneyQuantity" || code == "SimpleQuantity" || code == "ContactDetail" || code == "Contributor" || code == "DataRequirements" ||
				code == "RelatedArtifact" || code == "UsagContext" || code == "ParameterDefinition" || code == "Expression" || code == "TriggerDefinition" ||
				code == "Reference" || code == "Meta" || code == "Dosage" || code == "Narrative" || code == "Extension" ||
				code == "ElementDefinition" || code == "BackboneElement");
	};

	const isPrimitiveType = function(code) {
		return (code == "instant" || code == "time" || code == "date" || code == "dateTime" || code == "base64Binary" ||
				code == "decimal" || code == "boolean" || code == "code" || code == "string" || code == "integer" ||
				code == "uri" || code == "url" || code == "canonical" || code == "uuid" || code == "oid" ||
				code == "markdown" || code == "id" || code == "unsignedInt" || code == "positiveInt" || code == "http://hl7.org/fhirpath/System.String" ||
				code == "xhtml"
		) 
	};

	const mapFHIR2UI5Type = function(code) {
		switch(code) {
		case "string": 
		case "http://hl7.org/fhirpath/System.String":	
		case "code":
		case "uri":
		case "url":
		case "canonical":
		case "uuid":
		case "oid":
		case "markdown":
		case "xhtml":	
			return "sap.ui.model.type.String";
		case "date":
			return "sap.ui.model.type.Date";
		case "boolean":
			return "sap.ui.model.type.Boolean";
		case "decimal":	
			return "sap.ui.model.type.Float";
		case "integer":	
		case "unsigendInt":
		case "positiveInt":	
			return "sap.ui.model.type.Integer";
		case "dateTime":
			return "sap.ui.model.type.DateTime";
		default:
			return "sap.ui.model.type.String";
		}
	};
	
	const mapComparator2Operator = function(comparator) {
		switch(comparator) {
		case "eq":
			return "EQ";
		case "lt":
			return "LT";
		case "le":
			return "LE";
		case "gt":
			return "GT";
		case "ge":
			return "GE"
		default:
			return null;
		}
	};

	const mapModifier2Operator = function(modifier) {
		switch(modifier) {
		case "contains":
			return "Contains";
		default:
			return null;
		}
	};

	const map2OperatorArray = function(aComparator, aModifier) {
		const aOperator = [];
		let bContainsGE = false;
		let bContainsLE = false;
		if (aComparator) {
			aComparator.forEach(function(comparator) {
				const operator = mapComparator2Operator(comparator);
				if (operator) {
					aOperator.push(operator);
					if (!bContainsGE) {
						bContainsGE = (operator == "GE");
					}
					if (!bContainsLE) {
						bContainsLE = (operator == "LE");
					}
				}
			});
		} 
		if (aModifier) {
			aModifier.forEach(function(modifier) {
				const operator = mapModifier2Operator(modifier);
				if (operator) {
					aOperator.push(operator);
				}
			});
		}
		if (bContainsGE && bContainsLE) {
			aOperator.push("BT");
		}
		if (aOperator.length == 0) {
			aOperator.push("EQ");
		}
		return aOperator;
	}
	
	const sortAscending = function(a, b) {
		if (a.path < b.path) {
			return -1;
		}
		if (a.path > b.path) {
			return 1;
		}
		return 0;
	};

	const copyArray = function(array) {
		return array.map(x => Object.assign(x));
	};

	const isRootFHIRPath = function(FHIRPath) {
		return (FHIRPath.lastIndexOf(".") < 0);
	};
	
	const traverse = function(baseStructure, typeList, baseFHIRPath, bindingPaths, properties, searchParams, isRoot) {
		// skip the first element which is for the resource
		const elementList = baseStructure.snapshot.element;
		for (let i = 1; i < elementList.length; i++) {			
			const element = elementList[i];
			// Example: Account.id or Patient.contact.gender
			let FHIRPath = element.path;

			// For Extension ignore everything except Extension.value[x]
			if (baseStructure.type == "Extension" && FHIRPath != "Extension.value[x]") {
				continue;
			}

			// remove base type name element and add base path
			let pos = FHIRPath.indexOf(".");
			// Example: id or contact.gender
			FHIRPath = baseFHIRPath.length > 0 ? baseFHIRPath + "." + FHIRPath.substring(pos + 1) : FHIRPath.substring(pos + 1);

			// skip contained, meta, text
			if (FHIRPath == "contained" || FHIRPath == "meta" || FHIRPath == "text") {
				continue;
			}

			pos = FHIRPath.lastIndexOf(".");
			const elementName = FHIRPath.substring(pos + 1);
			// stop the endless loop between Identifier and Reference
			if ((!isRoot && elementName == "id") || (elementList[0].path == "Identifier" && elementName == "assigner")) {
				continue;
			}

			const elementPrefix = FHIRPath.substring(0, pos);

			const prefixBindingPath = bindingPaths[elementPrefix];
			let bindingPath = null;
			if (prefixBindingPath) {
				bindingPath = prefixBindingPath + "/" + elementName;
				if (element.max == "*") {
					bindingPath += "/0";
				}					
			} else {
				bindingPath = FHIRPath.replace(".","/");
				if (element.max == "*") {
					bindingPath += "/0";
				}					
			}

			const typeCode = element.type[0].code;
			// no Reference and Extension only to the first level = simple
			// extensions
			// and if it is a slice!
			if ((isComplexType(typeCode) && typeCode != "Reference" && typeCode != "Extension") || 
					(typeCode == "Extension" && isRoot && element.sliceName)) {
				bindingPaths[FHIRPath] = bindingPath;
				// not completely correct because of modifier extension in
				// BackboneElement include elements from complex types

				const profile = element.type[0].profile ? element.type[0].profile[0] : null;				
				const sd = profile ? typeList.find(sd => sd.resource.url == profile) : 
					typeList.find(sd => sd.resource.type == typeCode);
				
				if (sd) {
					const typeElementList = sd.resource.snapshot.element;
					typeElementList.sort(sortAscending);
					traverse(sd.resource, typeList, FHIRPath, bindingPaths, properties, searchParams, false);
				}				
			}

			if (isPrimitiveType(typeCode) && element.max != "0")  {
				const property = {};
				
				if (baseStructure.type == "Extension") {
					// Transform value[x] to value<Type>
					const namePrefix = bindingPath.substring(0, bindingPath.length - 3);
					const typeName = typeCode.substring(0, 1).toUpperCase() + typeCode.substring(1, typeCode.length);
					const name = namePrefix + typeName;
					property.path = "extension/[url=" + baseStructure.url + "]/value" + typeName;
					// property.path = name;
					property.name = name.replaceAll("/", "-");
				} else {
					property.path = bindingPath;
					property.name = bindingPath;
				}
				property.label = element.label || element.short || element.id;
				property.tooltip = element.short || element.id;
				property.maxConditions = -1;
				property.required = false;
				property.visible = true;
				property.owner = "MetadataProviderOriginal";

				let pos = FHIRPath.indexOf(".")
				let oSearchParamEntry = searchParams.find(param => {
					const pos = param.resource.expression.indexOf(".");
					const expression = param.resource.expression.substring(pos + 1);
					return expression == FHIRPath;
				});
/*
 * if (baseStructure.type == "Extension") { //
 * "ExceptionAccount.extension(url='http://sap.com/fhir/StructureDefinition/patient-gender')"
 * searchParam = searchParams.find(param => { const pos =
 * param.resource.expression.indexOf("."); const expression =
 * param.resource.expression.substring(pos + 1); return expression ==
 * "extension(url='" + baseStructure.url + "')"; }); }
 */				
				if (oSearchParamEntry) {
					const oSearchParameter = oSearchParamEntry.resource;
					property.sortable = true;
					property.filterable = true;
					// could be derived from SearchParameter definition!
					const aFHIRComparators = oSearchParameter.comparator;
					const aFHIRModifiers = oSearchParameter.modifier;
					const aFilterOperators = map2OperatorArray(aFHIRComparators, aFHIRModifiers);
					property.filterOperators = aFilterOperators; //["EQ"];
				} else {
					property.sortable = false;
					property.filterable = false;
				}
				
				property.group = "standard";
				property.groupLabel = "Standard";

				// binding information
				if (element.binding) {
					property.valueSetUri = element.binding.valueSet;
				}

				const FHIRType = element.type[0].code;
				//property.type = mapFHIR2UI5Type(FHIRType);
				property.type = FHIRType;

				properties.push(property);
			}		
		}
	};
	
	const parallelExecution = function(inParam) {
		// import data:
		// inParam.uris -> uris of the SearchParameters
		// inParam.valueSetUris -> uris of the ValueSets
		// inParam.profile -> profile url of the main resource type
		return Promise.all([httpHandler.request("GET", 
				this.base + "/StructureDefinition/?url=" + inParam.profile + "&_format=json").then(
						extractUris
						// export data:
						// outParam.baseElements
						// outParam.uris
				).then(
						inParam => {
							return Promise.all([Promise.resolve(inParam.baseStructure),
								httpHandler.request("GET", 
										this.base + "/StructureDefinition/?url=" + inParam.uris + "&_format=json")]);
						}
				), 
				httpHandler.request("GET", 
						this.base + "/SearchParameter/?url=" + inParam.urls + "&_format=json")				
		]);

	}.bind(instance);
	const createPropertyList = function(inParam, propertyType) {
		// import data
		// imParam[0][0] -> baseStructure
		// imParam[0][1] -> Payload of StructureDefinitions of FHIR types
		// imParam[1] -> Payload of SearchParameters
		const baseStructure = inParam[0][0];

		const typesBundle = JSON.parse(inParam[0][1].data);
		const typeList = typesBundle.entry;

		const searchParamsBundle = JSON.parse(inParam[1].data);
		const searchParamList = searchParamsBundle.entry;
		
		// sort in ascending order regarding path
		const baseElements = baseStructure.snapshot.element;
		baseElements.sort(sortAscending);
		const props = [];
		const bindingPaths = {};

		traverse(baseStructure, typeList, "", bindingPaths, props, searchParamList, true);
		props.sort(sortAscending);
		console.log(props);
		return copyArray(props);
		//return Promise.resolve(copyArray(props));	
	};
	
	const createFilterPropertyList = function(inParam) {
		return createPropertyList(inParam, FILTER_TYPE);
	};

	const createTablePropertyList = function(inParam) {
		return createPropertyList(inParam, TABLE_TYPE);
	};


	const extractUris = function(inParam) {
		// import data
		// inParam.data -> StructureDefinition of main resource type
		const sdBundle = JSON.parse(inParam.data);
		const elementList = sdBundle.entry[0].resource.snapshot.element;
		// const elementList = sdBundle.entry[0].resource.snapshot.element;
		const codes = new Set();
		let structureDefinitionUris = "";
		let valueSetUris = "";
		for (let element of elementList) {
			if (element.type && element.type.length) {
				// only single types!
				const type = element.type[0];
				const code = type.code;
				const profile = type.profile;	
				// Ignore un-profiled extensions as they do not provide
				// additional fields
				if (type == "Extension" && !profile) {
					continue;
				}
				
				const uri = profile ? profile : "http://hl7.org/fhir/StructureDefinition/" + code;
				// only complex types
				if (!codes.has(uri) && isComplexType(code)) {
					codes.add(uri);
					structureDefinitionUris += (structureDefinitionUris == "") ? uri : "," + uri;
				}
				if (element.binding) {
					let valueSetUri = element.binding.valueSet;
					valueSetUris += (valueSetUris == "") ? valueSetUri : "," + valueSetUri;
				}
			}
		}
		const outParam = {};
		outParam.baseStructure = sdBundle.entry[0].resource;
		outParam.uris = structureDefinitionUris;
		outParam.valueSetUris = valueSetUris;
		return outParam;
		//return Promise.resolve(outParam);		
	};

	const httpHandler = new HttpHandler();
	
	FHIRMetadataProvider.prototype.init = function(base, resourceTypes, configurationUrl) {
		this.base = base;
		this.profileMap = {};
		if (configurationUrl) {
			this.capabilities = Promise.all([
				httpHandler.request("GET", this.base + "/metadata/?_format=json"),
				httpHandler.request("GET", configurationUrl),
			]).then(
				function(inParams) {
					const outParams = {data: inParams[0].data};
					const profiles = JSON.parse(inParams[1].data);
					for (entry of profiles.resourceTypes) {
						this.profileMap[entry.resourceType] = entry.profile; 
					}
					return outParams;
				}.bind(this)
			);
		} else if (resourceTypes) {
			for (let entry of resourceTypes) {
				this.profileMap[entry.resourceType] = entry.profile; 
			}
			this.capabilities = httpHandler.request("GET", this.base + "/metadata/?_format=json");
		}
	};

	FHIRMetadataProvider.prototype.getTableProperties = function(resourceType) {
		return this.getProperties(resourceType).then(function(properties) {
			const tableProperties = [];
			for (let property of properties) {
				const tableProperty = {};
				tableProperty.type = property.type; 
				tableProperty.name = property.name; 
				tableProperty.path = property.path
				tableProperty.label = property.label; 
				tableProperty.sortable = property.sortable; 
				tableProperty.filterable = property.filterable;
				tableProperties.push(tableProperty);
			}
			return tableProperties;
			//return Promise.resolve(tableProperties);
		});
	};

	FHIRMetadataProvider.prototype.getFilterProperties = function(resourceType) {
		return this.getProperties(resourceType).then(function(properties) {
			const filterProperties = [];
			for (let property of properties) {
				if (!property.filterable) {
					continue;
				}
				const filterProperty = {};
				filterProperty.type = property.type; 
				filterProperty.name = property.name;
				filterProperty.path = property.path;
				//filterProperty.tooltip = property.tooltip;
				filterProperty.label = property.label; 
				//filterProperty.required = property.required; 
				//filterProperty.hiddenFilter = property.hiddenFilter;
				filterProperty.visible = property.visible;
				filterProperty.maxConditions = property.maxConditions;
				if (property.fieldHelp) {
					filterProperty.fieldHelp = property.fieldHelp;
				}
				if (property.display) {
					filterProperty.display = property.display;
				}
				if (property.filterOperators) {
					filterProperty.filterOperators = property.filterOperators.slice();
				}
				if (property.valueSetUri) {
					filterProperty.valueSetUri = property.valueSetUri;
				}
				filterProperties.push(filterProperty);
			}
			
			const searchProperty = {};
			searchProperty.type = "sap.ui.model.type.String";
			searchProperty.name = "$search";
			searchProperty.path = "$search";
			searchProperty.label = "Search";
			searchProperty.visible = true;
			searchProperty.maxConditions = 1;
			filterProperties.push(searchProperty);
			return filterProperties;
			//return Promise.resolve(filterProperties);
		});
	};
	
	FHIRMetadataProvider.prototype.getProperties = function(resourceType) {

		if (this.propertiesMap[resourceType]) {
			return this.propertiesMap[resourceType];
		}

		const extractSearchParams = function(inParam) {
			const data = JSON.parse(inParam.data);
			const server = data.rest.find(element => element.mode == "server");
			const capabilities = server.resource.find(resource => resource.type == resourceType);
			const searchParams = capabilities.searchParam;
			let urls = "";
			let initial = true;
			for (let param of searchParams) {
				urls += initial ? param.definition : "," + param.definition;
				initial = false;
			}
			const outParam = {};
			outParam.urls = urls;
			console.log(urls);
			outParam.profile = this.profileMap[resourceType];
			return outParam;
			//return Promise.resolve(outParam);			
		}.bind(this);
		
		const properties = this.capabilities.then(
						extractSearchParams
						// export data:
						// outParam.names
						// outParam.profile
				).then(
						// parallel fetch search parameters and resource
						// StructureDefinition
						parallelExecution
						// export data
						// outParam[0][0] -> base StructureDefinition
						// outParam[0][1] -> Payload of StructureDefinitions of
						// FHIR types
						// outParam[1] -> Payload of SearchParameters
				).then(
						createPropertyList
				);
		this.propertiesMap[resourceType] = properties;		
		return properties;		
	};

	return instance;
});