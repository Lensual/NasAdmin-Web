//异步轮询延迟
var asyncDelay = 1000;

//fmg
var fmg = document.getElementById("file_manage_grid");
//toolbar elements
var toolbarUrl_input = document.getElementById("toolbar-url_input");
var fmg_navHistory_before = []; //后退
var fmg_navHistory_next = [];   //前进
var fm_toolbar_btn_upload_input = document.getElementById("fm_toolbar_btn_upload_input");   //上传文件选择框
//notification
var notification = document.getElementsByClassName("mdl-js-snackbar")[0];

//register event
//toolbar
document.getElementById("fm_toolbar_btn_navigate_before").onclick = function (e) {
    var path = fmg_navHistory_before.pop();
    if (path) {
        fmg_navHistory_next.push(fmg.getAttribute("data-path"));
        readDirSync(path, false);
    }
}
document.getElementById("fm_toolbar_btn_navigate_next").onclick = function (e) {
    var path = fmg_navHistory_next.pop();
    if (path) {
        fmg_navHistory_before.push(fmg.getAttribute("data-path"));
        readDirSync(path, false);
    }
}
//toolbar upload
document.getElementById("fm_toolbar_btn_upload").onclick = function (e) {
    fm_toolbar_btn_upload_input.click();
}
fm_toolbar_btn_upload_input.onchange = function (e) {
    if (!e.target.files[0]) { return; }
    uploadFiles(e.target.files, fmg.getAttribute("data-path"));

    //notification.MaterialSnackbar.showSnackbar({
    //    message: 'Message Sent',
    //    actionHandler: function (event) { },
    //    actionText: 'Undo',
    //    timeout: 10000
    //});


}
//task_panel_head
document.getElementById("task_panel_head").onclick = function (e) {
    var panel = document.getElementById("task_panel");
    var container = document.getElementById("task_panel_container")
    if (panel.style.display == "inherit") { return clear(); }

    //设置遮罩
    panel.style.display = "inherit";
    container.style.zIndex = "101";
    setMaskLayer(container.parentElement, clear);

    //清理遮罩
    function clear() {
        panel.style.display = "none";
        container.zIndex = "";
        rmMaskLayer(container.parentElement)
    }
}

