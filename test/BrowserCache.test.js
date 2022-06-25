import { BrowserCache } from "../src";
import defaultOpts from "../src/defaultOpts";

describe("browser cache should be correct", () => {
  test("new BrowserCache()", () => {
    const browserCacheInstance = new BrowserCache();
    expect(browserCacheInstance.opts).toStrictEqual(defaultOpts);
  });
  test("new BrowserCache(driver) valid", () => {
    const browserCacheInstance = new BrowserCache("memory");
    expect(browserCacheInstance.opts.driver).toBe("memory");
  });
  test("new BrowserCache(driver) invalid", () => {
    const initWithInvalidDriver = () => {
      new BrowserCache("invalid");
    };
    expect(initWithInvalidDriver).toThrow(
      "please input the correct driver param as the first param or in the opts params."
    );
  });
});
