/*

Routines common for Nitro (and other recent BBC APIs)

*/

var http = require('http');
//var https = require('https');
var util = require('util');

var debuglog = util.debuglog('bbc');

var dest = {};

function makeRequest(host,path,key,query,accept,callback){
	debuglog(host+path+'?K'+query.querystring);
	var options = {
	  hostname: host
	  ,port: 80
	  ,path: path+'?api_key='+key+query.querystring
	  ,method: 'GET'
	  ,headers: { 'Accept': accept,
		'User-Agent': 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-gb; HTC_DesireZ_A7272 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
	  }
	};

	var list = '';
	var obj;
	var json = (accept == 'application/json');

	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (data) {
		   list += data;
	  });
	  res.on('end', function() {
		if (res.statusCode >= 300 && res.statusCode < 400 && hasHeader('location', res.headers)) {
			// handle redirects, as per request module
			var location = res.headers[hasHeader('location', res.headers)];
			var locUrl = url.parse(location);
			path = locUrl.pathname;
			host = locUrl.host;
			make_request(host,path,key,query,callback);
		}
		else if (res.statusCode >= 400 && res.statusCode < 600) {
			console.log(res.statusCode+' '+res.statusMessage);
			if (list) {
				try {
					if (json) {
						obj = JSON.parse(list);
					}
					else {
						obj = list;
					}
					if (json && obj.fault) {
						logFault(obj);
					}
					else if (json && obj.errors) {
						logError(obj);
					}
					else {
						console.log('Unknown response object');
						console.log(obj);
					}
				}
				catch (err) {
					console.log(err);
					console.log('Invalid JSON received:');
					console.log(list);
				}
			}
		}
		else try {
			if (json) {
				obj = JSON.parse(list);
			}
			else {
				obj = list;
			}
			var result = callback(obj);
			if (dest.callback) {
				// call the callback's next required destination
				// e.g. second and subsequent pages
				if (dest.path) {
					makeRequest(host,dest.path,key,dest.query,accept,dest.callback);
				}
				else {
					dest.callback();
				}
			}
		}
		catch(err) {
			console.log('Something went wrong parsing the response JSON');
			console.log(err);
			console.log(res.statusCode+' '+res.statusMessage);
			console.log(res.headers);
			console.log('** '+list);
		}
	   });
	});
	req.on('error', function(e) {
	  console.log('Problem with request: ' + e.message);
	});
	req.end();
}

module.exports = {

	setReturn : function(destination) {
		dest = destination;
	},
	
	getReturn : function(){
		return dest;
	},
	
	logFault : function(fault) {
	/*
	{ "fault": {
		"faultstring": "Rate limit quota violation. Quota limit : 0 exceeded by 1. Total violation count : 1. Identifier : YOUR-API-KEY-HERE",
		"detail":
			{"errorcode": “policies.ratelimit.QuotaViolation"}
		}
	}
	*/
		console.log(fault.fault.detail.errorcode+': '+fault.fault.faultstring);
	},
	logError : function(error) {
	/*
	{"errors":{"error":{"code":"XDMP-EXTIME","message":"Time limit exceeded"}}}
	*/
		console.log(error.errors.error.code+': '+error.errors.error.message);
	},
	hasHeader : function (header, headers) {
		// snaffled from request module
		var headers = Object.keys(headers || this.headers),
			lheaders = headers.map(function (h) {return h.toLowerCase();});
		header = header.toLowerCase();
		for (var i=0;i<lheaders.length;i++) {
			if (lheaders[i] === header) return headers[i];
		}
		return false;
	},
	
	make_request : function(host,path,key,query,accept,callback) {
		makeRequest(host,path,key,query,accept,callback);
	}

}
