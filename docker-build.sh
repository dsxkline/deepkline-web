#!/bin/bash

APP_NAME="dk-web"
TIMESTAMP=$(date +%Y%m%d%H%M%S)

docker build --no-cache -f Dockerfile -t $APP_NAME:$TIMESTAMP .
