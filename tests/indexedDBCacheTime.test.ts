/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeAll, test } from 'vitest';
import { PerfectCache, IndexedDBStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

// 最耗时的缓存引擎，但是10000条数据也是1s左右的操作时间还可以接受，设置和删除相对耗时，获取数据和获取keys和长度都很快
// indexedDBCache ready: 0.8000000002793968 ms
// indexedDBCache setItem: 1156 ms
// indexedDBCache getItem: 692.3000000002794 ms
// indexedDBCache getItemList: 653.7999999998137 ms
// indexedDBCache getAllItem: 753.5 ms
// indexedDBCache existsKey: 572.5 ms
// indexedDBCache keys: 17.300000000279397 ms
// indexedDBCache length: 15.5 ms
// indexedDBCache removeItem: 1285.3000000002794 ms
// indexedDBCache setItemList: 1150.5 ms
// indexedDBCache removeItemList: 965.1000000000931 ms
// indexedDBCache clear: 1480.3999999999069 ms
describe('testing indexedDB cache performance', () => {
    const indexedDBCache = new PerfectCache<BaseStoreOptions, IndexedDBStore>('indexedDB', {
        prefix: 'indexedDB-',
        dbName: 'indexedDBCacheTest',
        storeName: 'indexedDBCacheStore',
        initStoreImmediately: false,
    });
    interface StoreData {
        key: string;
        value: Record<string, any>;
    }
    // 生成10000条测试数据
    // 每条数据包含一个key和一个value，value是一个对象，包含多个类型的值
    // 包括字符串、数字、布尔值、对象、数组、null和undefined
    // 每条数据的过期时间为1天
    const storeData: StoreData[] = [];
    const setStoreObject: Record<StoreData['key'], StoreData['value']> = {};
    beforeAll(() => {
        for (let i = 0; i < 10000; i++) {
            const key = `key-${i}`;
            const value = {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
                string: 'string',
                number: i,
                boolean: false,
                object: { a: 1, b: 2 },
                array: [1, 2, 3],
                null: null,
                undefined: undefined,
            };
            storeData.push({
                key,
                value,
            });
            setStoreObject[key] = value;
        }
        console.time('indexedDBCache ready');
        indexedDBCache.init();
        const p = indexedDBCache.ready(() => {
            console.timeEnd('indexedDBCache ready');
        });
        return p;
    }, 5000);
    test('indexedDBCache setItem', async () => {
        console.time('indexedDBCache setItem');
        for (const item of storeData) {
            await indexedDBCache.setItem(item.key, item.value);
        }
        console.timeEnd('indexedDBCache setItem');
    });
    test('indexedDBCache getItem', async () => {
        console.time('indexedDBCache getItem');
        for (let i = 0; i < 10000; i++) {
            await indexedDBCache.getItem(`key-${i}`);
        }
        console.timeEnd('indexedDBCache getItem');
    });
    test('indexedDBCache getItemList', async () => {
        console.time('indexedDBCache getItemList');
        await indexedDBCache.getItemList(/^key-/);
        console.timeEnd('indexedDBCache getItemList');
    });
    test('indexedDBCache getAllItem', async () => {
        console.time('indexedDBCache getAllItem');
        await indexedDBCache.getAllItem();
        console.timeEnd('indexedDBCache getAllItem');
    });
    test('indexedDBCache existsKey', async () => {
        console.time('indexedDBCache existsKey');
        for (let i = 0; i < 10000; i++) {
            await indexedDBCache.existsKey(`key-${i}`);
        }
        console.timeEnd('indexedDBCache existsKey');
    });
    test('indexedDBCache keys', async () => {
        console.time('indexedDBCache keys');
        await indexedDBCache.keys();
        console.timeEnd('indexedDBCache keys');
    });
    test('indexedDBCache length', async () => {
        console.time('indexedDBCache length');
        await indexedDBCache.length();
        console.timeEnd('indexedDBCache length');
    });

    test('indexedDBCache removeItem', async () => {
        console.time('indexedDBCache removeItem');
        for (let i = 0; i < 10000; i++) {
            await indexedDBCache.removeItem(`key-${i}`);
        }
        console.timeEnd('indexedDBCache removeItem');
    });
    test('indexedDBCache setItemList', async () => {
        console.time('indexedDBCache setItemList');
        await indexedDBCache.setItemList(setStoreObject);
        console.timeEnd('indexedDBCache setItemList');
    });
    test('indexedDBCache removeItemList', async () => {
        console.time('indexedDBCache removeItemList');
        await indexedDBCache.removeItemList(/^key-/);
        console.timeEnd('indexedDBCache removeItemList');
    });
    test('indexedDBCache clear', async () => {
        await indexedDBCache.setItemList(setStoreObject);
        console.time('indexedDBCache clear');
        await indexedDBCache.clear();
        console.timeEnd('indexedDBCache clear');
    });
});
