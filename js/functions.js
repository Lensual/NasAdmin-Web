var apiUrl = "http://localhost:1337/api";     //!!要设计自动获取地址
var sessionId;

window.onload = function () {
    //login
    document.getElementById("loginDialog_btnLogin").onclick = function () {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {// 4 = "loaded"
                if (xhr.status == 200) {// 200 = OK
                    var json = JSON.parse(xhr.responseText);
                    if (json.isSuccess) {
                        sessionId = json.sessionId;
                        getNavs();
                    } else {
                        alert("Login unsuccessful: " + xhr.status + " " + xhr.responseText);
                    }
                }
                else {
                    alert("Login XHR Error: " + xhr.status + " " + xhr.responseText);
                }
            }
        }
        xhr.open("POST", apiUrl + "/auth/login", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("user=" + encodeURIComponent(document.getElementById("username").value) + "&" +
            "pwd=" + encodeURIComponent(document.getElementById("password").value));
    }

    //NavOnClick
    var nav = document.getElementsByClassName("mdl-navigation__link");
    for (var i = 0; i < nav.length; i++) {
        nav[i].onclick = function (e) {
            e.preventDefault();
            document.getElementsByClassName("mdl-layout__drawer-button")[0].click();
        }
    }
}

//getNavs
function getNavs() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                if (json.isSuccess) {
                    alert(json);
                } else {
                    alert("getNavs() Error: " + xhr.status + " " + xhr.responseText);
                }
            }
            else {
                alert("getNavs() XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    }
    xhr.open("GET", apiUrl + "/auth/permission", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cookie", "connect.sid=" + sessionId);
    xhr.send();
}


