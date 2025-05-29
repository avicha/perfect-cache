/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeAll } from 'vitest';
import { PerfectCache, BaseStore, registerStore, getSupportedDriverList, externalStores } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions, StoreObject } from '../src/types';

class MyStore extends BaseStore<BaseStoreOptions> {
    // 引擎名称
    static driver = 'myStore';
    data: Record<string, any> = {};
    constructor(opts: BaseStoreOptions) {
        super(opts);
    }
    // 重载初始化函数
    init() {
        // 告诉缓存系统已经准备好了，如果是异步的就在准备好的时候调用ready函数告知系统
        this.getReady();
        return this;
    }
    // 重载keyValueGet方法，告知引擎底层怎样获取一个key对应的缓存值
    // 必须返回Promise对象，同时resolve的对象结构为
    // { value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        const valueStr = this.data[this.__getRealKey(key)];
        return new Promise((resolve) => {
            if (valueStr) {
                try {
                    const valueObj: StoreObject = JSON.parse(valueStr);
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
    // 重载keyValueSet方法，告知引擎底层怎样设置一个key对应的缓存值
    // 必须返回Promise对象
    // value的数据结构为{ value:'xxx', expiredTimeAt: 12345678910, maxAge: 3600000}
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        try {
            this.data[this.__getRealKey(key)] = JSON.stringify(value);
            return Promise.resolve();
        } catch (error) {
            window.console.debug(`set key ${key} json stringify error`, error);
            return Promise.reject(error);
        }
    }
    // 重载existsKey方法，告知引擎底层一个key是否存在
    // 必须返回Promise对象
    existsKey(key: string) {
        const realKey = this.__getRealKey(key);
        if (realKey in this.data) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    // 重载removeItem方法，删除key对应的缓存值
    removeItem(key: string): Promise<void> {
        delete this.data[this.__getRealKey(key)];
        return Promise.resolve();
    }
    // 重载keys方法，获取缓存所有key
    keys() {
        const keys = Object.keys(this.data).map((key) => key.replace(this.prefix, ''));
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
describe('custom store cache should be correct', () => {
    const perfectCacheInstance1 = new PerfectCache<BaseStoreOptions, MyStore>('myStore', {
        prefix: '',
    });
    const perfectCacheInstance2 = new PerfectCache<BaseStoreOptions, MyStore>('myStore', {
        prefix: 'myStore-',
    });
    beforeAll(() => Promise.all([perfectCacheInstance1.ready(), perfectCacheInstance2.ready()]), 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
    test('custom store cache driver name should be myStore', () => {
        const supportedDriverList = getSupportedDriverList();
        expect(supportedDriverList).toContain('myStore');
        expect(Object.keys(externalStores)).toContain('myStore');
        expect(perfectCacheInstance1.driver).toBe('myStore');
        expect(perfectCacheInstance1.store).toBeInstanceOf(MyStore);
        expect(perfectCacheInstance1.store!.prefix).toBe('');
        expect(perfectCacheInstance1.getItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.getItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.getAllItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.setItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.setItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.removeItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.removeItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.clear).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.length).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.keys).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.existsKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.fallbackKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.isReady).toBeInstanceOf(Function);
        expect(perfectCacheInstance1.ready).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.driver).toBe('myStore');
        expect(perfectCacheInstance2.store).toBeInstanceOf(MyStore);
        expect(perfectCacheInstance2.store!.prefix).toBe('myStore-');
        expect(perfectCacheInstance2.getItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.getItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.getAllItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.setItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.setItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.removeItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.removeItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.clear).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.length).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.keys).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.existsKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.fallbackKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.isReady).toBeInstanceOf(Function);
        expect(perfectCacheInstance2.ready).toBeInstanceOf(Function);
    });
});
