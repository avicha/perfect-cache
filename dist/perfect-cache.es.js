var Y = Object.defineProperty;
var Z = (o, s, e) => s in o ? Y(o, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[s] = e;
var p = (o, s, e) => Z(o, typeof s != "symbol" ? s + "" : s, e);
const E = {
  driver: "memory",
  prefix: "cache:"
};
function H(o) {
  return { all: o = o || /* @__PURE__ */ new Map(), on: function(s, e) {
    var t = o.get(s);
    t ? t.push(e) : o.set(s, [e]);
  }, off: function(s, e) {
    var t = o.get(s);
    t && (e ? t.splice(t.indexOf(e) >>> 0, 1) : o.set(s, []));
  }, emit: function(s, e) {
    var t = o.get(s);
    t && t.slice().map(function(r) {
      r(e);
    }), (t = o.get("*")) && t.slice().map(function(r) {
      r(s, e);
    });
  } };
}
class B {
  constructor() {
    p(this, "mitt");
    this.mitt = H();
  }
  $on(s, e) {
    return this.mitt.on(s, e);
  }
  $off(s, e) {
    return this.mitt.off(s, e);
  }
  $emit(s, e) {
    return this.mitt.emit(s, e);
  }
}
const k = {
  OK: Symbol("OK"),
  KEY_NOT_EXISTS: Symbol("KEY_NOT_EXISTS"),
  KEY_EXPIRED: Symbol("KEY_EXPIRED"),
  JSON_PARSE_ERROR: Symbol("JSON_PARSE_ERROR"),
  NX_SET_NOT_PERFORMED: Symbol("NX_SET_NOT_PERFORMED"),
  XX_SET_NOT_PERFORMED: Symbol("XX_SET_NOT_PERFORMED")
};
class F extends B {
  constructor(e) {
    super();
    p(this, "opts");
    p(this, "isReady", !1);
    p(this, "prefix", "cache:");
    this.opts = e, this.opts.prefix && (this.prefix = this.opts.prefix), this.isReady = !1;
  }
  __getRealKey(e) {
    return `${this.prefix}${e}`;
  }
  ready(e) {
    setTimeout(() => {
      this.isReady = !0, this.$emit("ready"), e && typeof e == "function" && e();
    }, 0);
  }
  async clear() {
    const e = await this.keys();
    for (const t of e)
      await this.removeItem(t);
    return Promise.resolve(e.length);
  }
  length() {
    return new Promise((e, t) => {
      this.keys().then((r) => {
        e(r.length);
      }).catch((r) => {
        t(r);
      });
    });
  }
  getItem(e) {
    return new Promise((t, r) => {
      this.keyValueGet(e).then((n) => {
        n ? n.expiredTimeAt ? n.expiredTimeAt > Date.now() ? n.maxAge ? (n.expiredTimeAt = Date.now() + n.maxAge, this.keyValueSet(e, n).then(() => t(n.value)).catch((i) => {
          r(i);
        })) : t(n.value) : (this.$emit("cacheExpired", e), t(void 0)) : t(n.value) : t(void 0);
      }).catch((n) => {
        r(n);
      });
    });
  }
  setItem(e, t, r = {}) {
    const {
      // seconds -- Set the specified expire time, in milliseconds.
      expiredTime: n,
      // timestamp-seconds -- Set the specified Unix time at which the key will expire, in milliseconds.
      expiredTimeAt: i,
      // exists max age, in milliseconds.
      maxAge: d,
      // Only set the key if it does not already exist.
      setOnlyNotExist: l = !1,
      // Only set the key if it already exist.
      setOnlyExist: m = !1
    } = r;
    let c, a;
    return n && typeof n == "number" && n > 0 && (c = Date.now() + n), i && typeof i == "number" && i > 0 && (c = i), c ? c = Math.max(c, Date.now()) : d && typeof d == "number" && d > 0 && (c = Date.now() + d, a = d), new Promise((u, h) => {
      l || m ? this.existsKey(e).then((f) => {
        if (l && f)
          return u(k.NX_SET_NOT_PERFORMED);
        if (m && !f)
          return u(k.XX_SET_NOT_PERFORMED);
        this.keyValueSet(e, {
          value: t,
          expiredTimeAt: c,
          maxAge: a
        }).then(() => u(k.OK)).catch((b) => {
          h(b);
        });
      }).catch((f) => {
        h(f);
      }) : this.keyValueSet(e, {
        value: t,
        expiredTimeAt: c,
        maxAge: a
      }).then(() => u(k.OK)).catch((f) => {
        h(f);
      });
    });
  }
}
p(F, "driver");
class L extends F {
  constructor(s) {
    super(s), this.ready();
  }
  keyValueGet(s) {
    const e = localStorage.getItem(this.__getRealKey(s));
    if (e)
      try {
        const t = JSON.parse(e);
        return Promise.resolve(t);
      } catch {
        return w(`get key ${s} json parse error`, e), Promise.resolve(void 0);
      }
    else
      return Promise.resolve(void 0);
  }
  keyValueSet(s, e) {
    try {
      return localStorage.setItem(this.__getRealKey(s), JSON.stringify(e)), Promise.resolve();
    } catch (t) {
      return w(`set key ${s} json stringify error`, t), Promise.reject(t);
    }
  }
  existsKey(s) {
    return localStorage.getItem(this.__getRealKey(s)) ? Promise.resolve(!0) : Promise.resolve(!1);
  }
  removeItem(s) {
    return localStorage.removeItem(this.__getRealKey(s)), Promise.resolve();
  }
  keys() {
    const s = [];
    for (const e of Object.keys(localStorage))
      e.startsWith(this.prefix) && s.push(e.replace(this.prefix, ""));
    return Promise.resolve(s);
  }
}
p(L, "driver", "localStorage");
class J extends F {
  constructor(e) {
    super(e);
    p(this, "data", /* @__PURE__ */ new Map());
    this.ready();
  }
  keyValueGet(e) {
    const t = this.data.get(this.__getRealKey(e));
    if (t)
      try {
        const r = JSON.parse(t);
        return Promise.resolve(r);
      } catch {
        return w(`get key ${e} json parse error`, t), Promise.resolve(void 0);
      }
    else
      return Promise.resolve(void 0);
  }
  keyValueSet(e, t) {
    try {
      return this.data.set(this.__getRealKey(e), JSON.stringify(t)), Promise.resolve();
    } catch (r) {
      return w(`set key ${e} json stringify error`, r), Promise.reject(r);
    }
  }
  existsKey(e) {
    return this.data.has(this.__getRealKey(e)) ? Promise.resolve(!0) : Promise.resolve(!1);
  }
  removeItem(e) {
    return this.data.delete(this.__getRealKey(e)), Promise.resolve();
  }
  keys() {
    const e = Array.from(this.data.keys()).map((t) => t.replace(this.prefix, ""));
    return Promise.resolve(e);
  }
  clear() {
    const e = this.data.size;
    return this.data.clear(), Promise.resolve(e);
  }
  length() {
    return Promise.resolve(this.data.size);
  }
}
p(J, "driver", "memory");
class X extends F {
  constructor(s) {
    super(s), this.ready();
  }
  keyValueGet(s) {
    const e = sessionStorage.getItem(this.__getRealKey(s));
    return new Promise((t) => {
      if (e)
        try {
          const r = JSON.parse(e);
          t(r);
        } catch {
          w(`get key ${s} json parse error`, e), t(void 0);
        }
      else
        t(void 0);
    });
  }
  keyValueSet(s, e) {
    return new Promise((t, r) => {
      try {
        sessionStorage.setItem(this.__getRealKey(s), JSON.stringify(e)), t();
      } catch (n) {
        w(`set key ${s} json stringify error`, n), r(n);
      }
    });
  }
  existsKey(s) {
    return sessionStorage.getItem(this.__getRealKey(s)) ? Promise.resolve(!0) : Promise.resolve(!1);
  }
  removeItem(s) {
    return sessionStorage.removeItem(this.__getRealKey(s)), Promise.resolve();
  }
  keys() {
    const s = [];
    for (const e of Object.keys(sessionStorage))
      e.startsWith(this.prefix) && s.push(e.replace(this.prefix, ""));
    return Promise.resolve(s);
  }
}
p(X, "driver", "sessionStorage");
/*! js-cookie v3.0.5 | MIT */
function N(o) {
  for (var s = 1; s < arguments.length; s++) {
    var e = arguments[s];
    for (var t in e)
      o[t] = e[t];
  }
  return o;
}
var Q = {
  read: function(o) {
    return o[0] === '"' && (o = o.slice(1, -1)), o.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function(o) {
    return encodeURIComponent(o).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    );
  }
};
function $(o, s) {
  function e(r, n, i) {
    if (!(typeof document > "u")) {
      i = N({}, s, i), typeof i.expires == "number" && (i.expires = new Date(Date.now() + i.expires * 864e5)), i.expires && (i.expires = i.expires.toUTCString()), r = encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var d = "";
      for (var l in i)
        i[l] && (d += "; " + l, i[l] !== !0 && (d += "=" + i[l].split(";")[0]));
      return document.cookie = r + "=" + o.write(n, r) + d;
    }
  }
  function t(r) {
    if (!(typeof document > "u" || arguments.length && !r)) {
      for (var n = document.cookie ? document.cookie.split("; ") : [], i = {}, d = 0; d < n.length; d++) {
        var l = n[d].split("="), m = l.slice(1).join("=");
        try {
          var c = decodeURIComponent(l[0]);
          if (i[c] = o.read(m, c), r === c)
            break;
        } catch {
        }
      }
      return r ? i[r] : i;
    }
  }
  return Object.create(
    {
      set: e,
      get: t,
      remove: function(r, n) {
        e(
          r,
          "",
          N({}, n, {
            expires: -1
          })
        );
      },
      withAttributes: function(r) {
        return $(this.converter, N({}, this.attributes, r));
      },
      withConverter: function(r) {
        return $(N({}, this.converter, r), this.attributes);
      }
    },
    {
      attributes: { value: Object.freeze(s) },
      converter: { value: Object.freeze(o) }
    }
  );
}
var x = $(Q, { path: "/" });
class q extends F {
  constructor(s) {
    super(s), this.ready();
  }
  keyValueGet(s) {
    const e = x.get(this.__getRealKey(s));
    return new Promise((t) => {
      if (e)
        try {
          const r = JSON.parse(e);
          t(r);
        } catch {
          w(`get key ${s} json parse error`, e), t(void 0);
        }
      else
        t(void 0);
    });
  }
  keyValueSet(s, e) {
    return new Promise((t, r) => {
      try {
        x.set(this.__getRealKey(s), JSON.stringify(e)), t();
      } catch (n) {
        r(n);
      }
    });
  }
  existsKey(s) {
    return x.get(this.__getRealKey(s)) ? Promise.resolve(!0) : Promise.resolve(!1);
  }
  removeItem(s) {
    return new Promise((e, t) => {
      try {
        x.remove(this.__getRealKey(s)), e();
      } catch (r) {
        t(r);
      }
    });
  }
  keys() {
    const s = x.get(), e = [];
    for (const t of Object.keys(s))
      t.startsWith(this.prefix) && e.push(t.replace(this.prefix, ""));
    return Promise.resolve(e);
  }
}
p(q, "driver", "cookie");
class z extends F {
  constructor(e) {
    var t, r, n, i;
    super(e);
    p(this, "dbName", "perfect-cache");
    p(this, "objectStoreName", "perfect-cache");
    p(this, "dbVersion");
    p(this, "dbConnection");
    (t = this.opts) != null && t.dbName && (this.dbName = this.opts.dbName), (r = this.opts) != null && r.objectStoreName && (this.objectStoreName = this.opts.objectStoreName), (n = this.opts) != null && n.dbVersion && (this.dbVersion = this.opts.dbVersion), (i = this.opts) != null && i.dbConnection && (this.dbConnection = this.opts.dbConnection), this.dbConnection ? (this.dbVersion = this.dbConnection.version, this.ready()) : this.connectToVersion(this.dbVersion);
  }
  init() {
    return this.connectDB().then(() => this.initObjectStore());
  }
  connectToVersion(e) {
    this.dbVersion = e, C(
      `Database ${this.dbName} is connecting to version ${this.dbVersion || "latest"} and store ${this.objectStoreName} will be created if not exists.`
    ), this.init().then(() => {
      C(
        `Database ${this.dbName} is connected to ${this.dbVersion} success and store ${this.objectStoreName} is ready.`
      ), this.ready();
    }).catch((t) => {
      this.dbConnection ? (window.console.error(
        `Database ${this.dbName} is connected to ${this.dbConnection.version} success but store ${this.objectStoreName} init failed because of the outdated version. now reconnect to the next version ${this.dbConnection.version + 1}`,
        t
      ), this.connectToVersion(this.dbConnection.version + 1)) : (window.console.error(
        `Database ${this.dbName} is connected to ${this.dbVersion || "latest"} failed and store ${this.objectStoreName} is not ready because of the outdated version. now reconnect to the latest version`,
        t
      ), this.connectToVersion());
    });
  }
  waitForConnectionReady(e, t = {}) {
    const { timeout: r, interval: n = 100, readyLog: i = !1 } = t;
    this.isReady && this.dbConnection ? (i && C(
      `Database connection ${this.dbName} is connected and store ${this.objectStoreName} is ready.(^v^)`
    ), e && typeof e == "function" && e()) : (C(
      `Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready...`
    ), r && r > 0 || r === void 0 ? window.setTimeout(() => {
      this.waitForConnectionReady(e, {
        timeout: r ? r - n : void 0,
        interval: n,
        readyLog: !0
      });
    }, n) : e && typeof e == "function" && e(
      new Error(
        `Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready timeout.`
      )
    ));
  }
  connectDB() {
    return this.dbConnection && (this.dbConnection.close(), this.dbConnection.onversionchange = null, this.dbConnection = void 0, this.isReady = !1), ae(this.dbName, this.dbVersion).then((e) => {
      this.dbConnection = e, this.dbVersion = e.version, e.onversionchange = (t) => {
        C(
          `The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${t.oldVersion} to ${t.newVersion}`
        ), this.connectToVersion(t.newVersion || void 0);
      };
    });
  }
  initObjectStore() {
    return new Promise((e, t) => {
      if (this.dbConnection)
        if (this.dbConnection.objectStoreNames.contains(this.objectStoreName))
          e(void 0);
        else {
          C(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);
          const r = this.dbConnection.createObjectStore(this.objectStoreName, {
            keyPath: "key"
          });
          r.transaction.oncomplete = (n) => {
            C(`ObjectStore ${this.objectStoreName} is created now.`), e(r);
          };
        }
      else {
        const r = new Error(`Database ${this.dbName} connection is not initialised.`);
        t(r);
      }
    });
  }
  keyValueGet(e) {
    return new Promise((t, r) => {
      this.waitForConnectionReady((n) => {
        if (n)
          r(n);
        else {
          const i = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).get(this.__getRealKey(e));
          i.onerror = () => {
            window.console.error("Database get occurs error", i.result), r(i.result);
          }, i.onsuccess = () => {
            var d;
            t((d = i.result) == null ? void 0 : d.value);
          };
        }
      });
    });
  }
  keyValueSet(e, t) {
    return new Promise((r, n) => {
      this.waitForConnectionReady((i) => {
        if (i)
          n(i);
        else {
          const d = this.dbConnection.transaction([this.objectStoreName], "readwrite").objectStore(this.objectStoreName).put({ key: this.__getRealKey(e), value: t });
          d.onerror = () => {
            window.console.error("Database put occurs error", d.result), n(d.result);
          }, d.onsuccess = () => {
            r();
          };
        }
      });
    });
  }
  existsKey(e) {
    return new Promise((t, r) => {
      this.waitForConnectionReady((n) => {
        if (n)
          r(n);
        else {
          const i = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).count(this.__getRealKey(e));
          i.onerror = () => {
            window.console.error("Database count occurs error", i.result), r(i.result);
          }, i.onsuccess = () => {
            t(!!i.result);
          };
        }
      });
    });
  }
  removeItem(e) {
    return new Promise((t, r) => {
      this.waitForConnectionReady((n) => {
        if (n)
          r(n);
        else {
          const i = this.dbConnection.transaction([this.objectStoreName], "readwrite").objectStore(this.objectStoreName).delete(this.__getRealKey(e));
          i.onerror = () => {
            window.console.error("Database delete occurs error", i.result), r(i.result);
          }, i.onsuccess = () => {
            t();
          };
        }
      });
    });
  }
  keys() {
    const e = [];
    return new Promise((t, r) => {
      this.waitForConnectionReady((n) => {
        if (n)
          r(n);
        else {
          const i = this.dbConnection.transaction([this.objectStoreName], "readonly").objectStore(this.objectStoreName).openCursor();
          i.onerror = () => {
            window.console.error("Database openCursor occurs error", i.result), r(i.result);
          }, i.onsuccess = (d) => {
            const l = i.result;
            l ? (l.key.startsWith(this.prefix) && e.push(l.key.replace(this.prefix, "")), l.continue()) : t(e);
          };
        }
      });
    });
  }
}
p(z, "driver", "indexedDB");
const S = {};
for (const o of [J, L, X, q, z])
  Object.assign(S, { [o.driver]: o });
