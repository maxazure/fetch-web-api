import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import apiRoutes from './routes/api.routes.js';
import { browserService } from './services/browser.service.js';

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 请求大小限制
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API路由
app.use('/api', apiRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 优雅关闭
async function shutdown() {
  console.log('收到关闭信号，正在清理资源...');
  await browserService.cleanup();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// 启动服务器
app.listen(config.port, () => {
  console.log(`服务已启动，监听端口 ${config.port}`);
  console.log(`健康检查: http://localhost:${config.port}/api/health`);
  console.log(`API接口: http://localhost:${config.port}/api/fetch-markdown`);
});
