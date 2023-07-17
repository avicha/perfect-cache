# perfect-cache

PerfectCache 是一个前端 javascript 的缓存库，可以使用不同的存储 driver 来进行数据的保存，获取，删除等操作。

## 类 PerfectCache

#### 构造函数

```javascript
const perfectCacheInstance = new PerfectCache(driver, opts);
```

参数说明

| 名称                 | 意义                           | 类型        | 默认值          | 是否必填 |
| -------------------- | ------------------------------ | ----------- | --------------- | -------- |
| driver               | 使用的存储引擎                 | String      | memory          | 非必填   |
| opts                 | 缓存配置                       | Object      | -               | 非必填   |
| opts.driver          | 缓存使用的存储引擎             | String      | memory          | 非必填   |
| opts.prefix          | 缓存 key 使用的前缀            | String      | cache:          | 非必填   |
| opts.dbName          | indexdb 名称                   | string      | 'perfect-cache' | 非必填   |
| opts.objectStoreName | indexdb 的 store 名称          | string      | 'perfect-cache' | 非必填   |
| opts.dbVersion       | indexdb 连接版本，默认最新     | number      | -               | 非必填   |
| opts.dbConnection    | indexdb 连接，用于公用现有连接 | IDBDatabase | -               | 非必填   |

#### 实例方法

- 获取 key 对应的缓存值

```javascript
cocnst value = await perfectCacheInstance.getItem(key, opts)
```

参数说明

| 名称              | 意义                           | 类型    | 默认值 | 是否必填 |
| ----------------- | ------------------------------ | ------- | ------ | -------- |
| key               | 缓存的 key                     | String  | -      | 必填     |
| opts              | 获取选项                       | Object  | -      | 非必填   |
| opts.defaultVal   | 获取不到时返回的默认值         | any     | -      | 非必填   |
| opts.withFallback | 获取不到时是否使用退路         | Boolean | true   | 非必填   |
| opts.refreshCache | 使用退路获取到值时是否更新缓存 | Boolean | true   | 非必填   |

- 批量获取 keys 对应的缓存值

```javascript
/**
 * itemListMap = {
 *   'key_a': 'valueA',
 *   'key_b': undefined,
 *   'otherKey_c': 'valueC'
 * }
 */
const itemListMap = await perfectCacheInstance.getItemList(
  ["key_a", "key_b", "otherKey_c"],
  opts
);
/**
 * itemListMap = {
 *   'key_a': 'valueA',
 *   'key_b': undefined,
 * }
 */
const itemListMap = await perfectCacheInstance.getItemList(/^key_.*$/, opts);
```

参数说明

| 名称              | 意义                                    | 类型                    | 默认值 | 是否必填 |
| ----------------- | --------------------------------------- | ----------------------- | ------ | -------- |
| keys              | 缓存的 keys 数组或者 key 正则匹配表达式 | Array\<String\>\|RegExp | -      | 必填     |
| opts              | 获取选项                                | Object                  | -      | 非必填   |
| opts.defaultVal   | 获取不到时返回的默认值                  | any                     | -      | 非必填   |
| opts.withFallback | 获取不到时是否使用退路                  | Boolean                 | true   | 非必填   |
| opts.refreshCache | 使用退路获取到值时是否更新缓存          | Boolean                 | true   | 非必填   |

- 设置 key 对应的缓存值

```javascript
const result = await perfectCacheInstance.setItem(key, value, options);
```

参数说明，说明一下，在没有设置 expiredTime 和 expiredTimeAt 参数的情况下，maxAge 参数可以每次 getItem 获取完 key 的值，都会延迟过期时间自动续期，而设置 expiredTime 则不会自动续期

| 名称                    | 意义                  | 类型    | 默认值 | 是否必填 |
| ----------------------- | --------------------- | ------- | ------ | -------- |
| key                     | 设置的 key            | String  | -      | 必填     |
| value                   | 设置的缓存值          | any     | -      | 必填     |
| options                 | 设置选项              | Object  | -      | 非必填   |
| options.expiredTime     | 过期时间，毫秒数      | Number  | -      | 非必填   |
| options.expiredTimeAt   | 过期时间戳            | Number  | -      | 非必填   |
| options.maxAge          | 缓存最大生命时间戳    | Number  | -      | 非必填   |
| options.setOnlyNotExist | 只有不存在 key 才设置 | Boolean | false  | 非必填   |
| options.setOnlyExist    | 只有存在 key 才设置   | Boolean | false  | 非必填   |

设置的返回结果枚举值

```javascript
import { StoreResult } from "perfect-cache";

switch (result) {
  // 成功设置
  case StoreResult.OK:
    break;
  // 设置缓存值时，设置了不存在才设置，但是由于 key 存在导致没有设置
  case StoreResult.NX_SET_NOT_PERFORMED:
    break;
  // 置缓存值时，设置了存在才设置，但是由于 key 不存在导致没有设置
  case StoreResult.XX_SET_NOT_PERFORMED:
    break;
}
```

| 名称                 | 意义                                                            |
| -------------------- | --------------------------------------------------------------- |
| OK                   | 成功设置                                                        |
| NX_SET_NOT_PERFORMED | 设置缓存值时，设置了不存在才设置，但是由于 key 存在导致没有设置 |
| XX_SET_NOT_PERFORMED | 设置缓存值时，设置了存在才设置，但是由于 key 不存在导致没有设置 |

- 返回 key 是否存在

```javascript
const isKeyExists = await perfectCacheInstance.existsKey(key);
```

参数说明

