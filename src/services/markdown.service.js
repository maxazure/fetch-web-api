import TurndownService from 'turndown';

class MarkdownService {
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      bulletListMarker: '-',
      hr: '---'
    });

    // 配置转换规则
    this.turndownService.addRule('removeScripts', {
      filter: ['script', 'style', 'noscript'],
      replacement: () => ''
    });

    // 保留换行符
    this.turndownService.addRule('preserveLineBreaks', {
      filter: 'br',
      replacement: () => '\n'
    });
  }

  sanitizeHtml(html) {
    // 提取body内容
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    html = bodyMatch ? bodyMatch[1] : html;

    // 移除HTML注释
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // 移除所有script标签及其内容
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 移除所有style标签及其内容
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 移除link标签
    html = html.replace(/<link[^>]*>/gi, '');
    
    // 移除特殊控制字符
    html = html.replace(/[-]/g, '');
    
    return html;
  }

  convertToMarkdown(html) {
    try {
      const sanitizedHtml = this.sanitizeHtml(html);
      const markdown = this.turndownService.turndown(sanitizedHtml);
      // 清理多余的空行
      return markdown.replace(/\n{3,}/g, '\n\n').trim();
    } catch (error) {
      throw new Error(`Markdown conversion failed: ${error.message}`);
    }
  }
}

export const markdownService = new MarkdownService();
