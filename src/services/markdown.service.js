import TurndownService from 'turndown';

class MarkdownService {
  constructor() {
    // 配置Turndown服务
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      bulletListMarker: '-',
      hr: '---',
      linkStyle: 'inlined'
    });

    // 初始化规则
    this.setupRules();
  }

  setupRules() {
    // 移除无用元素
    this.turndownService.addRule('removeUnwantedElements', {
      filter: ['script', 'style', 'noscript', 'iframe', 'canvas', 'svg'],
      replacement: () => ''
    });

    // 保留换行符
    this.turndownService.addRule('preserveLineBreaks', {
      filter: 'br',
      replacement: () => '\n'
    });

    // 清理链接
    this.turndownService.addRule('cleanLinks', {
      filter: (node) => node.nodeName === 'A',
      replacement: (content, node) => {
        if (!content.trim()) return '';
        
        const href = node.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) {
          return content;
        }
        
        return `[${content}](${href})`;
      }
    });

    // 处理图片
    this.turndownService.addRule('cleanImages', {
      filter: 'img',
      replacement: (content, node) => {
        const src = node.getAttribute('src');
        if (!src) return '';
        
        // 忽略base64编码的图像
        if (src.includes('base64')) {
          return '';
        }
        
        const alt = node.getAttribute('alt') || '';
        return `![${alt}](${src})`;
      }
    });
  }
  
  /**
   * 提取body内容
   */
  extractBodyContent(html) {
    if (!html) return '';
    
    // 提取body内容
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
    
    return html; // 如果找不到body标签，返回原始HTML
  }

  /**
   * 清理HTML
   */
  sanitizeHtml(html) {
    if (!html) return '';
    
    try {
      // 1. 只提取body内的元素
      let bodyContent = this.extractBodyContent(html);
      
      // 2. 删除指定元素
      
      // 删除所有script标签及其内容
      bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // 删除所有style标签及其内容
      bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
      // 删除含有base64的img标签
      bodyContent = bodyContent.replace(/<img[^>]*base64[^>]*>/gi, '');
      
      // 删除含有display:none的标签
      const displayNoneRegex = /<([a-z]+)[^>]*style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi;
      bodyContent = bodyContent.replace(displayNoneRegex, '');
      
      // 删除单标签且带有display:none的元素
      const singleDisplayNoneRegex = /<[^>]*style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*\/?>/gi;
      bodyContent = bodyContent.replace(singleDisplayNoneRegex, '');
      
      // 删除带有隐藏CSS类的元素
      const hiddenClassRegex = /<([a-z]+)[^>]*class\s*=\s*["'][^"']*(hidden|hide|invisible)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi;
      bodyContent = bodyContent.replace(hiddenClassRegex, '');

      // 删除meta标签
      bodyContent = bodyContent.replace(/<meta[^>]*>/gi, '');
      
      // 删除link标签
      bodyContent = bodyContent.replace(/<link[^>]*>/gi, '');
      
      // 删除注释
      bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');
      
      // 删除所有CSS和JS的内联代码
      bodyContent = bodyContent.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, ''); // 事件处理器
      bodyContent = bodyContent.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, ''); // 内联样式
      
      // 清理空标签
      bodyContent = bodyContent.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '');
      
      return bodyContent;
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      return html;
    }
  }

  /**
   * 将HTML转换为Markdown
   */
  convertToMarkdown(html) {
    if (!html) return '';
    
    try {
      // 提取标题和描述作为备用
      let pageTitle = '';
      
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        pageTitle = titleMatch[1].trim();
      }
      
      // 清理HTML
      const sanitizedHtml = this.sanitizeHtml(html);
      
      // 转换为Markdown
      let markdown = this.turndownService.turndown(sanitizedHtml);
      
      // 后处理清理
      markdown = this.postProcessMarkdown(markdown);
      
      // 如果有pageTitle且结果不是空的，添加标题
      if (pageTitle && markdown && markdown.trim().length > 0) {
        // 检查markdown中是否已经包含了标题
        if (!markdown.startsWith('# ')) {
          markdown = `# ${pageTitle}\n\n${markdown}`;
        }
      }
      
      // 如果结果为空，至少返回标题
      if (!markdown || markdown.trim().length === 0) {
        if (pageTitle) {
          return `# ${pageTitle}`;
        } else {
          return '';
        }
      }
      
      return markdown;
    } catch (error) {
      console.error('Error converting to Markdown:', error);
      
      // 错误恢复：至少返回标题
      try {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          return `# ${titleMatch[1].trim()}`;
        }
      } catch (e) {
        // 忽略
      }
      
      return '';
    }
  }
  
  /**
   * 后处理Markdown
   */
  postProcessMarkdown(markdown) {
    if (!markdown) return '';
    
    // 清理多余空行
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // 清理残留的CSS
    markdown = markdown.replace(/\s*\{[^\}]*\}\s*/g, ' ');
    markdown = markdown.replace(/\s*:[^;]*;/g, ' ');
    
    // 清理空链接
    markdown = markdown.replace(/\[\]\(\)/g, '');
    markdown = markdown.replace(/\[([^\]]*)\]\(\s*\)/g, '$1');
    
    // 清理残留的HTML标签
    if (markdown.includes('<') && markdown.includes('>')) {
      markdown = markdown.replace(/<[^>]*>/g, ' ');
      markdown = markdown.replace(/\s+/g, ' ');
    }
    
    // 清理连续空格
    markdown = markdown.replace(/\s{2,}/g, ' ');
    
    return markdown.trim();
  }
}

export const markdownService = new MarkdownService();
