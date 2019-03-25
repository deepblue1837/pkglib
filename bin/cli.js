#!/usr/bin/env node
const args = process.argv;
const cmd = args[2];
const inputPath = args[3];
const outputPath = args[4];
const pkglib = require('../index');

if(cmd !== 'gzr' && cmd !== 'ungzr'){
    Tips();
    return;
}

if(!inputPath || inputPath === ''){
    Tips();
    return;
}

if(!outputPath || outputPath === ''){
    Tips();
    return;
}

if(cmd === 'gzr'){
    pkglib.gzr(inputPath, outputPath);
}else if(cmd === 'ungzr') {
    pkglib.ungzr(inputPath, outputPath);
}else{
    Tips();
}

function Tips() {
    console.log('pkglib [压缩|解压: gzr|ungzr] [目标文件路径] [输出存储路径]');
}