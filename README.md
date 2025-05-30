# perfect-cache

PerfectCache 是一个前端 javascript 的缓存库，可以使用不同的存储引擎来进行数据的保存，获取，删除等操作，作为国产软件，始终追求极致与完美，所以命名PerfectCache。它拥有如下功能

- 支持不同的存储引擎方式，例如内存、localStorage、sessionStorage、cookie、indexedDB和自定义引擎
- 支持多缓存实例，支持实例的延迟初始化init
- 支持存储的key的前缀prefix，以便跟其他key区分，清空时不会把其他key清除
- 作为缓存库，获取key时如果获取不到会自动重新请求（详见下面fallbackKey功能），并自动更新到缓存值，以便下次获取时可以直接拿到缓存值
- 支持缓存的批量插入，查询，删除操作
- 更多功能，欢迎提出

整个库导出的对象包括

```javascript
export {
    PerfectCache, // 核心的缓存类
    BaseStore, // 所有存储引擎的基类，用于自定义存储引擎
    EventListener, // 事件基类，拥有$on，$off，$emit实例方法，一般不用到
    systemStores, // 系统存储引擎，一般不用到
    externalStores, // 注册的自定义存储引擎，一般不用到
    LocalStorageStore, // 本地存储的存储引擎类，一般不用到
    MemoryStore, // 内存的存储引擎类，一般不用到
    SessionStorageStore, // 会话的存储引擎类，一般不用到
    CookieStore, // Cookie的存储引擎类，一般不用到
    IndexedDBStore, // 本地数据库的存储引擎类，一般不用到
    StoreResult, // 存储结果，用于判断setItem是否成功
    registerStore, // 用于注册自定义存储引擎
    getSupportedDriverList, // 在使用相应的存储引擎之前可以先获取支持的情况，确保可以正常使用
    connectToIndexedDB, // 封装了连接到IndexedDB函数
    createDBAndObjectStores, // 封装了连接DB并创建一次性创建多个store的函数
    cacheLogger, // 缓存库的日志前缀'perfect-cache:*'，用于调试
    indexedDBLogger, // indexedDB的日志前缀'perfect-cache:indexedDB:*'，用于调试
};
```

整个库导出的TS类型包括

```typescript
export type {
    Events, // 定义了BaseStore支持的事件类型的格式
    SupportedDriver, // 定义了默认支持的存储引擎类型
    BaseStoreOptions, // 定义了BaseStore的构造函数的选项
    CacheOptions, // 定义了PerfectCache的构造函数的选项
    IndexedDBStoreOptions, // 定义了IndexedDBStore的构造函数的选项
    IndexedDBStoreObject, // 定义了IndexedDBStore的内部存储结构
    StoreObject, // 定义了存储引擎的内部存储结构
    SetItemOptions, // 定义了setItem函数的选项
    GetItemOptions, // 定义了getItem函数的选项
    KeyFallbackConfig, // 定义了key字符串的退路函数配置
    KeyRegexFallbackConfig, // 定义了key正则表达式的退路函数配置
};
```

## 类 PerfectCache

### 构造函数

```javascript
// 方式一，传driver和选项，推荐
const perfectCacheInstance = new PerfectCache(driver, opts);
// 方式二，只传选项
const perfectCacheInstance = new PerfectCache(opts);
// 方式三，只适合使用默认使用内存driver
const perfectCacheInstance = new PerfectCache();
```

参数说明

| 名称                      | 意义                           | 类型        | 默认值          | 是否必填 |
| ------------------------- | ------------------------------ | ----------- | --------------- | -------- |
| driver                    | 使用的存储引擎                 | string      | memory          | 非必填   |
| opts                      | 缓存配置                       | object      | -               | 非必填   |
| opts.driver               | 缓存使用的存储引擎             | string      | memory          | 非必填   |
| opts.prefix               | 缓存 key 使用的前缀            | string      | cache:          | 非必填   |
| opts.dbName               | indexdb 名称                   | string      | 'perfect-cache' | 非必填   |
| opts.objectStoreName      | indexdb 的 store 名称          | string      | 'perfect-cache' | 非必填   |
| opts.dbVersion            | indexdb 连接版本，默认最新     | number      | -               | 非必填   |
| opts.dbConnection         | indexdb 连接，用于公用现有连接 | IDBDatabase | -               | 非必填   |
| opts.initStoreImmediately | 是否立即初始化存储引擎         | boolean     | true            | 非必填   |