//拖选
var fmg_select_mouseleaved;
fmg.onmousedown = function (p1) {
    //左键
    if (p1.button != 0) { return; }
    p1.preventDefault();
    p1.stopPropagation();
    //防止鼠标拖选移出区域mouseup失效处理
    if (fmg_select_mouseleaved) { return; }
    //xy
    var p1x = p1.pageX - document.getElementById("contents").offsetLeft + fmg.parentElement.scrollLeft;
    var p1y = p1.pageY - document.getElementById("contents").offsetTop + fmg.parentElement.scrollTop;
    //element
    var fmg_Selected;
    var fileObj;
    //event
    fmg.onmousemove = function (e) {
        var x = e.pageX - document.getElementById("contents").offsetLeft + fmg.parentElement.scrollLeft;
        var y = e.pageY - document.getElementById("contents").offsetTop + fmg.parentElement.scrollTop;
        //忽略鼠标抖动
        if (!fmg_Selected) {
            if ((Math.abs(p1x - x) < 3 || Math.abs(p1y - y) < 3)) {
                return;
            }
            //clear checked
            fileObj = document.getElementsByClassName("fileObject");
            for (var i = 0; i < fileObj.length; i++) {
                var checkbox = fileObj[i].getElementsByClassName("mdl-checkbox__input")[0]
                if (checkbox.checked) {
                    checkbox.click();
                }
            }
            //create element
            fmg_Selected = createSelected(0, 0, 0, 0);
        }
        e.preventDefault();
        e.stopPropagation();
        //update selected
        updateSelected(x, y);
        //注册滚动更新
        fmg.parentElement.onscroll = function () {
            fmg.onmousemove(e);
        }
    }

    function createSelected(x, y, w, h) {
        var fmg_Selected = document.createElement("div");
        fmg_Selected.className = "fmg_Selected";
        fmg_Selected.style.left = x + 'px';
        fmg_Selected.style.top = y + 'px';
        fmg_Selected.style.width = w + 'px';
        fmg_Selected.style.height = h + 'px';
        fmg.appendChild(fmg_Selected);
        return fmg_Selected;
    }

    function updateSelected(x, y) {
        if (x < p1x) {   //left
            fmg_Selected.style.left = x - fmg.parentElement.scrollLeft + 'px';
        } else {
            fmg_Selected.style.left = p1x - fmg.parentElement.scrollLeft + 'px';
        }
        fmg_Selected.style.width = Math.abs(x - p1x) + 'px';
        if (y < p1y) { //up
            fmg_Selected.style.top = y - fmg.parentElement.scrollTop + 'px';
        } else {
            fmg_Selected.style.top = p1y - fmg.parentElement.scrollTop + 'px';
        }
        fmg_Selected.style.height = Math.abs(y - p1y) + 'px';
    }

    fmg.onmouseup = function (p2) {
        if (fmg_Selected) {   //忽略鼠标抖动
            p2.preventDefault();
            p2.stopPropagation();
            //xy
            var p2x = p2.pageX - document.getElementById("contents").offsetLeft + fmg.parentElement.scrollLeft;
            var p2y = p2.pageY - document.getElementById("contents").offsetTop + fmg.parentElement.scrollTop;
            //select
            for (var i = 0; i < fileObj.length; i++) {
                if (
                    (
                        //左边缘 x轴在p1与p2的之间
                        (fileObj[i].offsetLeft >= p1x && fileObj[i].offsetLeft <= p2x) || //向右拖
                        (fileObj[i].offsetLeft <= p1x && fileObj[i].offsetLeft >= p2x) || //向左拖
                        //右边缘 x轴在p1与p2的之间
                        (fileObj[i].offsetLeft + fileObj[i].offsetWidth >= p1x &&
                            fileObj[i].offsetLeft + fileObj[i].offsetWidth <= p2x) ||    //向右拖
                        (fileObj[i].offsetLeft + fileObj[i].offsetWidth <= p1x &&
                            fileObj[i].offsetLeft + fileObj[i].offsetWidth >= p2x) ||   //向左拖
                        //p1和p2同时在左右边缘中间
                        (fileObj[i].offsetLeft <= p1x && fileObj[i].offsetLeft + fileObj[i].offsetWidth >= p1x &&
                            fileObj[i].offsetLeft <= p2x && fileObj[i].offsetLeft + fileObj[i].offsetWidth >= p2x)
                    ) && (
                        //上边缘 y轴在p1与p2的之间
                        (fileObj[i].offsetTop >= p1y && fileObj[i].offsetTop <= p2y) || //向下拖
                        (fileObj[i].offsetTop <= p1y && fileObj[i].offsetTop >= p2y) || //向上拖
                        //下边缘 y轴在p1与p2的之间
                        (fileObj[i].offsetTop + fileObj[i].offsetHeight >= p1y &&
                            fileObj[i].offsetTop + fileObj[i].offsetHeight <= p2y) ||   //向下拖
                        (fileObj[i].offsetTop + fileObj[i].offsetHeight <= p1y &&
                            fileObj[i].offsetTop + fileObj[i].offsetHeight >= p2y) ||   //向上拖
                        //p1和p2同时在上下边缘中间
                        (fileObj[i].offsetTop <= p1y && fileObj[i].offsetTop + fileObj[i].offsetHeight >= p1y &&
                            fileObj[i].offsetTop <= p2y && fileObj[i].offsetTop + fileObj[i].offsetHeight >= p2y)
                    )
                ) {
                    var checkbox = fileObj[i].getElementsByClassName("mdl-checkbox__input")[0];
                    checkbox.click();
                    //createSelected(fileObj[i].offsetLeft,
                    //    fileObj[i].offsetTop,
                    //    fileObj[i].offsetWidth,
                    //    fileObj[i].offsetHeight);
                }
            }
            //clear
            fmg_Selected.parentElement.removeChild(fmg_Selected);
            fmg_Selected = null;
            fmg_select_mouseleaved = null;
            fmg.parentElement.onscroll = null;
        }
        //clear
        fmg.onmousemove = null;
        fmg.onmouseup = null;
        fmg.onmouseleave = null;
    }

    fmg.onmouseleave = function () {
        fmg_select_mouseleaved = true;
    }
}

//右击菜单
fmg.oncontextmenu = function (e) {
    var rightClickMenu = document.getElementById("rightClickMenu");
    rightClickMenu.style.left = e.clientX - document.getElementById("contents").offsetLeft + 'px';
    rightClickMenu.style.top = e.clientY - document.getElementById("contents").offsetTop + 'px';
    //clear menu
    var toclear = rightClickMenu.getElementsByClassName("mdl-menu__container");
    for (var i = 0; i < toclear.length; i++) {
        toclear[i].parentElement.removeChild(toclear[i]);
    }
    //create menu
    var element_mdlMenu = mdlMenu();
    rightClickMenu.appendChild(element_mdlMenu);
    var object_mdlMenu = new MaterialMenu(element_mdlMenu);
    //fix mdl-menu__item-ripple-container
    fix_mdlMenu_ripple(element_mdlMenu);

    //show menu
    document.getElementById("rightClickMenu_hiddenbutton").click();
    return false;

    function mdlMenu() {
        var ul = document.createElement("ul");
        ul.className = "mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect";
        ul.setAttribute("for", "rightClickMenu_hiddenbutton");
        //create li
        ul.appendChild(createli("Open", function () {
            //向上查找fileObject
            for (var i = 0; i < e.path.length; i++) {
                for (var j = 0; j < e.path[i].classList.length; j++) {
                    if (e.path[i].classList[j] == "mdl-card") {
                        e.path[i].click();
                        return;
                    }
                }
            }
        }));
        ul.appendChild(createli("Download", function () {

        }));
        ul.appendChild(createli("Cut", function () {

        }));
        ul.appendChild(createli("Copy", function () {

        }));
        ul.appendChild(createli("Paste", function () {

        }));
        ul.appendChild(createli("Delete", function () {

        }));
        ul.appendChild(createli("Rename", function () {

        }));
        ul.appendChild(createli("Property", function () {

        }));

        return ul;

        function createli(innerText, onclick) {
            var li = document.createElement("li");
            li.className = "mdl-menu__item";
            li.innerText = innerText;
            li.onclick = onclick;
            return li;
        }
    }

    function fix_mdlMenu_ripple(element) {
        var tofix = element.getElementsByClassName("mdl-menu__item")
        for (var i = 0; i < tofix.length; i++) {
            new MaterialRipple(tofix[i]);
        }
    }
}

