var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var defaultOpts = {
  driver: "memory"
};
class BaseStore {
}
class MemoryStore extends BaseStore {
}
__publicField(MemoryStore, "driver", "memory");
const systemStores = {};
for (const store of [MemoryStore]) {
  systemStores[store.driver] = store;
}
const externalStores = {};
const registerStore = (store) => {
  if (Object.getPrototypeOf(store) === BaseStore) {
    if (store.driver && typeof store.driver === "string") {
      externalStores[store.driver] = store;
    } else {
      throw new Error("please input the driver name.");
    }
  }
};
const getSupportedDriverList = () => {
  let supportedDriverList = ["memory"];
  if (window.localStorage && systemStores.localStorage) {
    supportedDriverList.push("localStorage");
  }
  if (window.sessionStorage && systemStores.sessionStorage) {
    supportedDriverList.push("sessionStorage");
  }
  if (window.document.cookie && systemStores.cookie) {
    supportedDriverList.push("cookie");
  }
  if (window.indexedDB && systemStores.indexedDB) {
    supportedDriverList.push("indexedDB");
  }
  supportedDriverList = supportedDriverList.concat(Object.keys(externalStores));
  return supportedDriverList;
};
const getStoreClass = (driver) => {
  return systemStores[driver] || externalStores[driver];
};
class BrowserCache {
  constructor(driver, opts) {
    __publicField(this, "opts");
    __publicField(this, "__init", false);
    __publicField(this, "driver");
    __publicField(this, "store");
    const suportedDriverList = getSupportedDriverList();
    if (!driver && !opts) {
      opts = __spreadValues({}, defaultOpts);
    } else {
      if (driver) {
        if (suportedDriverList.includes(driver)) {
          if (Object.prototype.toString.call(opts) === "[object Object]") {
            opts = __spreadValues(__spreadProps(__spreadValues({}, defaultOpts), { driver }), opts);
          } else {
            opts = __spreadProps(__spreadValues({}, defaultOpts), { driver });
          }
        } else {
          if (Object.prototype.toString.call(driver) === "[object Object]" && suportedDriverList.includes(driver.driver)) {
            opts = __spreadValues(__spreadValues({}, defaultOpts), driver);
          } else {
            throw new Error("please input the correct driver param as the first param or in the opts params.");
          }
        }
      } else {
        throw new Error("please input the driver as first param.");
      }
    }
    if (opts && opts.driver) {
      this.opts = opts;
      this.initDriver();
      this.__init = true;
    } else {
      throw new Error("please input the driver as first param.");
    }
  }
  initDriver() {
    const suportedDriverList = getSupportedDriverList();
    if (!this.store && this.opts && this.opts.driver && suportedDriverList.includes(this.opts.driver)) {
      const StoreClass = getStoreClass(this.opts.driver);
      this.store = new StoreClass(this.opts);
      this.driver = this.opts.driver;
    }
  }
  setDriver(driver) {
    this.opts.driver = driver;
    this.initDriver();
  }
  get(key) {
  }
}
export { BaseStore, BrowserCache, registerStore };
