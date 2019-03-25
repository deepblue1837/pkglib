# pkglib

## Features

- 暂不兼容windows系统
- 非标准协议打包
- GZIP压缩

## Install

```
npm install pkglib
```

## API

### gzr(input, output)

打包压缩

- input: 要进行打包压缩的文件或者目录路径地址
- output: 压缩包输出存放的路径地址，不需要追加文件名，默认以源文件名 + .gzr后缀。

### ungzr(input, output)

解压提取

- input: 要进行加压提取的压缩包路径地址
- output: 解压后的文件输出存放路径地址

## cli

```
pkglib [压缩|解压: gzr|ungzr] [目标文件路径] [输出存储路径]
```

