import { getSupportedDriverList, getStoreClass } from "../src/utils";
import LocalStorageStore from "../src/stores/LocalStorageStore";
import MemoryStore from "../src/stores/MemoryStore";
import SessionStorageStore from "../src/stores/SessionStorageStore";
import CookieStore from "../src/stores/CookieStore";
import IndexedDBStore from "../src/stores/IndexedDBStore";

describe("getSupportedDriverList should be correct", () => {
  let supportedDriverList;
  beforeAll(() => {
    supportedDriverList = getSupportedDriverList();
  });
  test("supportedDriverList type", () => {
    expect(supportedDriverList).toBeInstanceOf(Array);
    expect(supportedDriverList.length).toBeGreaterThan(0);
  });
  test("supportedDriverList result", () => {
    expect(supportedDriverList).toContain("memory");
    expect(supportedDriverList).toContain("localStorage");
    expect(supportedDriverList).toContain("sessionStorage");
  });
});

describe("getStoreClass should be correct", () => {
  test("getStoreClass result", () => {
    expect(getStoreClass("memory")).toBe(MemoryStore);
    expect(getStoreClass("localStorage")).toBe(LocalStorageStore);
    expect(getStoreClass("sessionStorage")).toBe(SessionStorageStore);
    expect(getStoreClass("cookie")).toBe(CookieStore);
    expect(getStoreClass("indexedDB")).toBe(IndexedDBStore);
  });
});
