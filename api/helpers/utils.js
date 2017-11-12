var util = require("util");

require("mongoose").Promise = global.Promise;

var errorList = {
    "INVALID_ARG": {
        msg: "Invalid / Missing Argument %s",
        code: 400
    },
    "NOT_FOUND": {
        msg: "Not Found %s",
        code: 404
    },
    "SAVE_ERR": {
        msg: "Couldnot save the object %s",
        code: 400
    },
    "INACTIVE": {
        msg: "Channel Inactive %s",
        code: 400
    }
};

var sendError = (res, err, arg) => {
    try {
        var actErr = errorList[err];
        arg = arg ? arg : "";
        if (actErr) {
            res.status(actErr.code).send(util.format(actErr.msg, arg));
        } else {
            res.status(400).send(err);
        }
    } catch (err) {
        console.log(util.format(err));
        res.status(500).send();
    }
};

var channelValidator = (name,key) => ({
    "name": name,
    "$or": 
    [
        {"apiKey.primary": key },
        { "apiKey.secondary": key }
    ]
});
module.exports = {
    sendError: sendError,
    channelValidator: channelValidator
};