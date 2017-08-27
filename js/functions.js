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
        xhr.send(
            "grant_type=password&" +
            "username=" + encodeURIComponent(document.getElementById("username").value) + "&" +
            "password=" + encodeURIComponent(document.getElementById("password").value)
        );
    }

    //NavOnClick
    var nav = document.getElementsByClassName("mdl-navigation__link");
    for (var i = 0; i < nav.length; i++) {
        if (nav[i].getAttribute("href") == "#") {
            nav[i].onclick = function (e) {
                e.preventDefault();
                document.getElementsByClassName("mdl-layout__drawer-button")[0].click();
            }
        }
    }
}

//getNavs
function getNavs() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async function getNavs_xhr_onreadystatechange() {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                if (json.isSuccess) {
                    //async
                    var promises = [];
                    var results = [];
                    for (var i = 0; i < json.grant.length; i++) {
                        promises.push(getHtml("./plugins/" + json.grant[i].name + "/nav.html"));
                    }
                    //await
                    for (var i = 0; i < promises.length; i++) {
                        results.push(await promises[i]);
                    }

                    //alert(JSON.stringify(results, null, 2));
                    //!!整理优先级
                    

                    //remove Navs
                    var parentNode = document.getElementById("navs").parentNode;
                    parentNode.removeChild(document.getElementById("navs"));
                    //generate new Navs
                    for (var i = 0; i < json.grant.length; i++) {
                        var nav = document.createElement("div");
                        nav.id = "navs";
                        nav.innerHTML += results[i];
                        parentNode.appendChild(nav);

                        ////a
                        //var a = document.createElement("a");
                        //a.className = "mdl-navigation__link";
                        //a.href = "#"; //test
                        ////append
                        //nav.appendChild(a);
                        //document.getElementById("navs").appendChild(nav);
                    }

                } else {
                    alert("getNavs() Error: " + xhr.status + " " + xhr.responseText);
                }
            }
            else {
                alert("getNavs() XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    }
    xhr.open("GET", apiUrl + "/auth/permission/?token=" + token, true);
    xhr.send();
}


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

function parseDom(arg) {
    var objE = document.createElement("div");
    objE.innerHTML = arg;
    return objE.childNodes;
};