//debug
for (var i = 0; i < 10; i++) {
    fmg.appendChild(fileObject("folder", "folder"));
    fmg.appendChild(fileObject("insert_drive_file", "insert_drive_file"));
    fmg.appendChild(fileObject("folder_open", "folder_open"));
    fmg.appendChild(fileObject("movie", "movie"));
    fmg.appendChild(fileObject("album", "album"));
}

//run
readDirSync("/", false);

//functions
function readDirSync(path, recHistory) {
    httpGet(apiUrl + "/fs/readDirSync/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 200) {
            console.log(xhr.responseText);
            var json = JSON.parse(xhr.responseText);
            afterReadDir(json.files, path, recHistory);
        }
    });
}

function readDirAysnc(path, recHistory) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            waitforTask(json.TaskId, asyncDelay, function (task) {
                afterReadDir(task.Result, path, recHistory);
            });
        }
    });
}

function afterReadDir(files, path, recHistory) {
    //排序 文件夹靠前
    var swap;
    for (var i = 0; i < files.length; i++) {
        if (files[i] &&
            files[i].type != "Directory" &&
            files[i + 1] &&
            files[i + 1].type == "Directory") {
            //swap
            swap = files[i];
            files[i] = files[i + 1];
            files[i + 1] = swap;
        }
        //最后一个并且本轮交换过
        if (i == files.length - 1 && swap) {
            i = -1; //reset
            swap = null;
        }
    }
    fmg.innerHTML = "";
    //遍历 生成元素
    for (var i = 0; i < files.length; i++) {
        var fileObj = fileObject(files[i].name, getClassForFileType(files[i].type));
        fmg.appendChild(fileObj);
    }
    //recode history
    if (recHistory) {
        fmg_navHistory_before.push(fmg.getAttribute("data-path"));
        fmg_navHistory_next.splice(0, fmg_navHistory_next.length);  //clear
    }
    //update path
    fmg.setAttribute("data-path", path);
    toolbarUrl_input.value = path;

}

function waitforTask(taskId, delay, callback) {
    addTaskToPanel(taskId, taskId);
    setTimeout(checkTask, delay, [taskId, function (result) {
        console.log(result);
        var task = JSON.parse(result);
        if (task.Status == "fulfilled") {
            updatePanelItem(taskId, "done");
            callback(task);
        } else if (task.Status == "pending") {
            waitforTask(taskId, delay, callback);
        }
    }]);
}

function checkTask(args) {
    var taskId = args[0];
    var callback = args[1];
    httpGet(apiUrl + "/taskqueue/check/" + taskId, window.token, function (xhr) {
        if (xhr.status == 200) {
            callback(xhr.responseText);
        }
    });
}

function getClassForFileType(type) {
    switch (type) {
        case "Directory":
            return "folder";
            break;
        default:    //File
            return "insert_drive_file";
    }
}

