//debug
for (var i = 0; i < 10; i++) {
    var fmg = document.getElementById("file_manage_grid");
    fmg.appendChild(fileObject("folder", "folder"));
    fmg.appendChild(fileObject("insert_drive_file", "insert_drive_file"));
    fmg.appendChild(fileObject("folder_open", "folder_open"));
    fmg.appendChild(fileObject("movie", "movie"));
    fmg.appendChild(fileObject("album", "album"));
}

//readDir("c:\\");

function readDir(path) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            setTimeout(waitforTask, 1000, json.TaskId);
        }
    });
}

function waitforTask(taskId) {
    checkTask(taskId, function (result) {
        console.log(result);
        var json = JSON.parse(result);
        if (json.Status == "fulfilled") {
            var fmg = document.getElementById("file_manage_grid");
            fmg.innerHTML = "";
            //排序 文件夹靠前
            var swap;
            for (var i = 0; i < json.Result.length; i++) {
                if (json.Result[i] &&
                    json.Result[i].type != "Directory" &&
                    json.Result[i + 1] &&
                    json.Result[i + 1].type == "Directory") {
                    //swap
                    swap = json.Result[i];
                    json.Result[i] = json.Result[i + 1];
                    json.Result[i + 1] = swap;
                }
                //最后一个并且本轮交换过
                if (i == json.Result.length -1 && swap) {
                    i = -1; //reset
                    swap = null;
                }
            }
            //遍历 生成元素
            for (var i = 0; i < json.Result.length; i++) {
                var fileObj = fileObject(json.Result[i].name, getClassForFileType(json.Result[i].type));
                fmg.appendChild(fileObj);
            }
        } else if (json.Status == "pending") {
            setTimeout(waitforTask, 1000, json.TaskId);
        }
    });
}

function checkTask(taskId, callback) {
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
        mdlCard.onclick = function (e) {
            if (e.srcElement == e.currentTarget.getElementsByClassName("mdl-checkbox__input")[0]) {
                return;
            }
            e.preventDefault();
            e.currentTarget.getElementsByClassName("mdl-checkbox__input")[0].click();
            console.log(e);
        };
        componentHandler.upgradeElement(mdlCard);
        return mdlCard;

        function fileCheckBox() {
            var checkbox = document.createElement("label");
            checkbox.className = "fileCheckBox mdl-checkbox mdl-js-checkbox";
            checkbox.innerHTML = '<input type="checkbox" class="mdl-checkbox__input">';
            componentHandler.upgradeElement(checkbox);
            return checkbox;
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