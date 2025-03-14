# Web内容转Markdown服务

这是一个基于Node.js的RESTful API服务，可以将任意网页内容转换为Markdown格式。该服务使用puppeteer-core来渲染网页，确保JavaScript动态内容也能被正确处理。

## 功能特点

- 🌐 支持任意网页URL
- 🔄 保持浏览器会话持久化
- 📝 智能HTML到Markdown转换
- 🛡️ 内置安全保护和错误处理
- 🐳 Docker支持
- 🚀 高性能异步处理

## 系统要求

- Node.js 20+
- Google Chrome/Chromium
- Docker (可选，用于容器化部署)

## 安装

### 本地开发环境

1. 克隆仓库：
```bash
git clone [repository-url]
cd fetch-web-api
```

2. 安装依赖：
```bash
npm install
```

3. 运行服务：
```bash
npm run dev  # 开发模式
# 或
npm start    # 生产模式
```

### Docker部署

### 使用DockerHub镜像（推荐）

直接从DockerHub拉取预构建的镜像：
```bash
docker pull maxazure/fetch-web-api:latest
docker run -d -p 8810:8810 --name fetch-web-api maxazure/fetch-web-api
```

### 本地构建（开发用）

如果您想自行构建Docker镜像：
```bash
docker build -t fetch-web-api .
docker run -d -p 8810:8810 --name fetch-web-api fetch-web-api
```

## 持续集成/持续部署

本项目使用GitHub Actions进行自动化CI/CD流程：

- 当代码推送到main分支时，自动触发构建流程
- 自动构建Docker镜像
- 自动推送到DockerHub
  - 最新版本标签: `maxazure/fetch-web-api:latest`
  - 提交版本标签: `maxazure/fetch-web-api:<commit-sha>`
- 自动更新DockerHub仓库描述

### 开发工作流

1. 克隆仓库并创建新分支
2. 提交代码更改
3. 创建Pull Request到main分支
4. 合并后自动触发构建和部署

## API文档

### 获取网页Markdown内容

**请求：**
- 方法：`POST`
- 端点：`/api/fetch-markdown`
- Content-Type: `application/json`

**请求体：**
```json
{
  "url": "https://example.com"
}
```

**成功响应：**
```json
{
  "status": "success",
  "title": "页面标题",
  "markdown": "转换后的markdown内容"
}
```

**错误响应：**
```json
{
  "status": "error",
  "message": "错误描述",
  "error": "详细错误信息（仅在开发环境）"
}
```

### 健康检查

**请求：**
- 方法：`GET`
- 端点：`/api/health`

**响应：**
```json
{
  "status": "success",
  "message": "Service is running",
  "timestamp": "2024-03-15T01:23:45.678Z"
}
```

## 配置选项

服务配置可以通过环境变量进行自定义：

- `PORT`: 服务端口号（默认：8810）
- `CHROME_PATH`: Chrome可执行文件路径，默认会根据操作系统自动检测：
  - MacOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
  - Windows: 
    - `C:\Program Files\Google\Chrome\Application\chrome.exe`
    - `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
  - Linux: `/usr/bin/google-chrome`
- `USER_DATA_DIR`: Chrome用户数据目录（默认：/tmp/chrome-data）
- `NODE_ENV`: 运行环境（development/production）

### Chrome配置说明

1. **本地开发环境**：
   - 确保系统已安装Google Chrome
   - 如果Chrome安装在非默认位置，通过`CHROME_PATH`环境变量指定：
     ```bash
     # MacOS例子
     export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     
     # Windows例子 (PowerShell)
     $env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
     
     # Linux例子
     export CHROME_PATH="/usr/bin/google-chrome"
     ```

2. **Docker环境**：
   - Dockerfile已配置自动安装Chrome
   - 会自动检测和使用正确的Chrome路径
   - 支持Chromium作为备选方案

## 错误处理

服务包含完整的错误处理机制：

- URL验证
- 请求超时控制
- 浏览器异常恢复
- 内存泄漏预防
- 优雅关闭处理

## 安全注意事项

1. 在生产环境中，建议：
   - 配置反向代理（如Nginx）
   - 设置访问控制
   - 限制请求频率
   - 配置HTTPS

2. Docker部署注意事项：
   - 使用非root用户运行
   - 限制容器资源使用
   - 定期更新依赖

# Markdown转换服务改进

## 功能更新

在markdown转换服务中增加了以下改进：

### 1. 提取body内容

在处理HTML内容时，现在会优先提取`<body>`标签内的内容进行转换。这确保了只处理页面的主要内容。

```javascript
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
html = bodyMatch ? bodyMatch[1] : html;
```

### 2. 增强HTML清理

增加了对各种无关标签的清理：

- **script标签**：移除所有JavaScript代码
  ```javascript
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  ```
  
- **style标签**：移除所有CSS样式
  ```javascript
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  ```
  
- **link标签**：移除外部资源链接
  ```javascript
  html = html.replace(/<link[^>]*>/gi, '');
  ```

### 3. 保留原有功能

保持了原有的功能：
- HTML注释清理
- 特殊字符处理
- Turndown配置（标题样式、代码块等）
- 换行符处理

## 许可证

MIT
## 改进目的

这些更新确保了转换后的Markdown内容更加纯净可读，专注于实际内容而不包含任何样式、脚本等干扰元素。
