sap.ui.define([], function() {

    // create a new class
    var HttpHandler = function() {};

    // add methods to its prototype
    HttpHandler.prototype.request = function(method, url, body, headers) {
    	  return new Promise(function (resolve, reject) {
    		    var xhr = new XMLHttpRequest();
    		    xhr.open(method, url);
    		    if (headers) {
    		    	Object.keys(headers).forEach(key => {
    	                xhr.setRequestHeader(key, headers[key]);
    	            });
    		    }
    		    xhr.onload = function () {
    		      if (this.status >= 200 && this.status < 300) {
    		        resolve({data: xhr.response});
    		      } else {
    		        reject({
    		          status: this.status,
    		          statusText: xhr.statusText
    		        });
    		      }
    		    };
    		    xhr.onerror = function () {
    		      reject({
    		        status: this.status,
    		        statusText: xhr.statusText
    		      });
    		    };
    		    xhr.send(body);
    		  });
    		}
    // return the class as module value
    return HttpHandler;
  });