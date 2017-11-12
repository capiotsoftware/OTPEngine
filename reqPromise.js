//Request Promisifier

var http = require('http');

var thinVeiledRequest = function(options){
	var promise = new Promise(function (resolve,reject){
		var req = http.request(options,function(res){
			var resPayload = "";
			res.on('data',function(chunk){
				resPayload += chunk;
			});
			res.on('end',function(){
				resolve(resPayload);
			});
		});
		req.on('error',function(err){
			reject(err);
		});
	});
}
