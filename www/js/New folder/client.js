var userlist = [];
var userObject = [];
var state = true;
var id = '';
var ws2 = new WebSocket('ws://localhost:8011');
var cm = null;
var color = '#' + Math.random().toString(16).substr(2, 6);
var userLiistSection = document.getElementById('userList');

/*function LiveCodingSession () {
    this.userlist = [];
    this.state = true;
    this.ownId = '';
    this.ws2 = new WebSocket('ws://localhost:8011');
    this.cm = null;
    this.color = '#' + Math.random().toString(16).substr(2, 6);
    this.userListSection = document.getElementById('userList');
}
*/
console.log(ws2);

function pushIdToList(data) {
    if (userlist.indexOf(data.id) === -1) {
        userlist.push(data.id);
        var user = new User(data);
        userObject.push(user);
        var tr = document.createElement('tr');

        var tbl = userLiistSection.getElementsByTagName('table')[0];

        var tr = tbl.insertRow(0);
        //tbl.appendChild(tr);
        tr.setAttribute('id', data.id);
        var td0 = tr.insertCell(0);
        var td1 = tr.insertCell(1);
        var td2 = tr.insertCell(2);
        td0.innerText = 'ID: ' + data.id;
        td1.innerText = 'Line: ' + data.caretPos.line;
        td2.innerText = 'Pos: ' + data.caretPos.ch;
    }
}

function updateUserPos(data) {
    var tr = document.getElementById(data.id);
    tr.cells[1].innerText = 'Line: ' + data.caretPos.line;
    tr.cells[2].innerText = 'Pos: ' + data.caretPos.ch;
    var widget = document.createElement('div');

    function User(options) {
        if (options === null) {
            options = {};
        }
        this._color = options.color || '#' + Math.random().toString(16).substr(2, 6);
        this._id = options.id || null;
        this._line = options.caretPos.line || null;
        this._ch = options.caretPos.ch || null;

    }

    function pushIdToServer(id) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8008/users', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        var data = {
            'id': id
        };
        xhr.send(JSON.stringify(data));
    }

    function logLiveCoding() {
        var textArea = document.getElementById('codemir');
        cm = CodeMirror.fromTextArea(textArea, {
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            value: 'function myScript(){return 100;}\n',
        });
        cm.setOption('mode', 'javascript');
        var ws = new WebSocket('ws://' + window.location.host);
        var sjs = new window.sharejs.Connection(ws);
        var doc = sjs.get('users', 'seph');
        var innerText = cm.getValue();
        console.log(doc);
        doc.subscribe();
        doc.whenReady(function () {

            if (!doc.type) {
                doc.create('text');

            }
            if (doc.type && doc.type.name === 'text') {
                doc.attachCodeMirror(cm);
                id = doc.connection.id;
                pushIdToServer(id);

                ws2.onopen = function () {
                    setTimeout(function () {
                        var data = {
                            users: userlist,
                            id: id,
                            color: color,
                            caretPos: cm.getCursor()
                        };
                        ws2.send(JSON.stringify(data));
                        pushIdToList(data);
                    }, 50);
                };
            }
        });

        //shareJSOnMessage;
        console.log(ws);
    }



    ws2.onmessage = function (event) {
        var data = JSON.parse(event.data);
        pushIdToList(data);
        updateUserPos(data);
        console.log(data);

    };
    window.onkeyup = function () {
        var data = {
            users: userlist,
            id: id,
            color: color,
            caretPos: cm.getCursor()
        };
        ws2.send(JSON.stringify(data));
    };

    logLiveCoding();