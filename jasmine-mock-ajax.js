/**
 * <p>
 * description:
 * this plugin of  ajax fake  for juqery in jasmine ,
 * 
 * </p>
 * 
 * <p>
 * usage :
 * use follow code can register mock-ajax into jQuery:
 * 
 * <pre>
 * jasmine.Ajax.useMock();
 * </pre>
 * 
 * when you use ajax request from server ,you can use the interface mock
 * successful response which mock-ajax had implement:
 * 
 * <pre>
 * mostRecentAjaxRequest().response(param);
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

(function(jasmine, $) {
	if (jasmine == null)
		throw 'jasmine is not defined';
	var ajaxRequests = [];

	mostRecentAjaxRequest = function() {
		if (ajaxRequests.length > 0) {
			return ajaxRequests[ajaxRequests.length - 1];
		} else {
			return null;
		}
	};

	clearAjaxRequests = function() {
		ajaxRequests = [];
	};

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
			},
			responseTimeout : function() {
				this.readyState = 4;
				jasmine.Clock.tick(jQuery.ajaxSettings.timeout || 30000);
				this.onreadystatechange('timeout');
			}
		});

		return this;
	}

	jasmine.Ajax = {

		isInstalled : function() {
			return jasmine.Ajax.installed == true;
		},

		assertInstalled : function() {
			if (!jasmine.Ajax.isInstalled()) {
				throw new Error("Mock ajax is not installed, use jasmine.Ajax.useMock()")
			}
		},

		useMock : function() {
			if (!jasmine.Ajax.isInstalled()) {
				var spec = jasmine.getEnv().currentSpec;
				spec.after(jasmine.Ajax.uninstallMock);

				jasmine.Ajax.installMock();
			}
		},

		installMock : function() {
			if (typeof $ != 'undefined') {
				jasmine.Ajax.installJquery();
			} else {
				throw new Error("jasmine.Ajax currently only supports jQuery and Prototype");
			}
			jasmine.Ajax.installed = true;
		},

		installJquery : function() {
			jasmine.Ajax.mode = 'jQuery';
			jasmine.Ajax.real = $.ajaxSettings.xhr;
			$.ajaxSettings.xhr = jasmine.Ajax.jQueryMock;

		},

		uninstallMock : function() {
			jasmine.Ajax.assertInstalled();
			if (jasmine.Ajax.mode == 'jQuery') {
				$.ajaxSettings.xhr = jasmine.Ajax.real;
			}
			jasmine.Ajax.reset();
		},

		reset : function() {
			jasmine.Ajax.installed = false;
			jasmine.Ajax.mode = null;
			jasmine.Ajax.real = null;
		},

		jQueryMock : function() {
			var newXhr = new FakeXMLHttpRequest();
			ajaxRequests.push(newXhr);
			return newXhr;
		},

		installed : false,
		mode : null,
	};
}(jasmine, jQuery));
