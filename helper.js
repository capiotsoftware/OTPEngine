var speakeasy=require('speakeasy');
var config=require('../../config');

var _exports={};

_exports.generateOTP = function(secret,callback){
	callback(speakeasy.totp({key:secret, step: config.minValidityPeriod}));
}

_exports.verifyOTP = function(secret,pin){
	var codeToCheck = speakeasy.totp({key:secret, step: config.minValidityPeriod});
	if(!(pin==codeToCheck))
	{
		codeToCheck = speakeasy.totp({key:secret, step: config.minValidityPeriod, time:(parseInt(new Date()/1000)-config.minValidityPeriod)});
		if(!(pin==codeToCheck))
		{
			return false;
		}
	}
	return true;
}

_exports.resendOTP = function(secret, callback){
	_exports.generateOTP(secret, callback);
}

module.exports= _exports;