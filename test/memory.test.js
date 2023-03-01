import { PerfectCache } from "../src";
describe("memory cache should be correct", () => {
  let PerfectCacheInstance;
  beforeAll(() => {
    PerfectCacheInstance = new PerfectCache();
  });
  test("key not exists", () => {
    const value = PerfectCacheInstance.get("key");
    expect(value).toBeUndefined();
  });
});
