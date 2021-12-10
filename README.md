# MDC documentation

Documentation: 

•	SDK: https://sapui5untested.int.sap.eu2.hana.ondemand.com/sapui5-sdk-internal/#/api/sap.ui.mdc.condition.Condition 
•	Source Code: https://github.com/SAP/openui5/tree/master/src/sap.ui.mdc/src/sap/ui/mdc 
•	Sample Apps:
•	JSON: http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample/test-resources/sap/ui/mdc/internal/BooksJSON/index.html 
•	ODATA V4: http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample/test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html 
•	FHIR PoC: https://github.wdf.sap.corp/D028776/billing-ui  + FHIR service in https://github.wdf.sap.corp/D028776/fhir-service 

Challenges/Open Topics:

•	Table grouping
•	Connecting portal/flexibility service to store/recover variants  PoC required


# billing-ui
Billing UI with MDC control

## How to run
1. start local FHIH service (springboot app)
2. cd C:\Users\i035299\Documents\GitHub\mdc-ui
3. npm install
4. npm run serve
5. http://localhost:8080

### How to Consume in UI5 Application
* Find latest version from SAP Internal Nexus  
* Add .npmrc file with the following configuration(since its released only to SAP Nexus and not public npm registry)
@sap:registry=http://nexus.wdf.sap.corp:8081/nexus/content/groups/build.milestones.npm


* Add it as dependency in package.json

// change ui5/cli, otherwise npm install will fail

	"devDependencies": {
		"@ui5/cli": "^2.11.3"
	},

	"dependencies": {
		"@sap/sap-pacc-ui5-poc":"1.0.0-20210728162555"
	},  		

	"ui5": {
		"dependencies": [
			"@sap/sap-pacc-ui5-poc"
    	]
	}

* Add the resource roots in manifest.json under `sap.ui5` section

	"dependencies": {
		"libs": {
        	...
        	"sap.pacc": {}
    	}
	},
	
	"resourceRoots": {
		...
    	"sap.pacc": "../resources/sap/pacc/"
	},

* Initialise and Consume the method

	sap.ui.define([
    	...
    	"sap/pacc/ui5/poc/FHIRCustomDateUtils"
    	], function (FHIRCustomDateUtils) {
        	someFn : function(){
            	var sDate = "2021-03-02"
            	sap.m.MessageBox.show(FHIRCustomDateUtils.formatDate(sDate));
        	}
    	}
		...

