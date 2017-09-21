var apiUrl = "/api";     //!!要设计自动获取地址
window.token = "";
var enableAutoLogin = true;

window.onload = function () {
    //login
    document.getElementById("loginDialog_btnLogin").onclick = function () {
        var body = "grant_type=password&" +
            "username=" + encodeURIComponent(document.getElementById("username").value) + "&" +
            "password=" + encodeURIComponent(document.getElementById("password").value);
        httpPost(apiUrl + "/auth/token", body, window.token, function (xhr) {
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                //apply token
                token = json.token;
                //save token
                document.cookie = "token=" + escape(token);
                //updateElements
                afterLogin()
            } else {
                alert("Login unsuccessful: " + xhr.status + " " + xhr.responseText);
            }
        });
    };

    //registerNavOnclick
    regNavOnclickEvent();

    //autoLogin
    if (enableAutoLogin) { autoLogin(); }
};

//autoLogin
function autoLogin() {
    windows.token = getCookie("token");
    if (windows.token != "") {
        //get sessionInfo
        httpGet(apiUrl + "/auth/sessionInfo", windows.token, function (xhr) {
            if (xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
                //updateElements
                afterLogin()
            } else {
                console.info("autoLogin Unsuccessful");
            }
        });
    }
}

//登录之后ajax更新与注册元素
function afterLogin() {
    //get permission
    getPermission(function (permission) {
        //updateNavs
        updateNavs(permission, function () {
            //regEvent
            regNavOnclickEvent();
            //updateContents
            var target = document.getElementById("navs")
                .getElementsByClassName("mdl-navigation__link")[0]
                .getAttribute("href").substr(1);
            updateContents(target, function () {
                //updateTabs
                updateTabs(target, function () {
                    //loadScript
                    loadScript(target);
                });
            });
        });
    });
}

function regNavOnclickEvent() {
    var nav = document.getElementsByClassName("mdl-navigation__link");
    for (var i = 0; i < nav.length; i++) {
        nav[i].onclick = function (e) {
            e.preventDefault();
            updateContents(e.currentTarget.getAttribute("href").substr(1))
                .then(function () {
                    updateTabs(e.currentTarget.getAttribute("href").substr(1));
                    loadScript(e.currentTarget.getAttribute("href").substr(1));
                });
            document.getElementsByClassName("mdl-layout__drawer-button")[0].click();
        };
    }
}

//getPermission
function getPermission(callback) {
    httpGet(apiUrl + "/auth/permission", window.token, function (xhr) {
        if (xhr.status == 200) {// 200 = OK
            var json = JSON.parse(xhr.responseText);
            callback(json.permission);
        }
        else {
            console.error("getPermission() Error: " + xhr.status + " " + xhr.responseText);
        }
    });
}

//document update
function updateNavs(permission, callback) {
    //sort by priority
    permission.grant.sort(function (a, b) {
        return a.priority - b.priority;
    });
    var results = [];
    for (var i = 0; i < permission.grant.length; i++) {
        httpGet("./plugins/" + permission.grant[i].name + "/nav.html", window.token, function (xhr) {
            if (xhr.responseText == 200) {
                results.push(xhr.responseText);
                if (result.length == permission.grant.length) {
                    //generate new Navs
                    var navs = document.createElement("nav");
                    navs.id = "navs";
                    navs.className = "mdl-navigation";
                    for (var i = 0; i < results.length; i++) {
                        navs.innerHTML += results[i];
                    }
                    componentHandler.upgradeElement(navs);
                    //replace Navs
                    document.getElementById("navs").parentNode
                        .replaceChild(navs, document.getElementById("navs"));
                    //callback
                    if (callback) {
                        callback();
                    }
                }
            }
        });
    }
}
function updateTabs(target, callback) {
    httpGet("./plugins/" + target + "/tabs.html", window.token, function (xhr) {
        if (xhr.status == 200) {
            //generate new Navs
            var tabs = document.createElement("div");
            tabs.id = "tabs";
            tabs.className = "mdl-layout__tab-bar mdl-js-ripple-effect";
            tabs.innerHTML = xhr.responseText;
            //replace Navs
            document.getElementById("tabs").parentNode
                .replaceChild(tabs, document.getElementById("tabs"));
            //fix MaterialLayout.content_
            document.getElementById("layout").MaterialLayout.content_ =
                document.getElementById("contents");
            for (var i = 0; i < tabs.children.length; i++) {
                new MaterialLayoutTab(tabs.children[i],
                    tabs.children,
                    document.getElementById("contents").children,
                    document.getElementById("layout").MaterialLayout);
                var ripple_containers = tabs.children[i].getElementsByClassName("mdl-layout__tab-ripple-container");
                for (var j = 0; j < ripple_containers.length; j++) {
                    new MaterialRipple(ripple_containers[j]);
                }
            }
            //callback
            if (callback) {
                callback();
            }
        }
    })
}
function updateContents(target, callback) {
    httpGet("./plugins/" + target + "/contents.html", window.token, function (xhr) {
        if (xhr.status == 200) {
            //generate new Contents
            var contents = document.createElement("main");
            contents.id = "contents";
            contents.className = "mdl-layout__content";
            contents.innerHTML = xhr.responseText;
            //replace Contents
            document.getElementById("contents").parentNode
                .replaceChild(contents, document.getElementById("contents"));
            //upgradeMdl
            componentHandler.upgradeAllRegistered();
            //callback
            if (callback) {
                callback();
            }
        }
    });
}
function loadScript(url) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
}

//http
function httpGet(url, token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    if (token) {
        xhr.setRequestHeader("token", token);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) { return }
        callback(xhr);
    }
    xhr.send();
}

function httpPost(url, body, token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    if (token) {
        xhr.setRequestHeader("token", token);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) { return }
        callback(xhr);
    }
    xhr.send(body);
}

//Cookie
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}