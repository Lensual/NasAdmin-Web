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

fsApiHelper.uploadAsync = function (file, path, callback) {
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = function (e) {
        httpPut(apiUrl + "/fs/upload?path=" + path, e.target.result, null, window.token, function (xhr) {
            if (xhr.status == 200) {
                console.log(xhr.responseText);
                var json = JSON.parse(xhr.responseText);
                callback(json);
            }
        });

    }
}

fsApiHelper.uploadFilesAsync = function (files, path, callback) {
    for (var i = 0; i < files.length; i++) {
        fsApiHelper.uploadAsync(files[i],path,callback)
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

