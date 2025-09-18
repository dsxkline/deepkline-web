# ========== 构建阶段 ==========
FROM node:20 AS builder

WORKDIR /bitkline-web

# 复制依赖清单
COPY package*.json ./
COPY .env* ./

# 安装依赖
RUN npm install

# 复制项目源码
COPY . .

# 构建 NestJS 项目
RUN npm run build

# ========== 运行阶段 ==========
FROM node:20

WORKDIR /bitkline-web

# 复制运行时依赖
COPY package*.json ./
COPY .env* ./
RUN npm install

# 复制编译后的代码
COPY --from=builder /bitkline-web/.output ./.output

# 设置默认启动命令
CMD ["npm", "run", "start"]
# 显示端口（可选，记得在 docker run 或 compose 中映射）
EXPOSE 3000
