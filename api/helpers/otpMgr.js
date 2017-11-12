var mongoose = require("mongoose");
var db = mongoose.createConnection(process.env.MONGO_URL || "mongodb://localhost:27017/otpe");
var crypto = require("crypto");
var rfcOtp = require("./rfcOtp");

/* C-HTOP implementation. */

var modelCache = {};

var getCollectionName = (name) => "c" + name;

var channelSpecificModel = function (channelDetails) {
    var collectionName = getCollectionName(channelDetails.name);
    if (modelCache[collectionName]) {
        return modelCache[collectionName];
    } else {
        var definition = {
            secret: { type: String, index: { unique: true } },
            otp: { type: String },
            salt: { type: String },
            createdAt: { type: Date, expires: channelDetails.lifespan }
        };
        var schema = mongoose.Schema(definition);
        schema.pre('save', function (next) {
            this.salt = crypto.randomBytes(12).base64Slice();
            var hmac = crypto.createHmac("sha1", Buffer(this.otp));
            hmac.update(Buffer(this.salt));
            this.otp = hmac.digest().base64Slice();
            this.createdAt = new Date();
            next();
        });
        schema.method("verifyOTP", function (otp) {
            var hmac = crypto.createHmac("sha1", Buffer(otp));
            hmac.update(this.salt);
            return hmac.digest().base64Slice() == this.otp;
        });
        var model = db.model(collectionName, schema);
        modelCache[collectionName] = model;
        return model;
    }
};

var createCOTP = function (channelDetails, secret, otp) {
    var model = channelSpecificModel(channelDetails);
    var COTP = new model({ secret: secret, otp: otp });
    return COTP.save();
};

var verifyOTP = function (channelDetails, secret, otp) {
    var model = channelSpecificModel(channelDetails);
    return model.findOne({ secret: secret }).exec().then(doc => {
        var verify = false;
        console.log(doc);
        if (doc) {
            verify = doc.verifyOTP(otp);
            console.log("Verify : " + verify);
            if (verify) {
                doc.remove();
            }
        }
        return verify;
    });
};

var cancelOTP = function (channelDetails, secret) {
    var model = channelSpecificModel(channelDetails);
    model.delete
};

module.exports = {
    createOTP: createCOTP,
    verifyOTP: verifyOTP,
    cancelOTP: cancelOTP
};
