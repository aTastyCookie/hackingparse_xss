var crypto = require('crypto');
var utils = {};

utils.random = function (howMany, chars) {
    chars = chars
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    }

    return value.join('');
};


utils.generateCode = function () {
    var output = '';
    for (var i = 0; i < 5; i++) {
        output += Math.floor(Math.random() * (9 + 1));
    }
    return output;
};

utils.ageArray = function () {
    var ageArray = [];
    for (var i = 14; i <= 80; i++) {
        ageArray.push(i);
    }
    return ageArray;
};

utils.daysArray = function () {
    var daysArray = [];
    for (var i = 1; i <= 31; i++) {
        daysArray.push(i);
    }
    return daysArray;
};

utils.yearsArray = function () {
    var yearsArray = [];
    var currentYear = new Date().getFullYear();
    for (var i = currentYear - 80; i <= currentYear - 14; i++) {
        yearsArray.push(i);
    }
    return yearsArray;
};

utils.getAge = function (dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

utils.timestamp = function () {
    return Math.round(Date.now()/1000);
};

utils.escapeHTML = function(html) {
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

utils.generateHash = function (text) {
    return crypto.createHash('sha1').update(text || utils.generateCode() + Date.now()).digest('hex');
};

utils.parseTags = function (str) {
    return utils.escapeHTML(str).replace(/(?:^|(\s))(\#([а-я|\w]{0,40}))/ig, '$1<a href="/?keywords=%23$3&country=0&age_from=0&age_to=0&sex=any">$2</a>');
};

utils.randomArray = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};


module.exports = utils;