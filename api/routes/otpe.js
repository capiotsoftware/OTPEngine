var express = require("express");
var router = express.Router();
var rfcOtp = require("../helpers/rfcOtp");
var otpMgr = require("../helpers/otpMgr");
var util = require("util");
var utilitiy = require("../helpers/utils");

router.post("/validate", function (req, res) {
    var channelDetail = req.channelDetail;
    if (req.query["otp"] && req.query["secret"]) {
        var options = {};
        options.length = channelDetail.otpLength;
        options.secret = req.query.secret;

        if (channelDetail.policy === "TOTP") {
            var stepDelta = 0;
            options.step = channelDetail.lifespan;
            while (stepDelta < 2) {
                options.seedTime = (channelDetail.lifespan * stepDelta);
                if (rfcOtp.totp(options) === req.query.otp) {
                    res.status(200).json(true);
                    break;
                }
                stepDelta++;
            }
            if (stepDelta === 2) {
                //Did not verify pin
                res.status(200).json(false);
            }

        } else if (channelDetail.policy === "HOTP") {
            if (req.query["count"]) {
                options.count = req.query.count;
                res.status(200).json(rfcOtp.hotp(options) === req.query.otp);
            } else {
                utilitiy.sendError(res, "INVALID_ARG");
            }
        } else {
            //C-HTOP
            otpMgr.verifyOTP(channelDetail, req.query.secret, req.query.otp)
                .then(result => res.status(200).json(result))
                .catch(err => utilitiy.sendError(res, "INVALID_ARG",err.message));
        }
    } else {
        utilitiy.sendError(res, "INVALID_ARG", "otp / secret");
    }
});

router.post("/create", function (req, res) {
    if (req.query["secret"]) {
        var otp = null;
        var channelDetail = req.channelDetail;
        var options = {};
        var cotpPromise = null;
        options.length = channelDetail.otpLength;
        options.secret = req.query.secret;
        if (channelDetail.policy === "TOTP") {
            options.step = channelDetail.lifespan;
            otp = rfcOtp.totp(options);
            
        } else if (channelDetail.policy === "HOTP") {
            if (req.query["count"] && isFinite(req.query.count)) {
                options.count = Number(req.query.count);
                otp = rfcOtp.hotp(options);
            }
        } else {
            options.step = channelDetail.lifespan;
            options.count = req.query["count"] && isFinite(req.query.count) ? Number(req.query.count) : Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
            otp = rfcOtp.hotp(options);
            cotpPromise = otpMgr.createOTP(channelDetail, req.query.secret, otp);  
        }

        if (otp) {
            if (channelDetail.policy === "CUSTOM") {
                cotpPromise.then(doc => {
                    if (doc) {
                        res.status(200).send(util.format(channelDetail.messageTemplate, otp));
                    } else {
                        utilitiy.sendError(res, "INVALID_ARG");
                    }
                }, err => utilitiy.sendError(res, "INVALID_ARG", err.message));
            } else {
                res.status(200).send(util.format(channelDetail.messageTemplate, otp));
            }
        } else {
            utilitiy.sendError(res, "INVALID_ARG");
        }
    } else {
        utilitiy.sendError(res, "INVALID_ARG");
    }
});



module.exports = router;