### 实例方法

- 初始化存储引擎

实例在构造函数时默认立即调用init并马上ready，但是也可以设置手动调用，把initStoreImmediately设置为false，并在你认为合适的时机才调用init方法进行存储引擎的初始化，此时如果不调用init函数进行初始化，存储引擎会一直处于非ready的状态，所有的操作都会被阻塞。

```javascript
perfectCacheInstance.init();
```

- 存储引擎是否已经准备好

```javascript
const isReady = await perfectCacheInstance.isReady();
```

- 存储引擎已经准备好回调

```javascript
// 方式一，回调Callback方式
perfectCacheInstance.ready((self) => {
    window.console.log(self.driver + ' cache ready.');
});
// 方式二，promise模式
perfectCacheInstance.ready().then(() => {
    window.console.log('cache ready.');
});
```

- 获取 key 对应的缓存值

```javascript
const value = await perfectCacheInstance.getItem(key, opts);
```

参数说明

| 名称              | 意义                           | 类型    | 默认值 | 是否必填 |
| ----------------- | ------------------------------ | ------- | ------ | -------- |
| key               | 缓存的 key                     | string  | -      | 必填     |
| opts              | 获取选项                       | object  | -      | 非必填   |
| opts.defaultVal   | 获取不到时返回的默认值         | any     | -      | 非必填   |
| opts.withFallback | 获取不到时是否使用退路         | boolean | true   | 非必填   |
| opts.refreshCache | 使用退路获取到值时是否更新缓存 | boolean | true   | 非必填   |

- 批量获取 keys 对应的缓存值

```javascript
/**
 * itemListMap = {
 *   'key_a': 'valueA',
 *   'key_b': undefined,
 *   'otherKey_c': 'valueC'
 * }
 */
const itemListMap = await perfectCacheInstance.getItemList(['key_a', 'key_b', 'otherKey_c'], opts);
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
| keys              | 缓存的 keys 数组或者 key 正则匹配表达式 | Array\<string\>\|RegExp | -      | 必填     |
| opts              | 获取选项                                | object                  | -      | 非必填   |
| opts.defaultVal   | 获取不到时返回的默认值                  | any                     | -      | 非必填   |
| opts.withFallback | 获取不到时是否使用退路                  | boolean                 | true   | 非必填   |
| opts.refreshCache | 使用退路获取到值时是否更新缓存          | boolean                 | true   | 非必填   |

- 获取全部key的缓存值，没有默认值，回退方案和刷新缓存的选项，只获取当前存储的值

```javascript
/**
 * itemListMap = {
 *   'key_a': 'valueA',
 *   'key_b': undefined,
 *   'otherKey_c': 'valueC'
 * }
 */
const itemListMap = await perfectCacheInstance.getAllItem();
```

- 设置 key 对应的缓存值

```javascript
const result = await perfectCacheInstance.setItem(key, value, options);
```

参数说明，说明一下，在没有设置 expiredTime 和 expiredTimeAt 参数的情况下，maxAge 参数可以每次 getItem 获取完 key 的值，都会延迟过期时间自动续期，而设置 expiredTime 则不会自动续期

| 名称                    | 意义                  | 类型    | 默认值 | 是否必填 |
| ----------------------- | --------------------- | ------- | ------ | -------- |
| key                     | 设置的 key            | string  | -      | 必填     |
| value                   | 设置的缓存值          | any     | -      | 必填     |
| options                 | 设置选项              | object  | -      | 非必填   |
| options.expiredTime     | 过期时间，毫秒数      | number  | -      | 非必填   |
| options.expiredTimeAt   | 过期时间戳            | number  | -      | 非必填   |
| options.maxAge          | 缓存最大生命时间戳    | number  | -      | 非必填   |
| options.setOnlyNotExist | 只有不存在 key 才设置 | boolean | false  | 非必填   |
| options.setOnlyExist    | 只有存在 key 才设置   | boolean | false  | 非必填   |

设置的返回结果枚举值

```javascript
import { StoreResult } from 'perfect-cache';

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

- 批量设置缓存值

```javascript
itemListMap = {
    key_a: 'valueA',
    key_b: undefined,
    otherKey_c: 'valueC',
};
await perfectCacheInstance.setItemList(itemListMap, { maxAge: 5000 });
```

- 删除 key 对应的缓存值

