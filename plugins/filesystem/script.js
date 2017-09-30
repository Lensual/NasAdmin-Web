var fmg = document.getElementById("file_manage_grid");
var toolbarUrl_input = document.getElementById("toolbar-url_input");
var fmg_navHistory_before = [];
var fmg_navHistory_next = [];

//register event
document.getElementById("btn_navigate_before").onclick = function (e) {
    var path = fmg_navHistory_before.pop();
    if (path) {
        fmg_navHistory_next.push(fmg.getAttribute("data-path"));
        readDirSync(path, false);
    }
}
document.getElementById("btn_navigate_next").onclick = function (e) {
    var path = fmg_navHistory_next.pop();
    if (path) {
        fmg_navHistory_before.push(fmg.getAttribute("data-path"));
        readDirSync(path, false);
    }
}
fmg.onmousedown = function (p1) {
    p1.preventDefault();
    p1.stopPropagation();
    //xy
    var p1x = p1.pageX;
    var p1y = p1.pageY - document.getElementById("contents").offsetTop;
    //element
    var fmg_Selected;
    //event
    fmg.onmousemove = function (e) {
        var x = e.pageX;
        var y = e.pageY - document.getElementById("contents").offsetTop;
        //忽略鼠标抖动
        if (!fmg_Selected) {
            if ((Math.abs(p1x - x) < 3 || Math.abs(p1y - y) < 3)) {
                return;
            }
            fmg_Selected = createSelected(0, 0, 0, 0);
        }
        e.preventDefault();
        e.stopPropagation();
        //draw selected
        if (x < p1x) {   //left
            fmg_Selected.style.left = x + 'px';
        } else {
            fmg_Selected.style.left = p1x + 'px';
        }
        fmg_Selected.style.width = Math.abs(x - p1x) + 'px';
        if (y < p1y) { //up
            fmg_Selected.style.top = y + 'px';
        } else {
            fmg_Selected.style.top = p1y + 'px';
        }
        fmg_Selected.style.height = Math.abs(y - p1y) + 'px';
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

    fmg.onmouseup = function (p2) {
        if (fmg_Selected) {   //忽略鼠标抖动
            p2.preventDefault();
            p2.stopPropagation();
            //xy
            var p2x = p2.pageX;
            var p2y = p2.pageY - document.getElementById("contents").offsetTop;
            //select
            var fileObj = document.getElementsByClassName("fileObject");
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
                    fileObj[i].getElementsByClassName("mdl-checkbox__input")[0].click();
                    //createSelected(fileObj[i].offsetLeft,
                    //    fileObj[i].offsetTop,
                    //    fileObj[i].offsetWidth,
                    //    fileObj[i].offsetHeight);
                    console.log(fileObj[i]);
                }
            }
            //clear
            fmg_Selected.parentElement.removeChild(fmg_Selected);
            fmg_Selected = null;
        }
        //clear
        fmg.onmousemove = null;
        fmg.onmouseup = null;
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

readDirSync("/", false);

function readDirSync(path, recHistory) {
    httpGet(apiUrl + "/fs/readDirSync/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 200) {
            console.log(xhr.responseText);
            var json = JSON.parse(xhr.responseText);
            afterReadDir(json.files, path, recHistory);
        }
    });
}

function readDir(path, recHistory) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            waitforTask(json.TaskId, 1000, function (task) {
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
    setTimeout(checkTask, delay, [taskId, function (result) {
        console.log(result);
        var task = JSON.parse(result);
        if (task.Status == "fulfilled") {
            callback(task);
        } else if (task.Status == "pending") {
            waitforTask(taskId, delay, callback)
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
        mdlCard.onclick = mdlCard_onclick;
        componentHandler.upgradeElement(mdlCard);
        return mdlCard;

        function mdlCard_onclick(e) {
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