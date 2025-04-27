import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { PerfectCache, MemoryStore, StoreResult } from '../src';
import type { BaseStoreOptions } from '../src/types';

describe('memory cache should be correct', () => {
    let PerfectCacheInstance: PerfectCache<BaseStoreOptions, MemoryStore>;
    const fallbackValue = 'i am fallback value of';
    const defaultValue = { a: 1, b: 2 };
    beforeAll(() => {
        PerfectCacheInstance = new PerfectCache();
        PerfectCacheInstance.fallbackKey('emptyString', (_FallbackKey) => {
            return '';
        });
        PerfectCacheInstance.fallbackKey('undefined', (_FallbackKey) => {
            return undefined;
        });
        PerfectCacheInstance.fallbackKey(/^cache/, (fallbackKey) => {
            return `${fallbackValue} ${fallbackKey}`;
        });
        return new Promise((resolve) => {
            PerfectCacheInstance.$on('ready', resolve);
        });
    });
    beforeEach(async () => {
        await PerfectCacheInstance.clear();
    });
    // 测试非空值的时候，获取到存储值
    test('getItem not null and should return the value', async () => {
        const result = await PerfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const value = await PerfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，不使用后备值，没有默认值，获取到空值
    test('getItem null and withFallback false and has not defaultVal should return undefined', async () => {
        const value = await PerfectCacheInstance.getItem('key', { withFallback: false });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，不使用后备值，有默认值，获取到默认值
    test('getItem null and withFallback false and has defaultVal should return defaultVal', async () => {
        const value = await PerfectCacheInstance.getItem('key', { withFallback: false, defaultVal: defaultValue });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，但没有命中后备值，没有默认值，获取到空值
    test('getItem null and withFallback true but not found and has not defaultVal should return undefined', async () => {
        const value = await PerfectCacheInstance.getItem('key', { withFallback: true });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，但没有命中后备值，有默认值，获取到默认值
    test('getItem null and withFallback true but not found and has defaultVal should return defaultVal', async () => {
        const value = await PerfectCacheInstance.getItem('key', { withFallback: true, defaultVal: defaultValue });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    test('getItem null and withFallback true and found fallback value and has not defaultVal should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('emptyString', { withFallback: true });
        expect(value).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，有默认值，获取到命中后备值
    test('getItem null and withFallback true and found fallback value and has defaultVal should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('emptyString', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，没有默认值，获取到空
    test('getItem null and withFallback true and found fallback value null and has not defaultVal should return null', async () => {
        const value = await PerfectCacheInstance.getItem('undefined', { withFallback: true });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，有默认值，获取到默认值
    test('getItem null and withFallback true and found fallback value and has defaultVal should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('undefined', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 正常刷新缓存，下次不使用后备值也可以获取到后备值，跟默认值没有关系
    test('getItem null and withFallback true and found fallback value and has not defaultVal and refreshCache true should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await PerfectCacheInstance.getItem('emptyString', { withFallback: true });
        expect(value1).eq('');
        const value2 = await PerfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value2).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 后备值为空，不刷新缓存，下次不使用后备值还是获取不到值
    test('getItem null and withFallback true and found fallback value null and has not defaultVal and refreshCache true should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await PerfectCacheInstance.getItem('undefined', { withFallback: true });
        expect(value1).toBeUndefined();
        const value2 = await PerfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，有默认值，获取到默认值
    // 后备值为空，不刷新缓存，下次不使用后备值还是获取不到值
    test('getItem null and withFallback true and found fallback value null and has defaultVal and refreshCache true should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await PerfectCacheInstance.getItem('undefined', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value1).toStrictEqual(defaultValue);
        const value2 = await PerfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 不刷新缓存，下次不使用后备值就获取不到后备值
    test('getItem null and withFallback true and found fallback value and has not defaultVal and refreshCache false should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await PerfectCacheInstance.getItem('emptyString', { withFallback: true, refreshCache: false });
        expect(value1).eq('');
        const value2 = await PerfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，有默认值，获取到命中后备值
    // 不刷新缓存，下次不使用后备值就获取不到后备值
    test('getItem null and withFallback true and found fallback value and has defaultVal and refreshCache false should return fallback value', async () => {
        const value = await PerfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await PerfectCacheInstance.getItem('emptyString', {
            withFallback: true,
            defaultVal: defaultValue,
            refreshCache: false,
        });
        expect(value1).eq('');
        const value2 = await PerfectCacheInstance.getItem('emptyString', {
            withFallback: false,
            defaultVal: defaultValue,
        });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('existsKey should return true', async () => {
        const result = await PerfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const exists = await PerfectCacheInstance.existsKey('key');
        expect(exists).toBeTruthy();
    });
    test('existsKey should return false', async () => {
        const exists = await PerfectCacheInstance.existsKey('key');
        expect(exists).toBeFalsy();
    });
    test('removeItem should success', async () => {
        const result = await PerfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const removeResult = await PerfectCacheInstance.removeItem('key');
        expect(removeResult).eq(void 0);
        const exists = await PerfectCacheInstance.existsKey('key');
        expect(exists).toBeFalsy();
    });
    test('clear should success', async () => {
        const result1 = await PerfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await PerfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const clearResult1 = await PerfectCacheInstance.clear();
        expect(clearResult1).eq(2);
        const exists1 = await PerfectCacheInstance.existsKey('key1');
        expect(exists1).toBeFalsy();
        const exists2 = await PerfectCacheInstance.existsKey('key2');
        expect(exists2).toBeFalsy();
        const clearResult2 = await PerfectCacheInstance.clear();
        expect(clearResult2).eq(0);
    });
    test('keys should return all keys', async () => {
        const result1 = await PerfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await PerfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await PerfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const keys1 = await PerfectCacheInstance.keys();
        expect(keys1).toStrictEqual(['key1', 'key2', 'key3']);
        const clearResult = await PerfectCacheInstance.clear();
        expect(clearResult).eq(3);
        const keys2 = await PerfectCacheInstance.keys();
        expect(keys2).toStrictEqual([]);
        const result4 = await PerfectCacheInstance.setItem('key4', 'key4');
        expect(result4).eq(StoreResult.OK);
        const keys3 = await PerfectCacheInstance.keys();
        expect(keys3).toStrictEqual(['key4']);
    });
    test('length should return all keys length', async () => {
        const result1 = await PerfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await PerfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await PerfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const length1 = await PerfectCacheInstance.length();
        expect(length1).eq(3);
        const clearResult = await PerfectCacheInstance.clear();
        expect(clearResult).eq(3);
        const length2 = await PerfectCacheInstance.length();
        expect(length2).eq(0);
    });
    test('getItemList with keys should return all values', async () => {
        const result1 = await PerfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await PerfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await PerfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const result4 = await PerfectCacheInstance.setItem('string', 'string');
        expect(result4).eq(StoreResult.OK);
        const result5 = await PerfectCacheInstance.setItem('number', 123);
        expect(result5).eq(StoreResult.OK);
        const result6 = await PerfectCacheInstance.setItem('boolean', true);
        expect(result6).eq(StoreResult.OK);
        const result7 = await PerfectCacheInstance.setItem('object', { a: 1, b: 2 });
        expect(result7).eq(StoreResult.OK);
        const result8 = await PerfectCacheInstance.setItem('array', [1, 2, 3]);
        expect(result8).eq(StoreResult.OK);
        const result9 = await PerfectCacheInstance.setItem('null', null);
        expect(result9).eq(StoreResult.OK);
        const result10 = await PerfectCacheInstance.setItem('undefined', undefined);
        expect(result10).eq(StoreResult.OK);
        const getItemListResult1 = await PerfectCacheInstance.getItemList(
            ['key1', 'key2', 'key3', 'string', 'number', 'undefined'],
            { defaultVal: defaultValue }
        );
        expect(getItemListResult1).toStrictEqual({
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
            string: 'string',
            number: 123,
            undefined: defaultValue,
        });
        const getItemListResult2 = await PerfectCacheInstance.getItemList(/^key/);
        expect(getItemListResult2).toStrictEqual({
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
        });
        const getItemListResult3 = await PerfectCacheInstance.getItemList(['key0', 'key1', 'key2', 'key3']);
        expect(getItemListResult3).toStrictEqual({
            key0: undefined,
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
        });
        const getItemListResult4 = await PerfectCacheInstance.getItemList(new RegExp('not_exists_key[0-9]'));
        expect(getItemListResult4).toStrictEqual({});
    });
    test('removeItemList should success', async () => {
        const result1 = await PerfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await PerfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await PerfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const result4 = await PerfectCacheInstance.setItem('string', 'string');
        expect(result4).eq(StoreResult.OK);
        const result5 = await PerfectCacheInstance.setItem('number', 123);
        expect(result5).eq(StoreResult.OK);
        const result6 = await PerfectCacheInstance.setItem('boolean', true);
        expect(result6).eq(StoreResult.OK);
        const result7 = await PerfectCacheInstance.setItem('object', { a: 1, b: 2 });
        expect(result7).eq(StoreResult.OK);
        const result8 = await PerfectCacheInstance.setItem('array', [1, 2, 3]);
        expect(result8).eq(StoreResult.OK);
        const result9 = await PerfectCacheInstance.setItem('null', null);
        expect(result9).eq(StoreResult.OK);
        const result10 = await PerfectCacheInstance.setItem('undefined', undefined);
        expect(result10).eq(StoreResult.OK);
        const removeItemListResult1 = await PerfectCacheInstance.removeItemList([
            'key0',
            'string',
            'number',
            'undefined',
        ]);
        expect(removeItemListResult1).eq(void 0);
        const getItemListResult1 = await PerfectCacheInstance.getItemList(['key0', 'string', 'number', 'undefined']);
        expect(getItemListResult1).toStrictEqual({
            key0: undefined,
            string: undefined,
            number: undefined,
            undefined: undefined,
        });
        const removeItemListResult2 = await PerfectCacheInstance.removeItemList(/^key[0-9]/);
        expect(removeItemListResult2).eq(void 0);
        const getItemListResult2 = await PerfectCacheInstance.getItemList(/^key[0-9]/);
        expect(getItemListResult2).toStrictEqual({});
    });
});
