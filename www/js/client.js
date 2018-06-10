/*MODEL*/

function User(options) {
    if (options === null) {
        options = {};
    }
    this._color = options.color || '#' + Math.random().toString(16).substr(2, 6);
    this._id = options.id || null;
    this._line = options.caretPos.line || null;
    this._ch = options.caretPos.ch || null;
    this._span = document.createElement('span');
}
Object.defineProperties(User.prototype, {
    Id: {
        get: function () {
            return this._id;
        },
        set: function (value) {
            this._id = value;
        }
    },
    Color: {
        get: function () {
            return this._color;
        },
        set: function (value) {
            this._color = value;
        }
    },
    Line: {
        get: function () {
            return this._line;
        },
        set: function (value) {
            this._line = value;
        }
    },
    Ch: {
        get: function () {
            return this._ch;
        },
        set: function (value) {
            this._ch = value;
        }
    },
    Span: {
        get: function () {
            return this._span;
        }
    }

});
User.prototype.setSpan = function () {
    this._span.style.backgroundColor = this._color;
    this._span.style.height = '15px';
    this._span.style.width = '2px';
    this._span.setAttribute('id', 'span' + this._id);
};

function UserList() {
    this._userList = [];
    this._userIds = []; //esto no deberia ser asi...
}

UserList.prototype.addUser = function (user) {
    if (this._userIds.indexOf(user.Id) == -1) {
        this._userIds.push(user.Id);
        this._userList.push(user);
        return true;
    }
};
UserList.prototype.deleteUser = function (id) {
    for (var i = 0; i < this._userList.length; i++) {
        if (id === this._userList[i].Id) {
            this._userList.splice(i, 1);
        }
    }
};
UserList.prototype.updateCaretPos = function (data) {
    for (var i = 0; i < this._userList.length; i++) {
        if (data.id === this._userList[i].Id) {
            this._userList[i].Line = data.caretPos.line;
            this._userList[i].Ch = data.caretPos.ch;
        }
    }
};
UserList.prototype.getUser = function (id) {
    for (var i = 0; i < this._userList.length; i++) {
        if (id === this._userList[i].Id) {
            return this._userList[i];
        }
    }
    s
};


/*CONTROLLER*/
function LiveCodingController() {
    this._userList = new UserList();
    this._user = null;
    //this._cm = null;
    this._shareWS = null;
    this._userWS = null;
    this._sjs = null;
    //this._doc = null;
    this._view = null;
}
LiveCodingController.prototype.init = function () {
    var that = this;
    var textArea = document.getElementById('codemir');
    var cm = CodeMirror.fromTextArea(textArea, {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
    });
    cm.setOption('mode', 'javascript');

    this._shareWS = new WebSocket('ws://' + window.location.host);
    this._sjs = new window.sharejs.Connection(this._shareWS);
    var doc = this._sjs.get('users', 'seph');
    doc.subscribe();
    doc.whenReady(function () {

        if (!doc.type) {
            doc.create('text');

        }
        if (doc.type && doc.type.name === 'text') {
            doc.attachCodeMirror(cm);
            that._view = new LiveCodingView(cm, doc, that);
            that.startUserWS();
        }
    });
};

LiveCodingController.prototype.startUserWS = function () {
    var that = this;
    this._userWS = new WebSocket('ws://localhost:8011');
    this._userWS.onmessage = function (event) {
        var data = JSON.parse(event.data);
        var user = new User(data);
        if (that._userList.addUser(user)) {
            that._view.appendUser(data);
        };
        that._userList.updateCaretPos(data);
        var userSpan = that._userList.getUser(data.id).Span;
        that._view.updateUserPos(data);

        //console.log(data);

    };
    this._userWS.onopen = function () {
        console.log(that._view._doc.connection);
        var data = {
            id: that._view._doc.connection.id,
            color: '#' + Math.random().toString(16).substr(2, 6),
            caretPos: that._view._cm.getCursor()
        };
        setTimeout(function () {
            that._userWS.send(JSON.stringify(data));
            that._user = new User(data);
            that._user.setSpan();
            that._userList.addUser(that._user);
            that._view.appendUser(data);

        }, 50);
    };
    this._userWS.onclose = function () {};
    this._userWS.onerror = function () {};

};

LiveCodingController.prototype.Send = function () {
    var that = this;
    var data = {
        id: that._user.Id,
        color: that._user.Color,
        caretPos: that._view._cm.getCursor()
    };
    this._user.Line = this._view._cm.getCursor().line;
    this._user.Ch = this._view._cm.getCursor().ch;
    this._userWS.send(JSON.stringify(data));
};

/*VIEW*/

function LiveCodingView(cm, doc, control) {
    this._userListSection = document.getElementById('userList');
    this._tbl = this._userListSection.getElementsByTagName('table')[0];
    this._bookmark = null;
    this._caret = null;
    this._controller = control;
    this._userCarets = [];
    this._cm = cm;
    this._doc = doc;
    this.init();
}

