# 使用Node.js官方镜像作为基础镜像
FROM node:20-slim

# 安装Chrome依赖
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建Chrome用户数据目录
RUN mkdir -p /tmp/chrome-data && chown -R node:node /tmp/chrome-data

# 使用非root用户运行
USER node

# 设置环境变量
ENV NODE_ENV=production
ENV USER_DATA_DIR=/tmp/chrome-data

# 确保Chrome路径正确并设置环境变量
RUN if [ -f "/usr/bin/google-chrome" ]; then \
    echo "Chrome found at /usr/bin/google-chrome"; \
    else \
    echo "Chrome not found at default location, checking alternatives"; \
    for chrome_path in \
        "/usr/bin/chromium" \
        "/usr/bin/chromium-browser" \
        "/usr/bin/google-chrome-stable"; \
    do \
        if [ -f "$chrome_path" ]; then \
            echo "Found Chrome/Chromium at $chrome_path"; \
            ln -s "$chrome_path" /usr/bin/google-chrome; \
            break; \
        fi; \
    done; \
    fi

ENV CHROME_PATH=/usr/bin/google-chrome

# 暴露端口
EXPOSE 8810

# 启动应用
CMD ["npm", "start"]