const P = {};
function le(o) {
  if (o.driver && typeof o.driver == "string")
    P[o.driver] = o;
  else
    throw new Error("please input the driver name.");
  if (o instanceof F.constructor)
    if (o.driver && typeof o.driver == "string")
      P[o.driver] = o;
    else
      throw new Error("please input the driver name.");
  else
    throw new Error("the store driver class must be subclass of BaseStore.");
}
function ee(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var j = { exports: {} }, O, K;
function te() {
  if (K) return O;
  K = 1;
  var o = 1e3, s = o * 60, e = s * 60, t = e * 24, r = t * 7, n = t * 365.25;
  O = function(c, a) {
    a = a || {};
    var u = typeof c;
    if (u === "string" && c.length > 0)
      return i(c);
    if (u === "number" && isFinite(c))
      return a.long ? l(c) : d(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function i(c) {
    if (c = String(c), !(c.length > 100)) {
      var a = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (a) {
        var u = parseFloat(a[1]), h = (a[2] || "ms").toLowerCase();
        switch (h) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return u * n;
          case "weeks":
          case "week":
          case "w":
            return u * r;
          case "days":
          case "day":
          case "d":
            return u * t;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return u * e;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return u * s;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return u * o;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return u;
          default:
            return;
        }
      }
    }
  }
  function d(c) {
    var a = Math.abs(c);
    return a >= t ? Math.round(c / t) + "d" : a >= e ? Math.round(c / e) + "h" : a >= s ? Math.round(c / s) + "m" : a >= o ? Math.round(c / o) + "s" : c + "ms";
  }
  function l(c) {
    var a = Math.abs(c);
    return a >= t ? m(c, a, t, "day") : a >= e ? m(c, a, e, "hour") : a >= s ? m(c, a, s, "minute") : a >= o ? m(c, a, o, "second") : c + " ms";
  }
  function m(c, a, u, h) {
    var f = a >= u * 1.5;
    return Math.round(c / u) + " " + h + (f ? "s" : "");
  }
  return O;
}
var I, T;
function re() {
  if (T) return I;
  T = 1;
  function o(s) {
    t.debug = t, t.default = t, t.coerce = m, t.disable = d, t.enable = n, t.enabled = l, t.humanize = te(), t.destroy = c, Object.keys(s).forEach((a) => {
      t[a] = s[a];
    }), t.names = [], t.skips = [], t.formatters = {};
    function e(a) {
      let u = 0;
      for (let h = 0; h < a.length; h++)
        u = (u << 5) - u + a.charCodeAt(h), u |= 0;
      return t.colors[Math.abs(u) % t.colors.length];
    }
    t.selectColor = e;
    function t(a) {
      let u, h = null, f, b;
      function y(...g) {
        if (!y.enabled)
          return;
        const v = y, _ = Number(/* @__PURE__ */ new Date()), U = _ - (u || _);
        v.diff = U, v.prev = u, v.curr = _, u = _, g[0] = t.coerce(g[0]), typeof g[0] != "string" && g.unshift("%O");
        let R = 0;
        g[0] = g[0].replace(/%([a-zA-Z%])/g, (D, G) => {
          if (D === "%%")
            return "%";
          R++;
          const A = t.formatters[G];
          if (typeof A == "function") {
            const W = g[R];
            D = A.call(v, W), g.splice(R, 1), R--;
          }
          return D;
        }), t.formatArgs.call(v, g), (v.log || t.log).apply(v, g);
      }
      return y.namespace = a, y.useColors = t.useColors(), y.color = t.selectColor(a), y.extend = r, y.destroy = t.destroy, Object.defineProperty(y, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => h !== null ? h : (f !== t.namespaces && (f = t.namespaces, b = t.enabled(a)), b),
        set: (g) => {
          h = g;
        }
      }), typeof t.init == "function" && t.init(y), y;
    }
    function r(a, u) {
      const h = t(this.namespace + (typeof u > "u" ? ":" : u) + a);
      return h.log = this.log, h;
    }
    function n(a) {
      t.save(a), t.namespaces = a, t.names = [], t.skips = [];
      const u = (typeof a == "string" ? a : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const h of u)
        h[0] === "-" ? t.skips.push(h.slice(1)) : t.names.push(h);
    }
    function i(a, u) {
      let h = 0, f = 0, b = -1, y = 0;
      for (; h < a.length; )
        if (f < u.length && (u[f] === a[h] || u[f] === "*"))
          u[f] === "*" ? (b = f, y = h, f++) : (h++, f++);
        else if (b !== -1)
          f = b + 1, y++, h = y;
        else
          return !1;
      for (; f < u.length && u[f] === "*"; )
        f++;
      return f === u.length;
    }
    function d() {
      const a = [
        ...t.names,
        ...t.skips.map((u) => "-" + u)
      ].join(",");
      return t.enable(""), a;
    }
    function l(a) {
      for (const u of t.skips)
        if (i(a, u))
          return !1;
      for (const u of t.names)
        if (i(a, u))
          return !0;
      return !1;
    }
    function m(a) {
      return a instanceof Error ? a.stack || a.message : a;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return t.enable(t.load()), t;
  }
  return I = o, I;
}
var V;
function se() {
  return V || (V = 1, function(o, s) {
    s.formatArgs = t, s.save = r, s.load = n, s.useColors = e, s.storage = i(), s.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), s.colors = [
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
    function e() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function t(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + o.exports.humanize(this.diff), !this.useColors)
        return;
      const m = "color: " + this.color;
      l.splice(1, 0, m, "color: inherit");
      let c = 0, a = 0;
      l[0].replace(/%[a-zA-Z%]/g, (u) => {
        u !== "%%" && (c++, u === "%c" && (a = c));
      }), l.splice(a, 0, m);
    }
    s.log = console.debug || console.log || (() => {
    });
    function r(l) {
      try {
        l ? s.storage.setItem("debug", l) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function n() {
      let l;
      try {
        l = s.storage.getItem("debug");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function i() {
      try {
        return localStorage;
      } catch {
      }
    }
    o.exports = re()(s);
    const { formatters: d } = o.exports;
    d.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (m) {
        return "[UnexpectedJSONParseError]: " + m.message;
      }
    };
  }(j, j.exports)), j.exports;
}
var oe = se();
const ne = /* @__PURE__ */ ee(oe), w = ne("perfect-cache"), C = w.extend("indexedDB"), M = () => {
  let o = ["memory"];
  return typeof window < "u" && (window != null && window.localStorage) && S.localStorage && o.push("localStorage"), typeof window < "u" && (window != null && window.sessionStorage) && S.sessionStorage && o.push("sessionStorage"), typeof window < "u" && (window != null && window.document) && "cookie" in window.document && S.cookie && o.push("cookie"), typeof window < "u" && (window != null && window.indexedDB) && S.indexedDB && o.push("indexedDB"), o = o.concat(Object.keys(P)), o;
}, ie = (o) => o in S ? S[o] : P[o], ae = (o, s) => new Promise((e, t) => {
  const r = window.indexedDB.open(o, s);
  r.onerror = (n) => {
    console.error(`Database ${o} version ${s || "latest"} initialised error.`, n), t(n);
  }, r.onsuccess = () => {
    const n = r.result, i = n.version;
    C(`Database ${o} version ${i} initialised success.`), e(n);
  }, r.onupgradeneeded = (n) => {
    const i = r.result;
    C(
      `Database ${o} upgrade needed as oldVersion is ${n.oldVersion} and newVersion is ${n.newVersion}.`
    ), e(i);
  };
});
class de extends B {
  constructor(e, t) {
    super();
    // cache options
    p(this, "opts");
    // driver is init
    p(this, "__init", !1);
    // the driver string
    p(this, "driver");
    // the store object
    p(this, "store");
    // the extra key and fallback config
    p(this, "keyFallbacks", []);
    // the key pattern and fallback config
    p(this, "keyRegexFallbacks", []);
    const r = M();
    let n;
    if (!e && !t)
      n = { ...E };
    else if (e)
      if (typeof e == "string" && r.includes(e))
        Object.prototype.toString.call(t) === "[object Object]" ? n = { ...E, driver: e, ...t } : n = { ...E, driver: e };
      else if (typeof e != "string" && Object.prototype.toString.call(e) === "[object Object]" && r.includes(e.driver))
        n = { ...E, ...e };
      else
        throw new Error(
          "please input the correct driver param as the first param or in the opts params."
        );
    else
      throw new Error("please input the driver as first param.");
    if (n && n.driver)
      this.opts = n, this.initDriver();
    else
      throw new Error("please input the driver as first param.");
  }
  /**
   * init the driver
   */
  initDriver() {
    const e = M();
    if (this.opts && this.opts.driver && e.includes(this.opts.driver)) {
      this.__init = !1;
      const t = ie(this.opts.driver);
      this.store = new t(this.opts), this.store.$on("ready", () => {
        this.__init = !0, this.driver = this.opts.driver, this.$emit("ready");
      }), this.store.$on("cacheExpired", (r) => {
        this.$emit("cacheExpired", r);
      });
    }
  }
  /**
   *
   * @param {String} driver the driver string
   */
  setDriver(e) {
    this.opts.driver = e, this.initDriver();
  }
  /**
   * @param {String} key the cache key
   * @returns {Boolean}  is the key exists
   */
  existsKey(...e) {
    return this.store.existsKey(...e);
  }
  /**
   *
   * @param {String} key the cache key
   * @param {Object} opts the options
   * @param {Object} opts.defaultVal default value if not get it
   * @param {Boolean} opts.withFallback if use fallback when does not get the cache value
   * @param {Boolean} opts.refreshCache if refresh the cache result when use the fallback
   * @returns
   */
  async getItem(e, t = {}) {
    const { defaultVal: r, withFallback: n = !0, refreshCache: i = !0 } = t, d = await this.store.getItem(e), l = d == null || d === "";
    if (l && n) {
      const m = this.__getFallbackByKey(e);
      if (m) {
        const c = await m.fallback(e), a = c == null || c === "";
        return i && !a && await this.store.setItem(e, c, {
          expiredTime: m.expiredTime,
          maxAge: m.maxAge
        }), a && r !== void 0 ? r : c;
      } else
        return r === void 0 ? d : r;
    } else
      return l && r !== void 0 ? r : d;
  }
  /**
   * @param {String} key the cache key
   * @param {Object} value the cache value
   * @param {Object} options the cache options
   * @returns {StoreResult}
   */
  setItem(...e) {
    return this.store.setItem(...e);
  }
  /**
   * @param {String} key the cache key
   * @returns {Null}
   */
  removeItem(...e) {
    return this.store.removeItem(...e);
  }
  /**
   * @returns {Null}
   */
  clear() {
    return this.store.clear();
  }
  /**
   * @returns {Array} the cache keys
   */
  keys() {
    return this.store.keys();
  }
  /**
   * @returns {Number} the cache keys count
   */
  length() {
    return this.store.length();
  }
  /**
   * @returns {Array} the cache values
   */
  async getItemList(e, t) {
    let r = [];
    const n = {};
    Array.isArray(e) ? r = e : e instanceof RegExp ? r = (await this.keys()).filter((i) => e.test(i)) : r = [];
    for (const i of r) {
      const d = await this.getItem(i, t);
      n[i] = d;
    }
    return n;
  }
  /**
   * @returns {Null}
   */
  async removeItemList(e) {
    let t = [];
    Array.isArray(e) ? t = e : e instanceof RegExp ? t = (await this.keys()).filter((r) => e.test(r)) : t = [];
    for (const r of t)
      await this.removeItem(r);
  }
  /**
   *
   * @param {String/Regex} key the extra key or the key pattern
   * @param {Function} fallback the fallback function when the key is not exists
   * @param {Object} options the setItem operation options when the cache is updated
   * @returns
   */
  fallbackKey(e, t, r = {}) {
    const { expiredTime: n, maxAge: i } = r;
    if (typeof e == "string") {
      if (t instanceof Function)
        return this.keyFallbacks.push({ key: e, expiredTime: n, maxAge: i, fallback: t });
      throw new Error("please input the fallback as type [Function]");
    }
    if (e instanceof RegExp) {
      if (t instanceof Function)
        return this.keyRegexFallbacks.push({
          regex: e,
          expiredTime: n,
          maxAge: i,
          fallback: t
        });
      throw new Error("please input the fallback as type [Function]");
    }
  }
  /**
   *
   * @param {String} key the cache key
   * @returns {Object} the fallback config object if exists, undefined otherwise.
   */
  __getFallbackByKey(e) {
    let t;
    return t = this.keyFallbacks.find((r) => r.key === e), t || (t = this.keyRegexFallbacks.find((r) => r.regex.test(e)), t);
  }
}
export {
  F as BaseStore,
  B as EventListener,
  de as PerfectCache,
  k as StoreResult,
  w as cacheDebugger,
  ae as connectToIndexedDB,
  M as getSupportedDriverList,
  C as indexedDBDebugger,
  le as registerStore
};
