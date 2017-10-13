var fsApiHelper = new Object();

fsApiHelper.readDirSync = function (path, callback) {
    httpGet(apiUrl + "/fs/readDirSync/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 200) {
            console.log(xhr.responseText);
            callback(JSON.parse(xhr.responseText));
            //afterReadDir(json.files, path, recHistory);
        }
    });
}

fsApiHelper.readDirAysnc = function (path, callback) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            waitforTask(json.TaskId, asyncDelay, function (task) {
                callback(task.Result);
            });
        }
    });
}

fsApiHelper.uploadAsync = function (files, path) {
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

fsApiHelper.cpAsync = function (src, target) {

}

fsApiHelper.mvAsync = function (src, target) {

}

fsApiHelper.rmAsync = function (target, recursive) {

}

fsApiHelper.renameAsync = function (oldname, newname) {

}

