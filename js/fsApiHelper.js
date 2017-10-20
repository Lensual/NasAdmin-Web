var fsApiHelper = new Object();
fsApiHelper.readDirSync = function (path, callback) {
    httpGet(apiUrl + "/fs/readDirSync/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 200) {
            console.log(xhr.responseText);
            callback(JSON.parse(xhr.responseText));
        }
    });
}

fsApiHelper.readDirAysnc = function (path, callback) {
    httpGet(apiUrl + "/fs/readDir/?path=" + path, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            callback(json);
        }
    });
}

fsApiHelper.newUploadTask = function (path, len, callback) {
    httpGet(apiUrl + "/fs/newUploadTask?path=" + path + "&len=" + len, window.token, function (xhr) {
        if (xhr.status == 202) {
            var json = JSON.parse(xhr.responseText);
            callback(json);
        }
    });
}

fsApiHelper.uploadAsync = function (taskId, file, path, callback) {
    //fsApiHelper.newUploadTask(path, file.size, function (json) {
    var reader = new FileReader();
    //reader.readAsBinaryString(file);
    reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
        httpPut(apiUrl + "/fs/upload?taskId=" + taskId + "&start=0&end=" + file.size, e.target.result, null, window.token, function (xhr) {
            if (xhr.status == 201) {
                console.log(xhr.responseText);
                var json = JSON.parse(xhr.responseText);
                callback(json);
            }
        });
    }

    //});
}

fsApiHelper.cpAsync = function (src, target) {

}

fsApiHelper.mvAsync = function (src, target) {

}

fsApiHelper.rmAsync = function (target, recursive) {

}

fsApiHelper.renameAsync = function (oldname, newname) {

}

