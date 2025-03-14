function getDefaultChromePath() {
  const platform = process.platform;
  switch (platform) {
    case 'darwin': // macOS
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    case 'win32': // Windows
      const windowsPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      ];
      return process.env.CHROME_PATH || windowsPaths[0];
    default: // Linux
      return '/usr/bin/google-chrome';
  }
}

export const config = {
  port: process.env.PORT || 8810,
  chrome: {
    executablePath: process.env.CHROME_PATH || getDefaultChromePath(),
    userDataDir: process.env.USER_DATA_DIR || '/tmp/chrome-data',
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  },
  api: {
    timeout: 30000, // 30 seconds
    maxUrlLength: 2000
  }
};
