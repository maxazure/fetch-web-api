import express from 'express';
import { browserService } from '../services/browser.service.js';
import { markdownService } from '../services/markdown.service.js';

const router = express.Router();

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

router.post('/fetch-markdown', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的URL'
      });
    }

    const { content, title } = await browserService.getPageContent(url);
    const markdown = markdownService.convertToMarkdown(content);

    res.json({
      status: 'success',
      title,
      markdown
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      status: 'error',
      message: '处理请求时发生错误',
      error: error.message
    });
  }
});

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
