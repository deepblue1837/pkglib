const fs = require('fs');
const cp = require('child_process');
const zlib = require('zlib');

/**
 * 打包压缩
 * @param inputPath - 要打包压缩的文件路径地址
 * @param outputPath - 打包压缩后的文件包存放地址
 */
function Packaging(inputPath, outputPath) {
    if(!fs.existsSync(inputPath)){
        console.log('目标文件不存在');
    }

    inputPath = inputPath.substr(-1, 1) === '/' ? inputPath.substr(0, inputPath.length - 1) : inputPath;

    const targetStat = fs.statSync(inputPath);
    if(targetStat.isDirectory()){
        //把扫描的目录树并打包
        console.log('开始扫描目录树');
        scanningDirection(function (list) {
            var resultBuffer = new Buffer(0);
            for(var i=0; i<list.length; i++){
                for(var j=0; j<list[i].length; j++){
                    if(list[i][j].fileType === 0){
                        //打包文件夹
                        var dirBuffer = buildDirBuffer(list[i][j]);
                        resultBuffer = Buffer.concat([resultBuffer, dirBuffer]);
                    }else{
                        //打包文件
                        var fileBuffer = buildFileBuffer(list[i][j]);
                        resultBuffer = Buffer.concat([resultBuffer, fileBuffer]);
                    }
                }
            }

            createPkg(outputPath, resultBuffer);
        });
    }else{
        createPkg(outputPath, buildFileBuffer(inputPath));
    }

    //扫描目录结构
    function scanningDirection(callback) {
        var dirList = [];
        var dirLevel = 0;

        listArr();
        function listArr() {
            if(dirLevel > 0){
                //扫描2级以下目录
                if(!dirList[dirLevel - 1] || dirList[dirLevel - 1].length === 0){
                    console.log('扫描结束');
                    callback(dirList);
                    return;
                }

                for(var i=0; i<dirList[dirLevel - 1].length; i++){
                    const parentFile = dirList[dirLevel - 1][i];
                    if(parentFile.fileType === 1){
                        continue;
                    }

                    dirList[dirLevel] = dirList[dirLevel] ? dirList[dirLevel] : [];
                    if(parentFile.fileType === 0){
                        var files = fs.readdirSync(parentFile.path);
                        for(var j=0; j<files.length; j++){
                            if(files[j].substr(0, 1) === '.'){
                                continue;
                            }

                            var fileStat = fs.statSync(parentFile.path + '/' + files[j]);
                            var fileInfo = {
                                name: files[j],
                                path: parentFile.path + '/' + files[j],
                                parent: i,
                                level: dirLevel
                            };
                            if(fileStat.isDirectory()){
                                fileInfo.fileType = 0;
                            }else{
                                fileInfo.fileType = 1;
                            }
                            dirList[dirLevel].push(fileInfo);
                        }
                    }
                }

            }else{
                //生成根目录
                var root = inputPath.split('/');
                dirList[0] = [{name: root[root.length - 1], path: inputPath, level: 0, parent: 0, fileType: 0}];
            }
            dirLevel ++;
            listArr();
        }
    }

    //构建文件buffer结构
    function buildFileBuffer (file) {
        const fileType = new Buffer(1).fill(1);
        const dirLevel = new Buffer(1).fill(file.level);
        const parent = new Buffer(1).fill(file.parent);
        const name = new Buffer(file.name, 'utf8');
        const nameLength = new Buffer(1).fill(name.length);
        const content = fs.readFileSync(file.path);
        const contentLength = new Buffer(4).fill(0);
        contentLength.writeUInt32BE(content.length);

        return Buffer.concat([fileType, dirLevel, parent, nameLength, name, contentLength, content]);
    }

    //构建文件夹buffer结构
    function buildDirBuffer(file) {
        const fileTyle = new Buffer(1).fill(0);
        const dirLevel = new Buffer(1).fill(file.level);
        const parent = new Buffer(1).fill(file.parent);
        const name = new Buffer(file.name, 'utf8');
        const nameLength = new Buffer(1).fill(name.length);
        return Buffer.concat([fileTyle, dirLevel, parent, nameLength, name]);
    }

    //输出文件到存储地址
    function createPkg(path, data) {
        const pathArr = inputPath.split('/');
        const filePath = path + '/' + pathArr[pathArr.length - 1] + '.gzr';
        const gz = zlib.gzipSync(data);
        if(!fs.existsSync(path)){
            cp.execSync('mkdir -p ' + path);
        }

        console.log('文件包生成地址', filePath, gz.length);
        fs.writeFileSync(filePath, gz);
    }
}

module.exports = Packaging;