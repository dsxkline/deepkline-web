#!/bin/bash
set -e  # 任意命令失败时退出
set -o pipefail  # 管道中任意失败即退出
# 第一步：打印开始信息
echo "docker build start..."

git pull

./docker-build.sh

# 第七步：打印完成信息
echo "docker build end"
