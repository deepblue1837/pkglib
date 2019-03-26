const fs = require('fs');
const cp = require('child_process');
const zlib = require('zlib');
/**
 * 拆包解压缩
 * @param inputPath - 要拆包解压的压缩包文件
 * @param outputPath - 解压后的存放路径地址
 */
function extract(inputPath, outputPath, callback) {
    outputPath = outputPath.substr(-1, 1) === '/' ? outputPath.substr(0, outputPath.length - 1) : outputPath;
    if(!fs.existsSync(inputPath)){
        console.log('压缩包不存在');
        return;
    }

    if(!fs.existsSync(outputPath)){
        cp.execSync('mkdir -p ' + outputPath);
    }

    var offset = 0;
    var list = [];
    var gz = fs.readFileSync(inputPath);
    var data = zlib.gunzipSync(gz);
    if(data.length <= 0){
        console.log('文件大小为0, 空文件或者内容丢失');
        return;
    }

    parseDirectoryList();
    //解析buffer结构
    function parseDirectoryList() {
        if(offset >= data.length){
            createDirectoryFiles();
            return;
        }
        var fileType = data.readUInt8(offset);
        offset ++;

        var dirLevel = data.readUInt8(offset);
        offset ++;

        var parent = data.readUInt8(offset);
        offset ++;

        var nameLength = data.readUInt8(offset);
        offset ++;

        var name = data.toString('utf8', offset, offset + nameLength);
        offset += nameLength;

        list[dirLevel] = list[dirLevel] ? list[dirLevel] : [];
        var fileInfo = {
            name: name,
            fileType: fileType,
            dirLevel: dirLevel,
            parent: parent
        };

        if(dirLevel === 0){
            fileInfo.path = outputPath + '/' + name;
        }else{
            var parentPath = list[dirLevel - 1][parent].path;
            fileInfo.path = parentPath + '/' + name;
        }

        if(fileType === 1){
            var contentLength = data.readUInt32BE(offset);
            offset += 4;
            var content = new Buffer(contentLength).fill(0);
            data.copy(content, 0, offset, offset + contentLength);
            offset += contentLength;

            fileInfo.content = content;
        }
        list[dirLevel].push(fileInfo);
        parseDirectoryList();
    }

    //根据目录树创建文件夹和文件
    function createDirectoryFiles() {
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list[i].length; j++) {
                const current = list[i][j];
                if(current.fileType === 1){
                    createFile(current);
                }else{
                    createDir(current);
                }
            }
        }
        callback && callback();
        //创建文件夹
        function createDir(dir) {
            var dirPath;
            if (dir.dirLevel === 0) {
                dirPath = outputPath + '/' + dir.name;
            } else {
                var parentPath = list[dir.dirLevel - 1][dir.parent].path;
                dirPath = parentPath + '/' + dir.name;
            }
            cp.execSync('mkdir -p ' + dirPath);
        }

        //创建文件
        function createFile(file) {
            const parentPath = list[file.dirLevel - 1][file.parent].path;
            fs.writeFileSync(parentPath + '/' + file.name, file.content);
        }
    }
}

module.exports = extract;