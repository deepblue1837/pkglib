const Package = require('./lib/package');
const Extract = require('./lib/extract');

function GZR() {
    /**
     * 打包压缩
     * @param input - 要打包压缩的文件路径地址
     * @param output - 打包压缩后存放的路径地址
     */
    this.gzr = function (input, output) {
        if(!input || input === ''){
            console.log('缺少要操作的目标文件路径参数');
            return;
        }

        if(!output || output === ''){
            console.log('缺少输出文件存放路径参数');
            return;
        }

        Package(input, output);
    };

    /**
     * 解压提取
     * @param input - 要解压提取的压缩包路径地址
     * @param output - 解压提取后的文件存放的路径地址
     */
    this.ungzr = function (input, output) {
        if(!input || input === ''){
            console.log('缺少要操作的目标文件路径参数');
            return;
        }

        if(!output || output === ''){
            console.log('缺少输出文件存放路径参数');
            return;
        }

        Extract(input, output);
    };
}

module.exports = new GZR();




