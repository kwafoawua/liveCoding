var inputIDB = document.getElementById('contactID');
var inputCodeSession = document.getElementById('codeSession');
var inputOwnID = document.getElementById('ownID');
var inputUrlSession = document.getElementById('urlSession');

function createSession(e) {
    document.getElementById('startContainer').style.visibility = 'visible';
}

function addContact(e) {
    if (inputIDB.value !== '') {
        var IDBUser = inputIDB.value;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {}
        };

        xhr.open('POST', 'http://localhost:8010/addContact', true);
        xhr.send(JSON.stringify({
            'ID': IDBUser
        }));
        document.getElementById('generateSession').disabled = false;
    } else {
        console.log('Ingrese ID del usuario B');
    }
}

function getUrlServer(e) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            inputCodeSession.value = xhr.responseText;
            document.getElementById('startS').disabled = false;
        }
    };
    xhr.open('GET', 'http://localhost:8010/getURLSession', true);
    xhr.send();

}

function startSession(e) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            window.location.href = xhr.responseText;
        }
    };
    xhr.open('GET', 'http://localhost:8010/startLiveCoding', true);
    xhr.send();
}

function joinNewSession() {
    document.getElementById('joinContainer').style.visibility = 'visible';
}

function join() {}