var mongoose = require("mongoose");
var db = mongoose.createConnection(process.env.MONGO_URL || "mongodb://localhost:27017/otpe");
var crypto = require("crypto");
var util = require("../helpers/utils");
var definition = {

    name: { type: String, required: true, index: { unique: true } },
    policy: {
        type: String, enum: [
            "TOTP",
            "HOTP",
            "CUSTOM"
        ]
    },
    lifespan: { type: Number, min: 120 },
    otpLength: { type: Number, min: 4, max: 8 },
    apiKey: {
        primary: { type: String },
        secondary: { type: String }
    },
    defaultEncoding : { type: String, default: "ascii"},
    outboundURL: { type: String },
    messageTemplate: { type: String },
    active: {type: Boolean, default: true}
};
var schema = new mongoose.Schema(definition);

schema.pre("save", function (next) {
    if (!this._id) {
        //new Object!
        if (this.policy == "HOTP" || this.lifespan) {
            next();
        } else {
            next(new Error("lifespan cannot be empty"));
        }
    } else {
        next();
    }
});
schema.pre("save", function (next) {
   //Generate API Key
    if (!this.apiKey.primary ) {
        this.apiKey.primary = crypto.randomBytes(18).base64Slice();
        this.apiKey.secondary = crypto.randomBytes(18).base64Slice();      
    }
    next();
});
schema.post("save", function (doc) {
    console.log(doc);
});

var model = db.model("channel", schema);

var createChannel = function (name, policy, lifespan, otpLength, outboundURL, messageTemplate) {
    try {
        var channel = new model();
        channel.name = name;
        channel.policy = policy;
        channel.lifespan = lifespan;
        channel.otpLength = otpLength;
        channel.outboundURL = outboundURL;
        channel.messageTemplate = messageTemplate;
        var x = channel.save();
        return x;
    } catch (err) {
        console.log(err);
    }
};

var getChannel = function (name, token) {
    var queryStruct = util.channelValidator(name, token);
    return model.findOne(queryStruct).exec();
};

var updateChannel = function (name, token, update) {
    var queryStruct = util.channelValidator(name, token);
    return model.findOneAndUpdate(queryStruct, update).exec();
};

var validateChannel = function (name, key) {
    return new Promise((res, rej) => {
        var queryStruct = util.channelValidator(name, key);
        model.findOne(queryStruct).exec()
            .then(doc => doc ? res(true) : res(false)).catch(err => rej(err));
    });
};

module.exports = {
    createChannel: createChannel,
    getChannel: getChannel,
    validateChannel: validateChannel,
    updateChannel: updateChannel
};