import { defineConfig } from 'vite';
const path = require('path');

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  if (command === 'serve') {
    // dev 独有配置
    return {
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.js'),
          name: 'BrowserCache',
          fileName: (format) => `browser-cache.${format}.js`,
        },
      },
    };
  } else {
    // command === 'build'
    // build 独有配置
    return {
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.js'),
          name: 'BrowserCache',
          fileName: (format) => `browser-cache.${format}.js`,
        },
      },
    };
  }
});
