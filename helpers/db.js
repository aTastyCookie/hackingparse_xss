var mongoose = require('mongoose');
var config = require(__dirname + '/config');
var utils = require(__dirname + '/utils');

var shemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};


var data = new (mongoose.Schema)({
    type: String,
    title: String,
    url: String,
    parseUrl: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    cookies: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed,
    html: String,
    ts: {type: Number, default: utils.timestamp},
    ip: String,
    ua: mongoose.Schema.Types.Mixed
}, shemaOptions);

var key = new (mongoose.Schema)({
    title: String,
    url: String,
    parseUrl: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    cookies: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed,
    ts: {type: Number, default: utils.timestamp},
    ip: String,
    ua: mongoose.Schema.Types.Mixed
}, shemaOptions);


if (!global.__dbInstance) {
    mongoose.connect(config.get('mongoose:uri'));

    global.__dbInstance = {
        mongoose: mongoose,
        data: mongoose.model('Data', data),
        key: mongoose.model('Key', key)
    };
}

module.exports = global.__dbInstance;