function fileObject(fileName, fileType) {
    var fileObj = document.createElement("div");
    fileObj.className = "fileObject mdl-cell mdl-cell--2-col";
    fileObj.appendChild(fileObject_mdlCard(fileName, fileType));
    componentHandler.upgradeElement(fileObj);
    return fileObj;

    function fileObject_mdlCard(fileName, fileType) {
        var mdlCard = document.createElement("div");
        mdlCard.className = fileType + " mdl-card mdl-shadow--2dp";
        mdlCard.appendChild(fileCheckBox());
        mdlCard.appendChild(mdlCard__title(fileType));
        mdlCard.appendChild(mdlCard__actions(fileName));
        mdlCard.onmousedown = mdlCard_onmousedown;
        mdlCard.onclick = mdlCard_onclick;
        componentHandler.upgradeElement(mdlCard);
        return mdlCard;

        var dontClick = false;  //防止拖选时鼠标移回选区后按下导致触发Click
        function mdlCard_onmousedown(e) {
            if (fmg_select_mouseleaved) {
                dontClick = true;
            } else {
                dontClick = false;
            }
        }

        function mdlCard_onclick(e) {
            if (dontClick) { return; }
            var fileName = e.currentTarget.getElementsByClassName("file_filename")[0].textContent;
            var path = document.getElementById("file_manage_grid").getAttribute("data-path");
            readDirSync(normalizePath(path + "/" + fileName), true);
            console.log(normalizePath(path + "/" + fileName));
        }

        function fileCheckBox() {
            var checkbox = document.createElement("label");
            checkbox.className = "fileCheckBox mdl-checkbox mdl-js-checkbox";
            checkbox.innerHTML = '<input type="checkbox" class="mdl-checkbox__input">';
            checkbox.onclick = fileCheckBox_onclick;
            componentHandler.upgradeElement(checkbox);
            return checkbox;

            function fileCheckBox_onclick(e) {
                if (dontClick && e.isTrusted) { e.preventDefault(); }
                e.stopPropagation();
            }
        }

        function mdlCard__title() {
            var title = document.createElement("div");
            title.className = "mdl-card__title mdl-card--expand";
            title.innerHTML = '<i class="material-icons">' + fileType + '</i>';
            componentHandler.upgradeElement(title);
            return title;
        }

        function mdlCard__actions(fileName) {
            var actions = document.createElement("div");
            actions.className = "mdl-card__actions";
            actions.innerHTML = '<span class="file_filename">' + fileName + '</span>';
            componentHandler.upgradeElement(actions);
            return actions;
        }
    }
}

function normalizePath(path) {
    for (var i = 0; i < path.length; i++) {
        if (i == path.length - 1) { continue }
        var word = path.substr(i, 2);
        switch (word) {
            case "\\":
                return normalizePath(path.replace(/\\/g, "/"));
            case "\\\\":
                return normalizePath(path.replace(/\\\\/g, "/"));
            case "//":
                return normalizePath(path.replace(/\/\//g, "/"));
            default:
                continue;
        }
    }
    return path;
}

function uploadAsync(files, path) {
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.readAsBinaryString(files[i]);
        reader.onload = function (e) {
            httpPut(apiUrl + "/fs/upload?path=" + path, e.target.result, null, window.token, function (xhr) {
                if (xhr.status == 200) {
                    console.log(xhr.responseText);
                    var json = JSON.parse(xhr.responseText);
                    addTaskToPanel("upload:" + path + files[i].name, json.taskId)
                    waitforTask(json.taskId, asyncDelay, function (task) {

                    })
                }
            });
        }

    }
}

function setMaskLayer(element, callback) {
    var mask = document.createElement("div");
    mask.className = "maskLayer";
    mask.onmousedown = function () {
        element.removeChild(mask);
        if (callback) { return callback(); }
    };
    element.appendChild(mask);
    return mask;
}

function rmMaskLayer(element) {
    for (var i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].className == "maskLayer") {
            return element.removeChild(element.childNodes[i]);
        }
    }
}

function addTaskToPanel(taskName, taskId) {
    var item = document.createElement("div");
    item.className = "mdl-list__item mdl-list__item--two-line";
    item.appendChild(item_primary_content(taskId));
    componentHandler.upgradeElement(item);

    var list = document.getElementById("task_panel_list");
    list.insertBefore(item, list.childNodes[0]);

    function item_primary_content() {
        var primaryConetent = document.createElement("span");
        primaryConetent.className = "mdl-list__item-primary-content";

        var icon = document.createElement("i");
        icon.className = "material-icons mdl-list__item-avatar";
        icon.innerText = "watch_later";
        componentHandler.upgradeElement(icon);

        var span = document.createElement("span");
        span.innerText = taskName;

        var span2 = document.createElement("span");
        span2.innerText = taskId;
        span2.className = "mdl-list__item-sub-title";
        componentHandler.upgradeElement(span2);

        primaryConetent.appendChild(icon);
        primaryConetent.appendChild(span);
        primaryConetent.appendChild(span2);
        componentHandler.upgradeElement(primaryConetent);
        return primaryConetent;
    }
}

function updatePanelItem(taskId, icon) {
    var list = document.getElementById("task_panel_list");
    for (var i = 0; i < list.children.length; i++) {
        if (list.children[i].getElementsByClassName("mdl-list__item-sub-title")[0].innerText == taskId) {
            list.children[i].getElementsByClassName("mdl-list__item-avatar")[0].innerText = icon;
        }
    }
}

function cpAsync(src,target) {

}

function mvAsync(src,target) {

}

function rmAsync(target) {

}

function renameAsync(oldname,newname) {

}
