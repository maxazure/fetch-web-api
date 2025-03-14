import puppeteer from 'puppeteer-core';
import { config } from '../config/config.js';
import fs from 'fs';
import path from 'path';

class BrowserService {
  constructor() {
    this.browser = null;
    this.isInitializing = false;
  }

  async checkChromePath() {
    const chromePath = config.chrome.executablePath;
    try {
      await fs.promises.access(chromePath, fs.constants.X_OK);
      return true;
    } catch (error) {
      console.error(`Chrome not found at ${chromePath}`);
      if (process.platform === 'darwin') {
        console.error('在MacOS上请确保已安装Chrome，或设置正确的CHROME_PATH环境变量');
      } else if (process.platform === 'win32') {
        console.error('在Windows上请确保已安装Chrome，或设置正确的CHROME_PATH环境变量');
      } else {
        console.error('在Linux上请确保已安装Chrome，或设置正确的CHROME_PATH环境变量');
      }
      return false;
    }
  }

  async getBrowser() {
    if (this.browser) {
      return this.browser;
    }

    if (this.isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.getBrowser();
    }

    try {
      this.isInitializing = true;

      // 检查Chrome是否存在
      const chromeExists = await this.checkChromePath();
      if (!chromeExists) {
        throw new Error(`Chrome不存在于指定路径: ${config.chrome.executablePath}\n` +
          `请安装Chrome或通过环境变量CHROME_PATH指定Chrome路径`);
      }

      // 确保用户数据目录存在
      await fs.promises.mkdir(config.chrome.userDataDir, { recursive: true });
      this.browser = await puppeteer.launch({
        executablePath: config.chrome.executablePath,
        userDataDir: config.chrome.userDataDir,
        defaultViewport: config.chrome.defaultViewport,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
        this.isInitializing = false;
      });

      return this.browser;
    } catch (error) {
      this.isInitializing = false;
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  async getPageContent(url) {
    if (!url || url.length > config.api.maxUrlLength) {
      throw new Error('Invalid URL');
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setDefaultNavigationTimeout(config.api.timeout);
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const content = await page.evaluate(() => {
        const article = document.querySelector('article') || document.body;
        return article.innerHTML;
      });

      const title = await page.title();
      
      return {
        content,
        title
      };
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const browserService = new BrowserService();
