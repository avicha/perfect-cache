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
        // 告诉缓存系统已经准备好了，如果是异步的就在准备好的时候调用ready函数告知系统
        this.getReady();
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
        const size = Object.keys(this.data).length;
        this.data = {};
        return Promise.resolve(size);
    }
    // 重载length方法，获取keys的长度
    length() {
        return Promise.resolve(Object.keys(this.data).length);
    }
}
registerStore(MyStore);
describe('custom store cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, MyStore> = new PerfectCache('myStore');
    beforeAll(() => perfectCacheInstance.ready(), 5000);
    runTestCases(perfectCacheInstance);
    test('custom store cache driver name should be myStore', () => {
        const supportedDriverList = getSupportedDriverList();
        expect(supportedDriverList).toContain('myStore');
        expect(Object.keys(externalStores)).toContain('myStore');
        expect(perfectCacheInstance.driver).toBe('myStore');
        expect(perfectCacheInstance.store).toBeInstanceOf(MyStore);
        expect(perfectCacheInstance.getItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance.setItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance.removeItem).toBeInstanceOf(Function);
        expect(perfectCacheInstance.clear).toBeInstanceOf(Function);
        expect(perfectCacheInstance.length).toBeInstanceOf(Function);
        expect(perfectCacheInstance.keys).toBeInstanceOf(Function);
        expect(perfectCacheInstance.existsKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance.getItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance.removeItemList).toBeInstanceOf(Function);
        expect(perfectCacheInstance.fallbackKey).toBeInstanceOf(Function);
        expect(perfectCacheInstance.isReady).toBeInstanceOf(Function);
        expect(perfectCacheInstance.ready).toBeInstanceOf(Function);
    });
});
