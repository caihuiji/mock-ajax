/**
 * <p>
 * description:
 * this plugin of  ajax fake  for juqery  ,
 * 
 * </p>
 * 
 * <p>
 * usage :
 * Install ajax fake to jquery
 * 
 * <pre>
 * jasmine.Ajax.useMock();
 * </pre>
 * 
 * when you use ajax request from server ,you can use the interface mock
 * successful response which mock-ajax had implement:
 * 
 * <pre>
 * getCurrentAjax().response(param);
 * 
 * param is a key/value pairs that client should use,example: 
 * {status : 200 , responseText:'ok' , readyState : 4 , responseHeaders : '' , contentType : ''}
 * 
 * for more detail,you can see about XMLHttpReponse.
 * </pre>  
 * </p>
 * 
 * dependence : jQuery , jasmine
 */

(function(window, $) {

	// Fake XHR for mocking Ajax Requests & Responses
	var FakeXMLHttpRequest = function() {
		var extend = Object.extend || $.extend;
		extend(this, {
			requestHeaders : {},

			open : function() {
				this.method = arguments[0];
				this.url = arguments[1];
				this.readyState = 1;
			},

			setRequestHeader : function(header, value) {
				this.requestHeaders[header] = value;
			},

			abort : function() {
				this.readyState = 0;
			},

			readyState : 0,

			onreadystatechange : function(isTimeout) {
			},

			status : null,

			send : function(data) {
				this.params = data;
				this.readyState = 2;
			},

			getResponseHeader : function(name) {
				return this.responseHeaders[name];
			},

			getAllResponseHeaders : function() {
				var responseHeaders = [];
				for ( var i in this.responseHeaders) {
					if (this.responseHeaders.hasOwnProperty(i)) {
						responseHeaders.push(i + ': ' + this.responseHeaders[i]);
					}
				}
				return responseHeaders.join('\r\n');
			},

			responseText : null,

			response : function(response) {
				this.status = response.status || 200;
				this.responseText = response.responseText || "";
				this.readyState = response.readyState || 4;
				this.responseHeaders = response.responseHeaders || {
					"Content-type" : response.contentType || "text/html"
				};
				// uncomment for jquery 1.3.x support
				// jasmine.Clock.tick(20);

				this.onreadystatechange();
			}
		});

		return this;
	};
	
	var ajax = new FakeXMLHttpRequest();
	
	window.getCurrentAjax = function (){
		return ajax;
	}
	$.ajaxSettings.xhr = window.getCurrentAjax;

}(window, jQuery));
