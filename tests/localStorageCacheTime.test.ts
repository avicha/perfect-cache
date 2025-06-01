/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeAll, test } from 'vitest';
import { PerfectCache, LocalStorageStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

// 经过测试，本地存储的写操作和删除操作都比较耗时，反而获取比较快
// localStorageCache ready: 0.1000000000349246 ms
// localStorageCache setItem: 82.30000000004657 ms
// localStorageCache getItem: 21.70000000001164 ms
// localStorageCache getItemList: 30.600000000034925 ms
// localStorageCache getAllItem: 23.699999999953434 ms
// localStorageCache existsKey: 9.600000000034925 ms
// localStorageCache keys: 5.899999999965075 ms
// localStorageCache length: 5.100000000034925 ms
// localStorageCache removeItem: 58 ms
// localStorageCache setItemList: 78.59999999997672 ms
// localStorageCache removeItemList: 65.40000000002328 ms
describe('testing localStorage cache performance', () => {
    const localStorageCache = new PerfectCache<BaseStoreOptions, LocalStorageStore>('localStorage', {
        prefix: 'localStorage-',
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
        console.time('localStorageCache ready');
        localStorageCache.init();
        const p = localStorageCache.ready(() => {
            console.timeEnd('localStorageCache ready');
        });
        return p;
    }, 5000);
    test('localStorageCache setItem', async () => {
        console.time('localStorageCache setItem');
        for (const item of storeData) {
            await localStorageCache.setItem(item.key, item.value);
        }
        console.timeEnd('localStorageCache setItem');
    });
    test('localStorageCache getItem', async () => {
        console.time('localStorageCache getItem');
        for (let i = 0; i < 10000; i++) {
            await localStorageCache.getItem(`key-${i}`);
        }
        console.timeEnd('localStorageCache getItem');
    });
    test('localStorageCache getItemList', async () => {
        console.time('localStorageCache getItemList');
        await localStorageCache.getItemList(/^key-/);
        console.timeEnd('localStorageCache getItemList');
    });
    test('localStorageCache getAllItem', async () => {
        console.time('localStorageCache getAllItem');
        await localStorageCache.getAllItem();
        console.timeEnd('localStorageCache getAllItem');
    });
    test('localStorageCache existsKey', async () => {
        console.time('localStorageCache existsKey');
        for (let i = 0; i < 10000; i++) {
            await localStorageCache.existsKey(`key-${i}`);
        }
        console.timeEnd('localStorageCache existsKey');
    });
    test('localStorageCache keys', async () => {
        console.time('localStorageCache keys');
        await localStorageCache.keys();
        console.timeEnd('localStorageCache keys');
    });
    test('localStorageCache length', async () => {
        console.time('localStorageCache length');
        await localStorageCache.length();
        console.timeEnd('localStorageCache length');
    });

    test('localStorageCache removeItem', async () => {
        console.time('localStorageCache removeItem');
        for (let i = 0; i < 10000; i++) {
            await localStorageCache.removeItem(`key-${i}`);
        }
        console.timeEnd('localStorageCache removeItem');
    });
    test('localStorageCache setItemList', async () => {
        console.time('localStorageCache setItemList');
        await localStorageCache.setItemList(setStoreObject);
        console.timeEnd('localStorageCache setItemList');
    });
    test('localStorageCache removeItemList', async () => {
        console.time('localStorageCache removeItemList');
        await localStorageCache.removeItemList(/^key-/);
        console.timeEnd('localStorageCache removeItemList');
    });
    test('localStorageCache clear', async () => {
        await localStorageCache.setItemList(setStoreObject);
        console.time('localStorageCache clear');
        await localStorageCache.clear();
        console.timeEnd('localStorageCache clear');
    });
});