| 名称 | 意义       | 类型   | 默认值 | 是否必填 |
| ---- | ---------- | ------ | ------ | -------- |
| key  | 缓存的 key | String | -      | 必填     |

- 删除 key 对应的缓存值

```javascript
await perfectCacheInstance.removeItem(key);
```

参数说明

| 名称 | 意义       | 类型   | 默认值 | 是否必填 |
| ---- | ---------- | ------ | ------ | -------- |
| key  | 缓存的 key | String | -      | 必填     |

- 批量删除 keys 对应的缓存值

```javascript
await perfectCacheInstance.removeItemList(["key_a", "key_b", "otherKey_c"]);
await perfectCacheInstance.removeItemList(/^key_.*$/);
```

参数说明

| 名称 | 意义                                    | 类型                    | 默认值 | 是否必填 |
| ---- | --------------------------------------- | ----------------------- | ------ | -------- |
| keys | 缓存的 keys 数组或者 key 正则匹配表达式 | Array\<String\>\|RegExp | -      | 必填     |

- 清除所有缓存值

```javascript
await perfectCacheInstance.clear();
```

- 获取所有缓存 key

```javascript
const keys = await perfectCacheInstance.keys();
```

- 获取所有缓存 key 的数量

```javascript
const keysCount = await perfectCacheInstance.length();
```

- 设置获取的 key 找不到缓存值时的退路函数

```javascript
perfectCacheInstance.fallbackKey(key, fallback, options);
// 当获取key=userInfo找不到时，则调用fallback退路函数来获取userInfo，通过Promise返回新的缓存值，并设置有效期2小时
perfectCacheInstance.fallbackKey(
  "userInfo",
  () => {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          userName: "张三",
          userCode: "123",
        });
      }, 3000);
    });
  },
  { expiredTime: 7200 * 1000 }
);
// 当获取key匹配page_找不到时，则调用fallback退路函数来获取pageInfo，通过Promise返回新的缓存值，并设置生命存活期2小时
perfectCacheInstance.fallbackKey(
  /^page_(\w+)$/i,
  (key) => {
    return new Promise((resolve) => {
      const pageCode = key.match(/^page_(\w+)$/i)[1];
      api.getPageInfo(pageCode).then((pageInfo) => {
        resolve(pageInfo);
      });
    });
  },
  { maxAge: 7200 * 1000 }
);
```

参数说明

| 名称                | 意义                                     | 类型         | 默认值 | 是否必填 |
| ------------------- | ---------------------------------------- | ------------ | ------ | -------- |
| key                 | 缓存的 key 或者缓存的 key 匹配正则表达式 | String/Regex | -      | 必填     |
| fallback            | 退路函数                                 | Function     | -      | 必填     |
| options             | 通过退路函数获取到的缓存值更新缓存的参数 | Object       | -      | 非必填   |
| options.expiredTime | 过期时间，毫秒数                         | Number       | -      | 非必填   |
| options.maxAge      | 缓存最大生命时间戳                       | Number       | -      | 非必填   |

#### 实例事件

```javascript
const cacheExpiredHandler = (key) => {
  console.log("key expired", key);
};
perfectCacheInstance.$on("ready", () => {});
perfectCacheInstance.$off("cacheExpired", cacheExpiredHandler);
perfectCacheInstance.$emit("myEvent", { a: 1, b: 2 });
```

| 名称         | 触发时机                                 | 返回数据 |
| ------------ | ---------------------------------------- | -------- |
| ready        | 当存储引擎准备好了可以存取数据的时候触发 | -        |
| cacheExpired | 当获取的 key 过期时触发                  | key      |

## 支持的存储引擎

目前浏览器端支持内存(memory)，本地存储(localStorage)，会话(sessionStorage)，cookie(cookie)，数据库(indexedDB) 这些存储引擎，同时还支持自定义存储引擎。

## 自定义存储引擎

```javascript
import { registerStore, BaseStore } from "perfect-cache";
class MyStore extends BaseStore {
  // 驱动名称
  static driver = "myStore";
  data = {};
  constructor(opts) {
    super(opts);
    // 告诉缓存系统已经准备好了，如果是异步的就在准备好的时候调用ready函数告知系统
    this.ready();
  }
  // 重载keyValueGet方法，告知引擎底层怎样获取一个key对应的缓存值
  // 必须返回Promise对象，同时resolve的对象结构为
  // { value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
  keyValueGet(key) {
    const valueStr = this.data[this.__getRealKey(key)];
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          window.console.debug(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  // 重载keyValueSet方法，告知引擎底层怎样设置一个key对应的缓存值
  // 必须返回Promise对象
  // value的数据结构为{ value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
  keyValueSet(key, value) {
    this.data[this.__getRealKey(key)] = JSON.stringify(value);
    return Promise.resolve();
  }
  // 重载existsKey方法，告知引擎底层一个key是否存在
  // 必须返回Promise对象
  existsKey(key) {
    const realKey = this.__getRealKey(key);
    if (realKey in this.data) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  // 重载removeItem方法，删除key对应的缓存值
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        delete this.data[this.__getRealKey(key)];
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  // 重载keys方法，获取缓存所有key
  keys() {
    const keys = Object.keys(this.data).map((key) =>
      key.replace(this.prefix, "")
    );
    return Promise.resolve(keys);
  }
  // 重载clear方法，清空缓存值
  clear() {
    this.data = {};
    return Promise.resolve();
  }
  // 重载length方法，获取keys的长度
  length() {
    return Promise.resolve(Object.keys(this.data).length);
  }
}
registerStore(MyStore);
const perfectCacheInstance = new PerfectCache("myStore");
```
