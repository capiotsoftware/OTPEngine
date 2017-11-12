var expect = require('chai').expect;
var requestor = require('../reqPrmoise');

describe('A basic test', function(){
	it('should pass when everything is okay',function(){
		expect(true).to.be.true;
	});

});

describe('A Basic OTP Engine check',function(){
	it('should get a simple OTP for a passcode',function(done){
		var otpResponsePromise = reqPrmoise({
			hostname : 'localhost:8081',
			port:8085,
			path:'/totp/alwaysangry',
			method:'GET'
		});
	otpResponsePromise.then(
		function(body){},
		done
	});
});