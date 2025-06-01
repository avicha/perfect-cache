/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeAll, test } from 'vitest';
import { PerfectCache, SessionStorageStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

// 经过测试，sessionStorage的写操作和删除操作都比较耗时，获取，是否存在，获取keys，长度比较快
// sessionStorageCache ready: 0.20000000001164153 ms
// sessionStorageCache setItem: 96 ms
// sessionStorageCache getItem: 24.20000000001164 ms
// sessionStorageCache getItemList: 34.70000000001164 ms
// sessionStorageCache getAllItem: 23.20000000001164 ms
// sessionStorageCache existsKey: 9.299999999988358 ms
// sessionStorageCache keys: 5.2000000000116415 ms
// sessionStorageCache length: 4.900000000023283 ms
// sessionStorageCache removeItem: 79.5 ms
// sessionStorageCache setItemList: 100.30000000004657 ms
// sessionStorageCache removeItemList: 93.60000000003492 ms
// sessionStorageCache clear: 78.79999999998836 ms
describe('testing sessionStorage cache performance', () => {
    const sessionStorageCache = new PerfectCache<BaseStoreOptions, SessionStorageStore>('sessionStorage', {
        prefix: 'sessionStorage-',
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
        console.time('sessionStorageCache ready');
        sessionStorageCache.init();
        const p = sessionStorageCache.ready(() => {
            console.timeEnd('sessionStorageCache ready');
        });
        return p;
    }, 5000);
    test('sessionStorageCache setItem', async () => {
        console.time('sessionStorageCache setItem');
        for (const item of storeData) {
            await sessionStorageCache.setItem(item.key, item.value);
        }
        console.timeEnd('sessionStorageCache setItem');
    });
    test('sessionStorageCache getItem', async () => {
        console.time('sessionStorageCache getItem');
        for (let i = 0; i < 10000; i++) {
            await sessionStorageCache.getItem(`key-${i}`);
        }
        console.timeEnd('sessionStorageCache getItem');
    });
    test('sessionStorageCache getItemList', async () => {
        console.time('sessionStorageCache getItemList');
        await sessionStorageCache.getItemList(/^key-/);
        console.timeEnd('sessionStorageCache getItemList');
    });
    test('sessionStorageCache getAllItem', async () => {
        console.time('sessionStorageCache getAllItem');
        await sessionStorageCache.getAllItem();
        console.timeEnd('sessionStorageCache getAllItem');
    });
    test('sessionStorageCache existsKey', async () => {
        console.time('sessionStorageCache existsKey');
        for (let i = 0; i < 10000; i++) {
            await sessionStorageCache.existsKey(`key-${i}`);
        }
        console.timeEnd('sessionStorageCache existsKey');
    });
    test('sessionStorageCache keys', async () => {
        console.time('sessionStorageCache keys');
        await sessionStorageCache.keys();
        console.timeEnd('sessionStorageCache keys');
    });
    test('sessionStorageCache length', async () => {
        console.time('sessionStorageCache length');
        await sessionStorageCache.length();
        console.timeEnd('sessionStorageCache length');
    });

    test('sessionStorageCache removeItem', async () => {
        console.time('sessionStorageCache removeItem');
        for (let i = 0; i < 10000; i++) {
            await sessionStorageCache.removeItem(`key-${i}`);
        }
        console.timeEnd('sessionStorageCache removeItem');
    });
    test('sessionStorageCache setItemList', async () => {
        console.time('sessionStorageCache setItemList');
        await sessionStorageCache.setItemList(setStoreObject);
        console.timeEnd('sessionStorageCache setItemList');
    });
    test('sessionStorageCache removeItemList', async () => {
        console.time('sessionStorageCache removeItemList');
        await sessionStorageCache.removeItemList(/^key-/);
        console.timeEnd('sessionStorageCache removeItemList');
    });
    test('sessionStorageCache clear', async () => {
        await sessionStorageCache.setItemList(setStoreObject);
        console.time('sessionStorageCache clear');
        await sessionStorageCache.clear();
        console.timeEnd('sessionStorageCache clear');
    });
});
