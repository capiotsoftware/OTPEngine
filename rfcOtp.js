/* global Buffer */
/* global os */
var crypto = require('crypto');
var bignum = require('bignum');

var padVals = [
	'',
	'0',
	'00',
	'000',
	'0000',
	'00000',
	'000000',
	'0000000'
];

var defaultOpts = {
	length: 6,
	encoding: 'ascii',
	timeStep : 60
};

var hotp = function (options) {
	if (!options.secret) {
		//cant work without a secret!
		return null;
	}
	var secret = options.secret;
	var length = options.length || defaultOpts.length;
	var encoding = options.encoding || defaultOpts.encoding;
	var counter = options.count;
	var buffer = new Buffer(secret, encoding);
	var hmac = crypto.createHmac('sha1', buffer);
	var bCounter = bignum(counter);
	hmac.update(bCounter.toBuffer({
		endian: 'big',
		size: 8
	}));

	var hmacDigest = hmac.digest();
	var readOffset = hmacDigest.readUInt8(19) & 0xF;

	var otpCode = hmacDigest.readUInt32BE(readOffset) & 0x7FFFFFFF;
	var otpCodeStr = otpCode.toString();
	if (otpCodeStr.length < 8) {
		otpCodeStr = padVals[8 - otpCodeStr.length] + otpCodeStr;
	}
	if (length < 8) {
		otpCodeStr = otpCodeStr.substr(otpCodeStr.length - length, length);
	}

	return otpCodeStr;
};

var totp = function (options) {
	var seedTime = options.seedTime || 0;
	var time = options.time || Math.floor(Date.now() / 1000);
	var step = options.step || defaultOpts.timeStep;
	var count = Math.floor((time - seedTime) / step);
	var opts = JSON.parse(JSON.stringify(options));
	opts.count = count;
	return hotp(opts);
};

module.exports = {
	hotp: hotp,
	totp: totp
};