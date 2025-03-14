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
    // 移除HTML注释
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    // 移除特殊控制字符
    html = html.replace(/[\x00-\x1F\x7F]/g, '');
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
