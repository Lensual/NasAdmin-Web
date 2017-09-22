//debug
for (var i = 0; i < 4; i++) {
    document.getElementById("file_manage_grid").innerHTML +=
        document.getElementById("file_manage_grid").innerHTML;
}

readDir("c:\\");

function readDir(path) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            setTimeout(waitforTask, 1000, json.TaskId);
        }
    });
}

function waitforTask(taskId) {
    //clearInterval(this);
    checkTask(taskId, function (result) {
        console.log(result);
        var json = JSON.parse(result);
        if (json.Status == "fulfilled") {
            var fmg = document.getElementById("file_manage_grid");
            fmg.innerHTML = "";
            for (var i = 0; i < json.Result.length; i++) {
                var fileObj = fileObject(json.Result[i]);
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

function fileObject(fileName) {
    var fileObj = document.createElement("div");
    fileObj.className = "fileObject mdl-cell mdl-cell--2-col";
    fileObj.appendChild(fileObject_mdlCard(fileName));
    componentHandler.upgradeElement(fileObj);
    return fileObj;

    function fileObject_mdlCard(fileName) {
        var mdlCard = document.createElement("div");
        mdlCard.className = "insert_drive_file mdl-card mdl-shadow--2dp";
        mdlCard.appendChild(mdlCard__title());
        mdlCard.appendChild(mdlCard__actions(fileName));
        componentHandler.upgradeElement(mdlCard);
        return mdlCard;

        function mdlCard__title() {
            var title = document.createElement("div");
            title.className = "mdl-card__title mdl-card--expand";
            title.innerHTML = '<i class="material-icons">insert_drive_file</i>';
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