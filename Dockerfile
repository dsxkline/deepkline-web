# 使用官方 Node.js 镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果有的话) 到容器中
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有项目文件到容器中
COPY . .

# 构建 Nuxt 应用（生产模式）
RUN npm run build

# 暴露 Nuxt 的默认端口（默认是 3000）
EXPOSE 3000

# 启动 Nuxt 应用
CMD ["npm", "run", "start"]
