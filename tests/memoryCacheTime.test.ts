/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeAll, test } from 'vitest';
import { PerfectCache, MemoryStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

// 直接内存操作，获取相对耗时，设置，删除都很快
// memoryCache ready: 0 ms
// memoryCache setItem: 14.300000000046566 ms
// memoryCache getItem: 20.399999999906868 ms
// memoryCache getItemList: 17 ms
// memoryCache getAllItem: 13.100000000093132 ms
// memoryCache existsKey: 6 ms
// memoryCache keys: 0.6999999999534339 ms
// memoryCache length: 0.09999999986030161 ms
// memoryCache removeItem: 6.600000000093132 ms
// memoryCache setItemList: 14.099999999860302 ms
// memoryCache removeItemList: 9.700000000186265 ms
// memoryCache clear: 0.19999999995343387 ms
describe('testing memory cache performance', () => {
    const memoryCache = new PerfectCache<BaseStoreOptions, MemoryStore>('memory', {
        prefix: 'memory-',
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
        console.time('memoryCache ready');
        memoryCache.init();
        const p = memoryCache.ready(() => {
            console.timeEnd('memoryCache ready');
        });
        return p;
    }, 5000);
    test('memoryCache setItem', async () => {
        console.time('memoryCache setItem');
        for (const item of storeData) {
            await memoryCache.setItem(item.key, item.value);
        }
        console.timeEnd('memoryCache setItem');
    });
    test('memoryCache getItem', async () => {
        console.time('memoryCache getItem');
        for (let i = 0; i < 10000; i++) {
            await memoryCache.getItem(`key-${i}`);
        }
        console.timeEnd('memoryCache getItem');
    });
    test('memoryCache getItemList', async () => {
        console.time('memoryCache getItemList');
        await memoryCache.getItemList(/^key-/);
        console.timeEnd('memoryCache getItemList');
    });
    test('memoryCache getAllItem', async () => {
        console.time('memoryCache getAllItem');
        await memoryCache.getAllItem();
        console.timeEnd('memoryCache getAllItem');
    });
    test('memoryCache existsKey', async () => {
        console.time('memoryCache existsKey');
        for (let i = 0; i < 10000; i++) {
            await memoryCache.existsKey(`key-${i}`);
        }
        console.timeEnd('memoryCache existsKey');
    });
    test('memoryCache keys', async () => {
        console.time('memoryCache keys');
        await memoryCache.keys();
        console.timeEnd('memoryCache keys');
    });
    test('memoryCache length', async () => {
        console.time('memoryCache length');
        await memoryCache.length();
        console.timeEnd('memoryCache length');
    });

    test('memoryCache removeItem', async () => {
        console.time('memoryCache removeItem');
        for (let i = 0; i < 10000; i++) {
            await memoryCache.removeItem(`key-${i}`);
        }
        console.timeEnd('memoryCache removeItem');
    });
    test('memoryCache setItemList', async () => {
        console.time('memoryCache setItemList');
        await memoryCache.setItemList(setStoreObject);
        console.timeEnd('memoryCache setItemList');
    });
    test('memoryCache removeItemList', async () => {
        console.time('memoryCache removeItemList');
        await memoryCache.removeItemList(/^key-/);
        console.timeEnd('memoryCache removeItemList');
    });
    test('memoryCache clear', async () => {
        await memoryCache.setItemList(setStoreObject);
        console.time('memoryCache clear');
        await memoryCache.clear();
        console.timeEnd('memoryCache clear');
    });
});
