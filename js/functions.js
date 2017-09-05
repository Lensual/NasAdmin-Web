var apiUrl = "http://localhost:1337/api";     //!!要设计自动获取地址
var token;
var enableAutoLogin = true;

window.onload = function () {
    //login
    document.getElementById("loginDialog_btnLogin").onclick = function () {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {// 4 = "loaded"
                if (xhr.status == 200) {// 200 = OK
                    var json = JSON.parse(xhr.responseText);
                    if (json.isSuccess) {
                        //apply token
                        token = json.token;
                        //save token
                        document.cookie = "token=" + escape(token);
                        //get permission
                        var permission = getPermission();
                        updateNavs(permission)
                            .then(function () {
                                registerNavOnclick();
                                //updateContents
                                var target = document.getElementById("navs")
                                    .getElementsByClassName("mdl-navigation__link")[0]
                                    .getAttribute("href").substr(1);
                                updateContents(target)
                                    .then(function () {
                                        updateTabs(target)
                                        loadScript(target);
                                    });
                            });
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
        xhr.send(
            "grant_type=password&" +
            "username=" + encodeURIComponent(document.getElementById("username").value) + "&" +
            "password=" + encodeURIComponent(document.getElementById("password").value)
        );
    }

    //registerNavOnclick
    registerNavOnclick();

    //autoLogin
    if (enableAutoLogin) {
        autoLogin();
    }
    function autoLogin() {
        token = getCookie("token");
        if (token != "") {
            //get sessionInfo
            getHtml(apiUrl + "/auth/sessionInfo?token=" + token)
                .then(function (result) {
                    var json = JSON.parse(result);
                    if (json.isSuccess) {
                    //get permission
                    var permission = getPermission();
                    updateNavs(permission)
                        .then(function () {
                            registerNavOnclick();
                            //updateContents
                            var target = document.getElementById("navs")
                                .getElementsByClassName("mdl-navigation__link")[0]
                                .getAttribute("href").substr(1);
                            updateContents(target)
                                .then(function () {
                                    updateTabs(target);
                                    loadScript(target);
                                });
                        });
                    } else {
                        console.log("autoLogin Unsuccessful");
                    }
                });
        }
    }


}

//registerNavOnclick
function registerNavOnclick() {
    var nav = document.getElementsByClassName("mdl-navigation__link");
    for (var i = 0; i < nav.length; i++) {
        nav[i].onclick = function (e) {
            e.preventDefault();
            updateContents(e.currentTarget.getAttribute("href").substr(1))
                .then(function () {
                    updateTabs(e.currentTarget.getAttribute("href").substr(1))
                    loadScript(e.currentTarget.getAttribute("href").substr(1));
                });
            document.getElementsByClassName("mdl-layout__drawer-button")[0].click();
        }
    }
}

//getPermission
function getPermission() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "/auth/permission/?token=" + token, false);
    xhr.send();
    if (xhr.readyState == 4) {// 4 = "loaded"
        if (xhr.status == 200) {// 200 = OK
            var json = JSON.parse(xhr.responseText);
            if (json.isSuccess) {
                return json;
            } else {
                alert("getPermission() Error: " + xhr.status + " " + xhr.responseText);
            }
        }
        else {
            alert("getPermission() XHR Error: " + xhr.status + " " + xhr.responseText);
        }
    }
}

//updateNavs
async function updateNavs(permission) {
    //sort
    permission.grant.sort(function (a, b) {
        return a.priority - b.priority;
    });
    //async
    var promises = [];
    var results = [];
    for (var i = 0; i < permission.grant.length; i++) {
        promises.push(getHtml("./plugins/" + permission.grant[i].name + "/nav.html"));
    }
    //await
    for (var i = 0; i < promises.length; i++) {
        results.push(await promises[i]);
    }
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
}

//updateTabs
async function updateTabs(target) {
    getHtml("./plugins/" + target + "/tabs.html")
        .then(function (result) {
            //generate new Navs
            var tabs = document.createElement("div");
            tabs.id = "tabs";
            tabs.className = "mdl-layout__tab-bar mdl-js-ripple-effect";
            tabs.innerHTML = result;
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
        });
}

//updateContents
async function updateContents(target) {
    getHtml("./plugins/" + target + "/contents.html")
        .then(function (result) {
            //generate new Contents
            var contents = document.createElement("main");
            contents.id = "contents";
            contents.className = "mdl-layout__content";
            contents.innerHTML = result;
            //replace Contents
            document.getElementById("contents").parentNode
                .replaceChild(contents, document.getElementById("contents"));
        });
}

//getHtml
async function getHtml(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                resolve(xhr.responseText);
            }
            else {
                reject("getHtml() XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    });
}

//getCookie
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

//loadScript
function loadScript(target) {
    var script = document.createElement('script');
    script.src = "./plugins/" + target + "/script.js";
    document.body.appendChild(script);
}