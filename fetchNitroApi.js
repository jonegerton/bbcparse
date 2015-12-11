'use strict';

var fs = require('fs');

var helper = require('./apiHelper');
var nitro = require('./nitroCommon');

//_____________________________________________________________________________

var config = require('./config.json');
var api_key = config.nitro.api_key;
var host = config.nitro.host;
var query = helper.newQuery();

nitro.make_request(host,'/nitro/api',api_key,query,'application/json',function(obj){
	console.log('JSON API');
	fs.writeFileSync('./nitroApi/api.json',JSON.stringify(obj,null,2));
	return false;
});
nitro.make_request(host,'/nitro/api',api_key,query,'text/xml',function(obj){
	console.log('XML API');
	fs.writeFileSync('./nitroApi/api.xml',obj);
	return false;
});
nitro.make_request(host,'/nitro/api/schema',api_key,query,'text/xml',function(obj){
	console.log('XML Schema');
	fs.writeFileSync('./nitroApi/nitro-schema.xsd',obj);
	return false;
});