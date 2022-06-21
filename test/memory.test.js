import { BrowserCache } from '../dist/browser-cache.es.js';
describe('memory cache should be correct', () => {
  const browserCacheInstance = new BrowserCache();
  test('key not exists', () => {
    const value = browserCacheInstance.get('key');
    expect(value).toBeUndefined();
  });
});
