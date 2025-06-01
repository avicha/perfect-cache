/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeAll, test } from 'vitest';
import { PerfectCache, CookieStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

// 经测试，cookie读取数据比写数据的速度要慢，不知道js-cookies怎么实现的
// cookieCache ready: 0 ms
// cookieCache setItem: 4.600000000034925 ms
// cookieCache getItem: 34.20000000001164 ms
// cookieCache getItemList: 33.09999999997672 ms
// cookieCache getAllItem: 33.79999999998836 ms
// cookieCache existsKey: 34.40000000002328 ms
// cookieCache keys: 0.7999999999883585 ms
// cookieCache length: 0.7999999999883585 ms
// cookieCache removeItem: 7 ms
// cookieCache setItemList: 4.2000000000116415 ms
// cookieCache removeItemList: 4.2999999999883585 ms
// cookieCache clear: 3.7999999999883585 ms
describe('testing cookie cache performance', () => {
    const cookieCache = new PerfectCache<BaseStoreOptions, CookieStore>('cookie', {
        prefix: 'cookie-',
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
        for (let i = 0; i < 100; i++) {
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
        console.time('cookieCache ready');
        cookieCache.init();
        const p = cookieCache.ready(() => {
            console.timeEnd('cookieCache ready');
        });
        return p;
    }, 5000);
    test('cookieCache setItem', async () => {
        console.time('cookieCache setItem');
        for (const item of storeData) {
            await cookieCache.setItem(item.key, item.value);
        }
        console.timeEnd('cookieCache setItem');
    });
    test('cookieCache getItem', async () => {
        console.time('cookieCache getItem');
        for (let i = 0; i < 100; i++) {
            await cookieCache.getItem(`key-${i}`);
        }
        console.timeEnd('cookieCache getItem');
    });
    test('cookieCache getItemList', async () => {
        console.time('cookieCache getItemList');
        await cookieCache.getItemList(/^key-/);
        console.timeEnd('cookieCache getItemList');
    });
    test('cookieCache getAllItem', async () => {
        console.time('cookieCache getAllItem');
        await cookieCache.getAllItem();
        console.timeEnd('cookieCache getAllItem');
    });
    test('cookieCache existsKey', async () => {
        console.time('cookieCache existsKey');
        for (let i = 0; i < 100; i++) {
            await cookieCache.existsKey(`key-${i}`);
        }
        console.timeEnd('cookieCache existsKey');
    });
    test('cookieCache keys', async () => {
        console.time('cookieCache keys');
        await cookieCache.keys();
        console.timeEnd('cookieCache keys');
    });
    test('cookieCache length', async () => {
        console.time('cookieCache length');
        await cookieCache.length();
        console.timeEnd('cookieCache length');
    });

    test('cookieCache removeItem', async () => {
        console.time('cookieCache removeItem');
        for (let i = 0; i < 100; i++) {
            await cookieCache.removeItem(`key-${i}`);
        }
        console.timeEnd('cookieCache removeItem');
    });
    test('cookieCache setItemList', async () => {
        console.time('cookieCache setItemList');
        await cookieCache.setItemList(setStoreObject);
        console.timeEnd('cookieCache setItemList');
    });
    test('cookieCache removeItemList', async () => {
        console.time('cookieCache removeItemList');
        await cookieCache.removeItemList(/^key-/);
        console.timeEnd('cookieCache removeItemList');
    });
    test('cookieCache clear', async () => {
        await cookieCache.setItemList(setStoreObject);
        console.time('cookieCache clear');
        await cookieCache.clear();
        console.timeEnd('cookieCache clear');
    });
});
