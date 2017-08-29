var apiUrl = "http://localhost:1337/api";     //!!要设计自动获取地址
var token;

window.onload = function () {
    //login
    document.getElementById("loginDialog_btnLogin").onclick = function () {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {// 4 = "loaded"
                if (xhr.status == 200) {// 200 = OK
                    var json = JSON.parse(xhr.responseText);
                    if (json.isSuccess) {
                        token = json.token;
                        var permission = getPermission();
                        replaceNavs(permission)
                            .then(function () {
                                registerNavOnclick();
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

    registerNavOnclick();

}

//registerNavOnclick
function registerNavOnclick() {
    var nav = document.getElementsByClassName("mdl-navigation__link");
    for (var i = 0; i < nav.length; i++) {
        nav[i].onclick = function (e) {
            e.preventDefault();
            replaceTabs(e.currentTarget.getAttribute("href").substr(1))
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

//replaceNavs
async function replaceNavs(permission) {
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

//replaceTabs
async function replaceTabs(target) {
    getHtml("./plugins/" + target + "/tab.html")
        .then(function (result) {
            //generate new Navs
            var tabs = document.createElement("div");
            tabs.id = "tabs";
            tabs.className = "mdl-layout__tab-bar mdl-js-ripple-effect";
            tabs.innerHTML = result;
            console.log(tabs);
            recursionUpgradeElement(tabs);
            //replace Navs
            document.getElementById("tabs").parentNode
                .replaceChild(tabs, document.getElementById("tabs"));
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

//recursionUpgradeElement
function recursionUpgradeElement(element) {
    if (typeof element === 'object' && element instanceof Element) {
        componentHandler.upgradeElement(element);
        console.log(element.nodeName);
        for (var i = 0; i < element.childNodes.length; i++) {
            recursionUpgradeElement(element.childNodes[i]);
        }
    }
}

