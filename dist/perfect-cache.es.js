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
  driver: "memory",
  prefix: "cache:"
};
function mitt(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
    var i = n.get(t);
    i ? i.push(e) : n.set(t, [e]);
  }, off: function(t, e) {
    var i = n.get(t);
    i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
  }, emit: function(t, e) {
    var i = n.get(t);
    i && i.slice().map(function(n2) {
      n2(e);
    }), (i = n.get("*")) && i.slice().map(function(n2) {
      n2(t, e);
    });
  } };
}
class EventListener {
  constructor() {
    __publicField(this, "mitt", new mitt());
  }
  $on() {
    return this.mitt.on.apply(this, arguments);
  }
  $off() {
    return this.mitt.off.apply(this, arguments);
  }
  $emit() {
    return this.mitt.emit.apply(this, arguments);
  }
}
const StoreResult = {
  OK: Symbol("OK"),
  KEY_NOT_EXISTS: Symbol("KEY_NOT_EXISTS"),
  KEY_EXPIRED: Symbol("KEY_EXPIRED"),
  JSON_PARSE_ERROR: Symbol("JSON_PARSE_ERROR"),
  NX_SET_NOT_PERFORMED: Symbol("NX_SET_NOT_PERFORMED"),
  XX_SET_NOT_PERFORMED: Symbol("XX_SET_NOT_PERFORMED")
};
class BaseStore extends EventListener {
  constructor(opts = {}) {
    super();
    __publicField(this, "opts");
    __publicField(this, "isReady", false);
    __publicField(this, "prefix", "cache:");
    this.opts = opts;
    if (this.opts.prefix) {
      this.prefix = this.opts.prefix;
    }
    this.isReady = false;
  }
  __getRealKey(key) {
    return `${this.prefix}${key}`;
  }
  ready(callback) {
    setTimeout(() => {
      this.isReady = true;
      this.$emit("ready");
      if (callback && typeof callback === "function") {
        callback();
      }
    }, 0);
  }
  keyValueGet() {
    throw new Error("please implement the keyValueGet method for this driver.");
  }
  keyValueSet() {
    throw new Error("please implement the keyValueSet method for this driver.");
  }
  existsKey() {
    throw new Error("please implement the existsKey method for this driver.");
  }
  removeItem() {
    throw new Error("please implement the removeItem method for this driver.");
  }
  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      await this.removeItem(key);
    }
    return Promise.resolve();
  }
  keys() {
    throw new Error("please implement the keys method for this driver.");
  }
  length() {
    return new Promise((resolve, reject) => {
      this.keys().then((keys) => {
        resolve(keys.length);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  getItem(key) {
    return new Promise((resolve, reject) => {
      this.keyValueGet(key).then((valueObj) => {
        if (valueObj) {
          if (valueObj.expiredTimeAt) {
            if (valueObj.expiredTimeAt > Date.now()) {
              if (valueObj.maxAge) {
                valueObj.expiredTimeAt = Date.now() + valueObj.maxAge;
                this.keyValueSet(key, valueObj).then(() => {
                  return resolve(valueObj.value);
                }).catch((e) => {
                  reject(e);
                });
              } else {
                resolve(valueObj.value);
              }
            } else {
              this.$emit("cacheExpired", key);
              resolve();
            }
          } else {
            resolve(valueObj.value);
          }
        } else {
          resolve();
        }
      }).catch((e) => {
        reject(e);
      });
    });
  }
  setItem(key, value, options = {}) {
    const {
      expiredTime,
      expiredTimeAt,
      maxAge,
      setOnlyNotExist = false,
      setOnlyExist = false
    } = options;
    let localExpiredTimeAt, localMaxAge;
    if (expiredTime && typeof expiredTime === "number" && expiredTime > 0) {
      localExpiredTimeAt = Date.now() + expiredTime;
    }
    if (expiredTimeAt && typeof expiredTimeAt === "number" && expiredTimeAt > 0) {
      localExpiredTimeAt = expiredTimeAt;
    }
    if (localExpiredTimeAt) {
      localExpiredTimeAt = Math.max(localExpiredTimeAt, Date.now());
    } else {
      if (maxAge && typeof maxAge === "number" && maxAge > 0) {
        localExpiredTimeAt = Date.now() + maxAge;
        localMaxAge = maxAge;
      }
    }
    return new Promise((resolve, reject) => {
      if (setOnlyNotExist || setOnlyExist) {
        this.existsKey(key).then((existsKey) => {
          if (setOnlyNotExist && existsKey) {
            return resolve(StoreResult.NX_SET_NOT_PERFORMED);
          }
          if (setOnlyExist && !existsKey) {
            return resolve(StoreResult.XX_SET_NOT_PERFORMED);
          }
          this.keyValueSet(key, {
            value,
            expiredTimeAt: localExpiredTimeAt,
            maxAge: localMaxAge
          }).then(() => {
            return resolve(StoreResult.OK);
          }).catch((e) => {
            reject(e);
          });
        }).catch((e) => {
          reject(e);
        });
      } else {
        this.keyValueSet(key, {
          value,
          expiredTimeAt: localExpiredTimeAt,
          maxAge: localMaxAge
        }).then(() => {
          return resolve(StoreResult.OK);
        }).catch((e) => {
          reject(e);
        });
      }
    });
  }
}
class LocalStorageStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = localStorage.getItem(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          cacheDebugger(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (localStorage.getItem(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = [];
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
__publicField(LocalStorageStore, "driver", "localStorage");
class MemoryStore extends BaseStore {
  constructor(opts) {
    super(opts);
    __publicField(this, "data", /* @__PURE__ */ new Map());
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = this.data.get(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          cacheDebugger(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    this.data.set(this.__getRealKey(key), JSON.stringify(value));
    return Promise.resolve();
  }
  existsKey(key) {
    if (this.data.has(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        this.data.delete(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = Array.from(this.data.keys()).map((key) => key.replace(this.prefix, ""));
    return Promise.resolve(keys);
  }
  clear() {
    this.data.clear();
    return Promise.resolve();
  }
  length() {
    return Promise.resolve(this.data.size);
  }
}
__publicField(MemoryStore, "driver", "memory");
class SessionStorageStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = sessionStorage.getItem(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          cacheDebugger(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      try {
        sessionStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (sessionStorage.getItem(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        sessionStorage.removeItem(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = [];
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
__publicField(SessionStorageStore, "driver", "sessionStorage");
/*! js-cookie v3.0.1 | MIT */
function assign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      target[key] = source[key];
    }
  }
  return target;
}
var defaultConverter = {
  read: function(value) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function(value) {
    return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
  }
};
function init(converter, defaultAttributes) {
  function set(key, value, attributes) {
    if (typeof document === "undefined") {
      return;
    }
    attributes = assign({}, defaultAttributes, attributes);
    if (typeof attributes.expires === "number") {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
    var stringifiedAttributes = "";
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue;
      }
      stringifiedAttributes += "; " + attributeName;
      if (attributes[attributeName] === true) {
        continue;
      }
      stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
    }
    return document.cookie = key + "=" + converter.write(value, key) + stringifiedAttributes;
  }
  function get(key) {
    if (typeof document === "undefined" || arguments.length && !key) {
      return;
    }
    var cookies = document.cookie ? document.cookie.split("; ") : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split("=");
      var value = parts.slice(1).join("=");
      try {
        var foundKey = decodeURIComponent(parts[0]);
        jar[foundKey] = converter.read(value, foundKey);
        if (key === foundKey) {
          break;
        }
      } catch (e) {
      }
    }
    return key ? jar[key] : jar;
  }
  return Object.create({
    set,
    get,
    remove: function(key, attributes) {
      set(key, "", assign({}, attributes, {
        expires: -1
      }));
    },
    withAttributes: function(attributes) {
      return init(this.converter, assign({}, this.attributes, attributes));
    },
    withConverter: function(converter2) {
      return init(assign({}, this.converter, converter2), this.attributes);
    }
  }, {
    attributes: { value: Object.freeze(defaultAttributes) },
    converter: { value: Object.freeze(converter) }
  });
}
var api = init(defaultConverter, { path: "/" });
class CookieStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = api.get(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          cacheDebugger(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      try {
        api.set(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (api.get(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        api.remove(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const cookies = api.get();
    const keys = [];
    for (const key of Object.keys(cookies)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
__publicField(CookieStore, "driver", "cookie");
class IndexedDBStore extends BaseStore {
  constructor(opts) {
    var _a, _b, _c, _d;
    super(opts);
    __publicField(this, "dbName", "perfect-cache");
    __publicField(this, "objectStoreName", "perfect-cache");
    __publicField(this, "dbVersion");
    __publicField(this, "dbConnection");
    if ((_a = this.opts) == null ? void 0 : _a.dbName) {
      this.dbName = this.opts.dbName;
    }
    if ((_b = this.opts) == null ? void 0 : _b.objectStoreName) {
      this.objectStoreName = this.opts.objectStoreName;
    }
    if ((_c = this.opts) == null ? void 0 : _c.dbVersion) {
      this.dbVersion = this.opts.dbVersion;
    }
    if ((_d = this.opts) == null ? void 0 : _d.dbConnection) {
      this.dbConnection = this.opts.dbConnection;
    }
    if (!this.dbConnection) {
      this.init().then(() => {
        this.ready();
      }).catch(() => {
        if (this.dbConnection) {
          this.upgradeToVersion(this.dbConnection.version + 1);
        } else {
          this.upgradeToVersion();
        }
      });
    } else {
      this.dbVersion = this.dbConnection.version;
      this.ready();
    }
  }
  init() {
    return this.connectDB().then(() => {
      return this.initObjectStore();
    });
  }
  upgradeToVersion(newVersion) {
    this.dbVersion = newVersion;
    indexedDBDebugger(`Database ${this.dbName} store ${this.objectStoreName} is upgrading to version ${this.dbVersion}...`);
    this.init().then(() => {
      indexedDBDebugger(`Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} success.`);
      this.ready();
    }).catch((err) => {
      window.console.error(`Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} failed.`, err);
    });
  }
  waitForConnectionReady(callback, { timeout = void 0, interval = 100, readyLog = false } = {}) {
    if (this.isReady && this.dbConnection) {
      if (readyLog) {
        indexedDBDebugger(`Database connection ${this.dbName} store ${this.objectStoreName} is ready.(^v^)`);
      }
      if (callback && typeof callback === "function") {
        callback();
      }
    } else {
      indexedDBDebugger(`Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready...`);
      if (timeout > 0 || timeout === void 0) {
        setTimeout(() => {
          this.waitForConnectionReady(callback, {
            timeout: timeout ? timeout - interval : void 0,
            interval,
            readyLog: true
          });
        }, interval);
      } else {
        if (callback && typeof callback === "function") {
          callback(new Error(`Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready timeout.`));
        }
      }
    }
  }
  connectDB() {
    if (this.dbConnection) {
      this.dbConnection.close();
      this.dbConnection.onversionchange = null;
      this.dbConnection = null;
      this.isReady = false;
    }
    return connectToIndexedDB(this.dbName, this.dbVersion).then((dbConnection) => {
      this.dbConnection = dbConnection;
      this.dbVersion = dbConnection.version;
      dbConnection.onversionchange = (event) => {
        indexedDBDebugger(`The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${event.oldVersion} to ${event.newVersion}`);
        this.upgradeToVersion(event.newVersion);
      };
    });
  }
  initObjectStore() {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        if (!this.dbConnection.objectStoreNames.contains(this.objectStoreName)) {
          indexedDBDebugger(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);
          const objectStore = this.dbConnection.createObjectStore(this.objectStoreName, {
            keyPath: "key"
          });
          objectStore.transaction.oncomplete = (event) => {
            indexedDBDebugger(`ObjectStore ${this.objectStoreName} is created now.`);
            resolve();
          };
        } else {
          resolve();
        }
      } else {
        const error = new Error(`Database ${this.dbName} connection is not initialised.`);
        reject(error);
      }
    });
  }
  keyValueGet(key) {
    return new Promise((resolve, reject) => {
      this.waitForConnectionReady((error) => {
        if (error) {
          reject(error);
        } else {
          const request = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).get(this.__getRealKey(key));
          request.onerror = () => {
            window.console.error("Database get occurs error", request.result);
            reject(request.result);
          };
          request.onsuccess = () => {
            var _a;
            resolve((_a = request.result) == null ? void 0 : _a.value);
          };
        }
      });
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      this.waitForConnectionReady((error) => {
        if (error) {
          reject(error);
        } else {
          const request = this.dbConnection.transaction([this.objectStoreName], "readwrite").objectStore(this.objectStoreName).put({ key: this.__getRealKey(key), value });
          request.onerror = () => {
            window.console.error("Database put occurs error", request.result);
            reject(request.result);
          };
          request.onsuccess = () => {
            var _a;
            resolve((_a = request.result) == null ? void 0 : _a.value);
          };
        }
      });
    });
  }
  existsKey(key) {
    return new Promise((resolve, reject) => {
      this.waitForConnectionReady((error) => {
        if (error) {
          reject(error);
        } else {
          const request = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).count(this.__getRealKey(key));
          request.onerror = () => {
            window.console.error("Database count occurs error", request.result);
            reject(request.result);
          };
          request.onsuccess = () => {
            resolve(!!request.result);
          };
        }
      });
    });
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      this.waitForConnectionReady((error) => {
        if (error) {
          reject(error);
        } else {
          const request = this.dbConnection.transaction([this.objectStoreName], "readwrite").objectStore(this.objectStoreName).delete(this.__getRealKey(key));
          request.onerror = () => {
            window.console.error("Database delete occurs error", request.result);
            reject(request.result);
          };
          request.onsuccess = () => {
            resolve();
          };
        }
      });
    });
  }
  keys() {
    const keys = [];
    return new Promise((resolve, reject) => {
      this.waitForConnectionReady((error) => {
        if (error) {
          reject(error);
        } else {
          const request = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).openCursor();
          request.onerror = () => {
            window.console.error("Database openCursor occurs error", request.result);
            reject(request.result);
          };
          request.onsuccess = (e) => {
            var cursor = e.target.result;
            if (cursor) {
              if (cursor.key.startsWith(this.prefix)) {
                keys.push(cursor.key.replace(this.prefix, ""));
              }
              cursor.continue();
            } else {
              resolve(keys);
            }
          };
        }
      });
    });
  }
}
__publicField(IndexedDBStore, "driver", "indexedDB");
const systemStores = {};
for (const store of [
  MemoryStore,
  LocalStorageStore,
  SessionStorageStore,
  CookieStore,
  IndexedDBStore
]) {
  systemStores[store.driver] = store;
}
const externalStores = {};
const registerStore = (store) => {
  if (store instanceof BaseStore.constructor) {
    if (store.driver && typeof store.driver === "string") {
      externalStores[store.driver] = store;
    } else {
      throw new Error("please input the driver name.");
    }
  } else {
    throw new Error("the store driver class must be subclass of BaseStore.");
  }
};
var browser = { exports: {} };
var s = 1e3;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === "string" && val.length > 0) {
    return parse(val);
  } else if (type === "number" && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
};
function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || "ms").toLowerCase();
  switch (type) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return n * y;
    case "weeks":
    case "week":
    case "w":
      return n * w;
    case "days":
    case "day":
    case "d":
      return n * d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return n * m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
    default:
      return void 0;
  }
}
function fmtShort(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return Math.round(ms2 / d) + "d";
  }
  if (msAbs >= h) {
    return Math.round(ms2 / h) + "h";
  }
  if (msAbs >= m) {
    return Math.round(ms2 / m) + "m";
  }
  if (msAbs >= s) {
    return Math.round(ms2 / s) + "s";
  }
  return ms2 + "ms";
}
function fmtLong(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return plural(ms2, msAbs, d, "day");
  }
  if (msAbs >= h) {
    return plural(ms2, msAbs, h, "hour");
  }
  if (msAbs >= m) {
    return plural(ms2, msAbs, m, "minute");
  }
  if (msAbs >= s) {
    return plural(ms2, msAbs, s, "second");
  }
  return ms2 + " ms";
}
function plural(ms2, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
}
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = ms;
  createDebug.destroy = destroy;
  Object.keys(env).forEach((key) => {
    createDebug[key] = env[key];
  });
  createDebug.names = [];
  createDebug.skips = [];
  createDebug.formatters = {};
  function selectColor(namespace) {
    let hash = 0;
    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0;
    }
    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }
  createDebug.selectColor = selectColor;
  function createDebug(namespace) {
    let prevTime;
    let enableOverride = null;
    let namespacesCache;
    let enabledCache;
    function debug2(...args) {
      if (!debug2.enabled) {
        return;
      }
      const self = debug2;
      const curr = Number(new Date());
      const ms2 = curr - (prevTime || curr);
      self.diff = ms2;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);
      if (typeof args[0] !== "string") {
        args.unshift("%O");
      }
      let index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        if (match === "%%") {
          return "%";
        }
        index++;
        const formatter = createDebug.formatters[format];
        if (typeof formatter === "function") {
          const val = args[index];
          match = formatter.call(self, val);
          args.splice(index, 1);
          index--;
        }
        return match;
      });
      createDebug.formatArgs.call(self, args);
      const logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }
    debug2.namespace = namespace;
    debug2.useColors = createDebug.useColors();
    debug2.color = createDebug.selectColor(namespace);
    debug2.extend = extend;
    debug2.destroy = createDebug.destroy;
    Object.defineProperty(debug2, "enabled", {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride;
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces;
          enabledCache = createDebug.enabled(namespace);
        }
        return enabledCache;
      },
      set: (v) => {
        enableOverride = v;
      }
    });
    if (typeof createDebug.init === "function") {
      createDebug.init(debug2);
    }
    return debug2;
  }
  function extend(namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }
  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.namespaces = namespaces;
    createDebug.names = [];
    createDebug.skips = [];
    let i;
    const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
    const len = split.length;
    for (i = 0; i < len; i++) {
      if (!split[i]) {
        continue;
      }
      namespaces = split[i].replace(/\*/g, ".*?");
      if (namespaces[0] === "-") {
        createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
      } else {
        createDebug.names.push(new RegExp("^" + namespaces + "$"));
      }
    }
  }
  function disable() {
    const namespaces = [
      ...createDebug.names.map(toNamespace),
      ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
    ].join(",");
    createDebug.enable("");
    return namespaces;
  }
  function enabled(name) {
    if (name[name.length - 1] === "*") {
      return true;
    }
    let i;
    let len;
    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }
  function toNamespace(regexp) {
    return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
  }
  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }
    return val;
  }
  function destroy() {
    console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }
  createDebug.enable(createDebug.load());
  return createDebug;
}
var common = setup;
(function(module, exports) {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {
  });
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = {}.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  module.exports = common(exports);
  const { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
})(browser, browser.exports);
var debug = browser.exports;
const cacheDebugger = debug("perfect-cache");
const indexedDBDebugger = cacheDebugger.extend("indexedDB");
const getSupportedDriverList = () => {
  let supportedDriverList = ["memory"];
  if ((window == null ? void 0 : window.localStorage) && systemStores.localStorage) {
    supportedDriverList.push("localStorage");
  }
  if ((window == null ? void 0 : window.sessionStorage) && systemStores.sessionStorage) {
    supportedDriverList.push("sessionStorage");
  }
  if ((window == null ? void 0 : window.document) && "cookie" in (window == null ? void 0 : window.document) && systemStores.cookie) {
    supportedDriverList.push("cookie");
  }
  if ((window == null ? void 0 : window.indexedDB) && systemStores.indexedDB) {
    supportedDriverList.push("indexedDB");
  }
  supportedDriverList = supportedDriverList.concat(Object.keys(externalStores));
  return supportedDriverList;
};
const getStoreClass = (driver) => {
  return systemStores[driver] || externalStores[driver];
};
const connectToIndexedDB = (dbName, dbVersion) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, dbVersion);
    request.onerror = (e) => {
      window.console.error(`Database ${dbName} version ${dbVersion} initialised error.`, e);
      reject(e);
    };
    request.onsuccess = () => {
      const dbConnection = request.result;
      const dbVersion2 = dbConnection.version;
      indexedDBDebugger(`Database ${dbName} version ${dbVersion2} initialised success.`);
      resolve(dbConnection);
    };
    request.onupgradeneeded = (event) => {
      const dbConnection = event.target.result;
      indexedDBDebugger(`Database ${dbName} upgrade needed as oldVersion is ${event.oldVersion} and newVersion is ${event.newVersion}.`);
      resolve(dbConnection);
    };
  });
};
class PerfectCache extends EventListener {
  constructor(driver, opts) {
    super();
    __publicField(this, "opts");
    __publicField(this, "__init", false);
    __publicField(this, "driver");
    __publicField(this, "store");
    __publicField(this, "keyFallbacks", []);
    __publicField(this, "keyRegexFallbacks", []);
    const supportedDriverList = getSupportedDriverList();
    if (!driver && !opts) {
      opts = __spreadValues({}, defaultOpts);
    } else {
      if (driver) {
        if (supportedDriverList.includes(driver)) {
          if (Object.prototype.toString.call(opts) === "[object Object]") {
            opts = __spreadValues(__spreadProps(__spreadValues({}, defaultOpts), { driver }), opts);
          } else {
            opts = __spreadProps(__spreadValues({}, defaultOpts), { driver });
          }
        } else {
          if (Object.prototype.toString.call(driver) === "[object Object]" && supportedDriverList.includes(driver.driver)) {
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
    } else {
      throw new Error("please input the driver as first param.");
    }
  }
  initDriver() {
    const supportedDriverList = getSupportedDriverList();
    if (this.opts && this.opts.driver && supportedDriverList.includes(this.opts.driver)) {
      this.__init = false;
      const StoreClass = getStoreClass(this.opts.driver);
      this.store = new StoreClass(this.opts);
      this.store.$on("ready", () => {
        this.__init = true;
        this.driver = this.opts.driver;
        this.$emit("ready");
      });
      this.store.$on("cacheExpired", (key) => {
        this.$emit("cacheExpired", key);
      });
    }
  }
  setDriver(driver) {
    this.opts.driver = driver;
    this.initDriver();
  }
  existsKey() {
    return this.store.existsKey.apply(this.store, arguments);
  }
  getItem(key, opts = {}) {
    const { defaultVal, withFallback = true, refreshCache = true } = opts;
    return new Promise(async (resolve, reject) => {
      const result = await this.store.getItem(key);
      const isResultInvalid = result === void 0 || result === null || result === "";
      if (isResultInvalid && withFallback) {
        const res = this.__getFallbackByKey(key);
        if (res) {
          const fallbackResult = await res.fallback(key);
          const isFallbackResultInvalid = fallbackResult === void 0 || fallbackResult === null || fallbackResult === "";
          if (refreshCache && !isFallbackResultInvalid) {
            await this.store.setItem(key, fallbackResult, {
              expiredTime: res.expiredTime,
              maxAge: res.maxAge
            });
          }
          resolve(isFallbackResultInvalid && defaultVal !== void 0 ? defaultVal : fallbackResult);
        } else {
          resolve(defaultVal === void 0 ? result : defaultVal);
        }
      } else {
        resolve(isResultInvalid && defaultVal !== void 0 ? defaultVal : result);
      }
    });
  }
  setItem() {
    return this.store.setItem.apply(this.store, arguments);
  }
  removeItem() {
    return this.store.removeItem.apply(this.store, arguments);
  }
  clear() {
    return this.store.clear.apply(this.store, arguments);
  }
  keys() {
    return this.store.keys.apply(this.store, arguments);
  }
  length() {
    return this.store.length.apply(this.store, arguments);
  }
  fallbackKey(key, fallback, options = {}) {
    const { expiredTime, maxAge } = options;
    if (typeof key === "string") {
      if (fallback instanceof Function) {
        return this.keyFallbacks.push({ key, expiredTime, maxAge, fallback });
      } else {
        throw new Error("please input the fallback as type [Function]");
      }
    }
    if (key instanceof RegExp) {
      if (fallback instanceof Function) {
        return this.keyRegexFallbacks.push({
          regex: key,
          expiredTime,
          maxAge,
          fallback
        });
      } else {
        throw new Error("please input the fallback as type [Function]");
      }
    }
  }
  __getFallbackByKey(key) {
    let res = this.keyFallbacks.find((obj) => {
      return obj.key === key;
    });
    if (res) {
      return res;
    } else {
      res = this.keyRegexFallbacks.find((obj) => {
        return obj.regex.test(key);
      });
      return res;
    }
  }
}
export { BaseStore, EventListener, PerfectCache, StoreResult, cacheDebugger, connectToIndexedDB, getSupportedDriverList, indexedDBDebugger, registerStore };
