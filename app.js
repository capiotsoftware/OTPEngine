var express = require('express');
var app = express();
var helper = require('./rfcOtp');
var config = require('./config');

var getTimeStepFromRequest = function (req) {
	console.log("Req Params : " + JSON.stringify(req.query));
	if (req.query.hasOwnProperty('timestep')) {
		var timeStep = parseInt(req.query.timestep);
		if (timeStep != NaN && timeStep > 0) {
			return (timeStep);
		} else {
			return (config.timeStep);
		}
	} else {
		return (config.timeStep);
	}
};

app.get('/totp/:secret', function(req, res){
	var totpParams = {};
	totpParams.secret = req.params.secret;
	totpParams.step = getTimeStepFromRequest(req);
	// console.log("Time Step : " + totpParams.step);
	console.log("Params : " + JSON.stringify(totpParams));
	var totp = helper.totp(totpParams);
	if (totp) {
		res.status(200).json({
			key: req.params.secret,
			status: true,
			pin: totp
		})
	} else {
		res.status(400).json({
			key: req.params.secret,
			status: false,
			pin: null
		});
	}
	
});

app.get('/verify_totp/:secret/:pin', function (req, res) {
	var originalSteps = 2;
	var steps = 2;
	var totParams = {};
	totParams.step = getTimeStepFromRequest(req);
	totParams.secret = req.params.secret;
	var verifiedPin = false;
	while (!verifiedPin && steps > 0) {
		steps--;
		totParams.time = Math.floor(Date.now() / 1000 - ((originalSteps - steps) * totParams.step));
		console.log("totParams : "+JSON.stringify(totParams));
		var totp = helper.totp(totParams);
		console.log(totp +"==="+ req.params.pin);
		if (totp && totp === req.params.pin) {
			verifiedPin = true;
			res.status(200).json({
				status: true,
				secret: req.params.secret,
				pin:req.params.pin
			});
		}
	}
	if (!verifiedPin) {
		console.log("Unable to verify Pin :(");
		res.status(403).json({
			status: false,
			secret: req.params.secret,
			pin: req.params.pin
		});
	}
});

// app.get('/resendOTP/:secret', function(req, res){
// 	helper.generateOTP(req.params.secret, callback);
// });

var server = app.listen(process.env.OTPPORT || config.serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
