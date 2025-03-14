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

## 改进目的

这些更新确保了转换后的Markdown内容更加纯净可读，专注于实际内容而不包含任何样式、脚本等干扰元素。