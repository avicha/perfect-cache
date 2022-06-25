import { BrowserCache } from "../src";
describe("memory cache should be correct", () => {
  let browserCacheInstance;
  beforeAll(() => {
    browserCacheInstance = new BrowserCache();
  });
  test("key not exists", () => {
    const value = browserCacheInstance.get("key");
    expect(value).toBeUndefined();
  });
});
