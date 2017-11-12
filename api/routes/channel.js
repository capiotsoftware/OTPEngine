
var express = require("express");
var router = express.Router();
var channelMgr = require("../helpers/channelMgr");
var util = require("../helpers/utils");
var otpe = require("./otpe");

router.post("/", function (req, res) {
    if (req.body && 
        req.body["name"]            && 
        req.body["policy"]          &&
        req.body["lifespan"]        &&
        req.body["otpLength"]       &&
        req.body["outboundURL"]     &&
        req.body["messageTemplate"]) {
        var z = channelMgr.createChannel(req.body.name,
            req.body.policy,
            req.body.lifespan,
            req.body.otpLength,
            req.body.outboundURL,
            req.body.messageTemplate);
        z.then(doc => res.status(200).json(doc),
                err => util.sendError("SAVE_ERR", err.message));
    } else {
        util.sendError(res, "INVALID_ARG");
    }
});

router.put("/:channel", function (req, res) {
    if (req.query["token"] && req.body) {
        channelMgr.updateChannel(req.params.channel, req.query.token, req.body)
            .then(response => res.status(200).send())
            .catch(err => util.sendError(res, "INVALID_ARG"));
    } else {
        util.sendError(res, "INVALID_ARG", "token");
    } 
});

router.get("/:channel", function (req, res) {
    if (req.params["channel"] &&
        req.query["token"]) {
        channelMgr.getChannel(req.params.channel, req.query.token)
            .then((doc) => doc ? res.json(doc) : util.sendError(res, "NOT_FOUND"));
    } else {
        util.sendError(res, "INVALID_ARG");
    }   
});

router.use("/:channel", function (req, res, next) {
    /*Validate Channel*/
    if (req.query["token"]) {
        channelMgr.getChannel(req.params.channel, req.query.token).then(result => {
            if (result && result.active) {
                req.channelDetail = result;
                next();
            } else {
                util.sendError(res, result? "INACTIVE" : "NOT_FOUND");
            }
        });
    } else {
        util.sendError(res, "INVALID_ARG");
    }
});
router.use("/:channel", otpe);

module.exports = router;