LiveCodingView.prototype.init = function () {
    var that = this;
    this._cm.on('cursorActivity', function () {
        var line = that._cm.getCursor().line;
        var ch = that._cm.getCursor().ch;
        if (document.getElementById(that._caret.getAttribute('id'))) {
            if (that._caret.parentNode) {
                that._caret.parentNode.removeChild(that._caret);
                that._bookmark = that._cm.getDoc().setBookmark({
                    line: line,
                    ch: ch
                }, {
                    //widget: span,
                    widget: that._caret,
                    insertLeft: true,
                    shared: true
                });
            }
        }
        that._controller.Send();

    });
};
LiveCodingView.prototype.appendUser = function (data) {
    var tr = this._tbl.insertRow(0);
    tr.setAttribute('id', data.id);
    var td0 = tr.insertCell(0);
    var td1 = tr.insertCell(1);
    var td2 = tr.insertCell(2);
    td0.innerText = 'ID: ' + data.id;
    td1.innerText = 'Line: ' + data.caretPos.line;
    td2.innerText = 'Pos: ' + data.caretPos.ch;
    var ownCaret = null;
    if (this._caret === null) {
        var span = document.createElement('span');
        span.style.height = '15px';
        span.setAttribute('id', 'span' + data.id);
        span.style.borderLeft = '2px solid ' + data.color;
        //this._userCarets.push(span);
        this._caret = span;
        //ownCaret = true;
        // this.appendBookmark(data, ownCaret);
    } else if (this._caret.getAttribute('id') !== 'span' + data.id) {
        var span = document.createElement('span');
        span.style.height = '15px';
        span.setAttribute('id', 'span' + data.id);
        span.style.borderLeft = '2px solid ' + data.color;
        span.setAttribute('data-tooltip', data.id);
        span.setAttribute('data-tooltip-position', 'right');
        span.style.position = 'absolute';
        this._userCarets.push(span);
        ownCaret = false;
        this.appendBookmark(data, ownCaret);

    }
};
LiveCodingView.prototype.updateUserPos = function (data) {
    var tr = document.getElementById(data.id);
    tr.cells[1].innerText = 'Line: ' + data.caretPos.line;
    tr.cells[2].innerText = 'Pos: ' + data.caretPos.ch;
    this.updateUserCarets(data);

};
LiveCodingView.prototype.getWidget = function (id) {
    for (var i = 0; i < this._userCarets.length; i++) {
        if (this._userCarets[i].getAttribute('id') === id) {
            return this._userCarets[i];
        }
    }
};

LiveCodingView.prototype.appendBookmark = function (data, ownCaret) {
    var that = this;
    if (ownCaret) {
        this._bookmark = this._cm.getDoc().setBookmark({
            line: data.caretPos.line,
            ch: data.caretPos.ch
        }, {
            //widget: span,
            widget: that._caret,
            insertLeft: true,
            shared: true
        });
    } else {
        var id = 'span' + data.id;
        var span = this.getWidget(id);
        this._cm.getDoc().setBookmark({
            line: data.caretPos.line,
            ch: data.caretPos.ch
        }, {
            widget: span,
            insertLeft: true,
            shared: true
        });
    }
};
LiveCodingView.prototype.updateUserCarets = function (data) {
    var line = data.caretPos.line;
    var ch = data.caretPos.ch;
    var id = 'span' + data.id;
    if (id !== this._caret.getAttribute('id')) {
        var span = this.getWidget(id);
        if (document.getElementById(span.getAttribute('id'))) {
            if (span.parentNode) {
                span.parentNode.removeChild(span);
                this._cm.getDoc().setBookmark({
                    line: line,
                    ch: ch
                }, {
                    widget: span,
                    inserLeft: true,
                    shared: true
                });
            }
        }
    }
};

/*LiveCodingView.prototype.appendBookmark = function (data) {
    var that = this;
    var id = 'span' + data.id;
    var span = this.getWidget(id);
    this._cm.addWidget({
        line: data.caretPos.line - 1,
        ch: data.caretPos.ch
    }, span);
};

LiveCodingView.prototype.updateUserCarets = function (data) {
    var line = data.caretPos.line;
    var ch = data.caretPos.ch;
    var id = 'span' + data.id;
    if (id !== this._caret.getAttribute('id')) {
        var span = this.getWidget(id);
        if (document.getElementById(span.getAttribute('id'))) {
            if (span.parentNode) {
                span.parentNode.removeChild(span);
                this._cm.addWidget({
                    line: data.caretPos.line - 1,
                    ch: data.caretPos.ch
                }, span);
            }
        }
    }

};*/

/*GLOBAL VARIABLES*/
var controller = new LiveCodingController();
controller.init();