```javascript
await perfectCacheInstance.removeItem(key);
```

参数说明

| 名称 | 意义       | 类型   | 默认值 | 是否必填 |
| ---- | ---------- | ------ | ------ | -------- |
| key  | 缓存的 key | string | -      | 必填     |

- 批量删除 keys 对应的缓存值

```javascript
await perfectCacheInstance.removeItemList(['key_a', 'key_b', 'otherKey_c']);
await perfectCacheInstance.removeItemList(/^key_.*$/);
```

参数说明

| 名称 | 意义                                    | 类型                    | 默认值 | 是否必填 |
| ---- | --------------------------------------- | ----------------------- | ------ | -------- |
| keys | 缓存的 keys 数组或者 key 正则匹配表达式 | Array\<string\>\|RegExp | -      | 必填     |

- 清除所有缓存值

```javascript
await perfectCacheInstance.clear();
```

- 返回 key 是否存在

```javascript
const isKeyExists = await perfectCacheInstance.existsKey(key);
```

参数说明

| 名称 | 意义       | 类型   | 默认值 | 是否必填 |
| ---- | ---------- | ------ | ------ | -------- |
| key  | 缓存的 key | string | -      | 必填     |

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
    'userInfo',
    () => {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve({
                    userName: '张三',
                    userCode: '123',
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

| 名称                | 意义                                     | 类型                         | 默认值 | 是否必填 |
| ------------------- | ---------------------------------------- | ---------------------------- | ------ | -------- |
| key                 | 缓存的 key 或者缓存的 key 匹配正则表达式 | string/Regex                 | -      | 必填     |
| fallback            | 退路函数                                 | (key:string)=>Promise\<any\> | -      | 必填     |
| options             | 通过退路函数获取到的缓存值更新缓存的参数 | object                       | -      | 非必填   |
| options.expiredTime | 过期时间，毫秒数                         | number                       | -      | 非必填   |
| options.maxAge      | 缓存最大生命时间戳                       | number                       | -      | 非必填   |

### 实例事件

```javascript
const cacheExpiredHandler = (key) => {
    console.log('key expired', key);
};
perfectCacheInstance.$on('ready', () => {});
perfectCacheInstance.$on('cacheExpired', cacheExpiredHandler);
perfectCacheInstance.$off('cacheExpired', cacheExpiredHandler);
perfectCacheInstance.$on('myEvent', (e) => {
    console.log(e); // e={ a: 1, b: 2 }
});
perfectCacheInstance.$emit('myEvent', { a: 1, b: 2 });
```

| 名称         | 触发时机                                 | 返回数据 |
| ------------ | ---------------------------------------- | -------- |
| ready        | 当存储引擎准备好了可以存取数据的时候触发 | -        |
| cacheExpired | 当获取的 key 过期时触发                  | key      |

## 支持的存储引擎

目前浏览器端支持内存(memory)，本地存储(localStorage)，会话(sessionStorage)，cookie(cookie)，数据库(indexedDB) 这些存储引擎，同时还支持自定义存储引擎。可以通过

```javascript
import { getSupportedDriverList } from 'perfect-cache';
const supportedDriverList = getSupportedDriverList();
```

获取到支持的存储引擎，包括了默认的系统引擎和自定义引擎

## 自定义存储引擎

```javascript
import { registerStore, BaseStore } from 'perfect-cache';
class MyStore extends BaseStore {
    // 引擎名称
    static driver = 'myStore';
    data = {};
    constructor(opts) {
        super(opts);
    }
    // 可选覆盖初始化函数
    init() {
        // 告诉缓存系统已经准备好了，如果是异步的就在准备好的时候调用ready函数告知系统
        this.getReady();
        return this;
    }
    // 必须重载keyValueGet方法，告知引擎底层怎样获取一个key对应的缓存值
    // 必须返回Promise对象，同时resolve的对象结构为
    // { value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
    keyValueGet(key) {
        const valueStr = this.data[key];
        return new Promise((resolve) => {
            if (valueStr) {
                try {
                    const valueObj = JSON.parse(valueStr);
                    resolve(valueObj);
                } catch (error) {
                    window.console.debug(`get key ${key} json parse error`, valueStr);
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        });
    }
    // 必须重载keyValueSet方法，告知引擎底层怎样设置一个key对应的缓存值
    // 必须返回Promise对象
    // value的数据结构为{ value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
    keyValueSet(key, value) {
        this.data[key] = JSON.stringify(value);
        return Promise.resolve();
    }
    // 可选覆盖实现getAllItem方法
    getAllItem() {
        return { ...this.data };
    }
    // 可选覆盖实现getItemList方法
    async getItemList(keys, opts) {
        let storeKeys = [];
        const itemListMap = {};
        if (Array.isArray(keys)) {
            storeKeys = keys;
        } else {
            if (keys instanceof RegExp) {
                storeKeys = (await this.keys()).filter((key) => {
                    return keys.test(key);
                });
            }
        }
        for (const key of storeKeys) {
            itemListMap[key] = this.data[key];
        }
        return itemListMap;
    }
    // 可选覆盖实现setItemList方法
    async setItemList(itemList, options) {
        const keys = Object.keys(itemList);
        for (const key of keys) {
            const value = itemList[key];
            await this.setItem(key, value, options);
        }
    }
    // 必须重载removeItem方法，删除key对应的缓存值
    removeItem(key) {
        return new Promise((resolve, reject) => {
            try {
                delete this.data[key];
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    // 可选覆盖实现removeItemList方法
    async removeItemList(keys) {
        let storeKeys = [];
        if (Array.isArray(keys)) {
            storeKeys = keys;
        } else {
            if (keys instanceof RegExp) {
                storeKeys = (await this.keys()).filter((key) => {
                    return keys.test(key);
                });
            }
        }
        for (const key of storeKeys) {
            delete this.data[key];
        }
    }
    // 可选覆盖实现clear方法，清空缓存值
    clear() {
        this.data = {};
        return Promise.resolve();
    }
    // 必须重载existsKey方法，告知引擎底层一个key是否存在
    // 必须返回Promise对象
    existsKey(key) {
        if (key in this.data) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    // 必须重载keys方法，获取缓存所有key
    keys() {
        const keys = Object.keys(this.data);
        return Promise.resolve(keys);
    }
    // 可选覆盖实现length方法，获取keys的长度
    length() {
        return Promise.resolve(Object.keys(this.data).length);
    }
}
registerStore(MyStore);
const perfectCacheInstance = new PerfectCache('myStore');
```

## 其他问题

1. 目前使用Cookie，SessionStorage等本地存储来缓存数据时，发现如下问题

- 这些存储有空间大小的限制，所以不适合作为批量数据的存储，例如接口数据的缓存（菜单数据，地址数据，列表数据等），不然会报错或者覆盖掉旧的数据，我在使用cookie做批量数据插入的时候就发现这个问题
- 这些本地存储都没有物理上命名空间的区分，所以其实不同前缀的key都是保存在同一个命名空间下的，虽然本缓存库是支持多实例的，但是实际上这些本地存储都是单实例的，所以如果你一个实例的前缀是空，另一个实例的前缀是cache:，其实空前缀的keys会返回所有其他前缀的实例的数据，同理前缀是cache-的实例的keys也会返回前缀是cache-app1-和前缀是cache-app2的实例的keys

2. 虽然我们是支持多实例的缓存实例，也尽量保持数据上的独立隔离，但是由于存储底层引擎的原理，不可避免会出现以上的问题，所以正确选择存储引擎很重要，如下是我们的一些使用场景建议

- 一些系统前端的全局设置，可以使用localStorage，例如选择的语言，选择的主题之类，因为这些信息不需要传到后端接口，同时下次打开应用时还需要保留数据
- 一些用户选择的信息，例如当前选择的项目，当前选择的组织，角色之类，如同sessionStorage的含义，只是这次会话独有的，不同的会话会有不一样的数据，则可以使用sessionStorage
- 用户token，选择的语言给后端做国际化等可能后端也需要获取到的信息，则可以通过cookie带到接口里
- 大规模数据的存储，例如菜单数据，地址数据，接口数据等，都适合使用indexedDB作为缓存引擎，因为他们可以通过dbName和storeName来完全隔离数据
- 去掉前缀prefix可以一定程度带来部分性能的提升，因为去掉前缀可以避免先获取到全量的key，然后进行前缀的正则匹配，才知道真正需要操作的key，但是一旦本地存储去掉了前缀prefix，就会跟其他的存储key混在一起，从而不知道哪些是我们的存储引擎存储的数据了，所以除了indexedDB和内存memory可以不设置prefix，其他存储引擎都需要设置prefix，事实上，我们默认的prefix配置正是如此！
