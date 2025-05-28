import { beforeAll, beforeEach, expect, test, assert } from 'vitest';
import { PerfectCache, StoreResult } from '../src';

const sleep = (ms: number) => {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve(true);
        }, ms);
    });
};
const fallbackValue = 'i am fallback value of';
const defaultValue = { a: 1, b: 2 };
const expiredTime = 500;
const sleepTime = 300;
const runTestCases = (perfectCacheInstance: InstanceType<typeof PerfectCache>) => {
    beforeAll(() => {
        perfectCacheInstance.fallbackKey('emptyString', (_FallbackKey) => {
            return '';
        });
        perfectCacheInstance.fallbackKey('undefined', (_FallbackKey) => {
            return undefined;
        });
        perfectCacheInstance.fallbackKey(
            /^cacheExpiredTime/,
            (fallbackKey) => {
                return `${fallbackValue} ${fallbackKey}`;
            },
            { expiredTime: expiredTime }
        );
        perfectCacheInstance.fallbackKey(
            /^cacheMaxAge/,
            (fallbackKey) => {
                return `${fallbackValue} ${fallbackKey}`;
            },
            { maxAge: expiredTime }
        );
    });
    beforeEach(async () => {
        await perfectCacheInstance.clear();
    });
    test('driver is ready', () => {
        const isReady = perfectCacheInstance.isReady();
        expect(isReady).toBeTruthy();
    });
    // 测试非空值的时候，获取到存储值
    test('getItem not null and should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，不使用后备值，没有默认值，获取到空值
    test('getItem null and withFallback false and has not defaultVal should return undefined', async () => {
        const value = await perfectCacheInstance.getItem('key', { withFallback: false });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，不使用后备值，有默认值，获取到默认值
    test('getItem null and withFallback false and has defaultVal should return defaultVal', async () => {
        const value = await perfectCacheInstance.getItem('key', { withFallback: false, defaultVal: defaultValue });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，但没有命中后备值，没有默认值，获取到空值
    test('getItem null and withFallback true but not found and has not defaultVal should return undefined', async () => {
        const value = await perfectCacheInstance.getItem('key', { withFallback: true });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，但没有命中后备值，有默认值，获取到默认值
    test('getItem null and withFallback true but not found and has defaultVal should return defaultVal', async () => {
        const value = await perfectCacheInstance.getItem('key', { withFallback: true, defaultVal: defaultValue });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    test('getItem null and withFallback true and found fallback value and has not defaultVal should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('emptyString', { withFallback: true });
        expect(value).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，有默认值，获取到命中后备值
    test('getItem null and withFallback true and found fallback value and has defaultVal should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('emptyString', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，没有默认值，获取到空
    test('getItem null and withFallback true and found fallback value null and has not defaultVal should return null', async () => {
        const value = await perfectCacheInstance.getItem('undefined', { withFallback: true });
        expect(value).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，有默认值，获取到默认值
    test('getItem null and withFallback true and found fallback value and has defaultVal should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('undefined', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 正常刷新缓存，下次不使用后备值也可以获取到后备值，跟默认值没有关系
    test('getItem null and withFallback true and found fallback value and has not defaultVal and refreshCache true should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('emptyString', { withFallback: true });
        expect(value1).eq('');
        const value2 = await perfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value2).eq('');
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 后备值为空，不刷新缓存，下次不使用后备值还是获取不到值
    test('getItem null and withFallback true and found fallback value null and has not defaultVal and refreshCache true should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('undefined', { withFallback: true });
        expect(value1).toBeUndefined();
        const value2 = await perfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，没有默认值，获取到命中后备值
    // 不刷新缓存，下次不使用后备值就获取不到后备值
    test('getItem null and withFallback true and found fallback value and has not defaultVal and refreshCache false should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('emptyString', { withFallback: true, refreshCache: false });
        expect(value1).eq('');
        const value2 = await perfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值空，有默认值，获取到默认值
    // 后备值为空，不刷新缓存，下次不使用后备值还是获取不到值
    test('getItem null and withFallback true and found fallback value null and has defaultVal and refreshCache true should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('undefined', {
            withFallback: true,
            defaultVal: defaultValue,
        });
        expect(value1).toStrictEqual(defaultValue);
        const value2 = await perfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value2).toBeUndefined();
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，有默认值，获取到命中后备值
    // 不刷新缓存，下次不使用后备值就获取不到后备值
    test('getItem null and withFallback true and found fallback value and has defaultVal and refreshCache false should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('emptyString', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('emptyString', {
            withFallback: true,
            defaultVal: defaultValue,
            refreshCache: false,
        });
        expect(value1).eq('');
        const value2 = await perfectCacheInstance.getItem('emptyString', {
            withFallback: false,
            defaultVal: defaultValue,
        });
        expect(value2).toStrictEqual(defaultValue);
    });
    // 测试没有值的时候，使用后备值，可以命中后备值，有默认值，获取到命中后备值
    // 不刷新缓存，下次不使用后备值就获取不到后备值
    test('getItem null and withFallback true and found fallback value null and has defaultVal and refreshCache false should return fallback value', async () => {
        const value = await perfectCacheInstance.getItem('undefined', { withFallback: false });
        expect(value).toBeUndefined();
        const value1 = await perfectCacheInstance.getItem('undefined', {
            withFallback: true,
            defaultVal: defaultValue,
            refreshCache: false,
        });
        expect(value1).toStrictEqual(defaultValue);
        const value2 = await perfectCacheInstance.getItem('undefined', {
            withFallback: false,
            defaultVal: defaultValue,
        });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('existsKey should return true', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const exists = await perfectCacheInstance.existsKey('key');
        expect(exists).toBeTruthy();
    });
    test('existsKey should return false', async () => {
        const exists = await perfectCacheInstance.existsKey('key');
        expect(exists).toBeFalsy();
    });
    test('removeItem should success', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue);
        expect(result).eq(StoreResult.OK);
        const removeResult = await perfectCacheInstance.removeItem('key');
        expect(removeResult).eq(void 0);
        const exists = await perfectCacheInstance.existsKey('key');
        expect(exists).toBeFalsy();
    });
    test('clear should success', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const clearResult1 = await perfectCacheInstance.clear();
        expect(clearResult1).eq(void 0);
        const exists1 = await perfectCacheInstance.existsKey('key1');
        expect(exists1).toBeFalsy();
        const exists2 = await perfectCacheInstance.existsKey('key2');
        expect(exists2).toBeFalsy();
        const clearResult2 = await perfectCacheInstance.clear();
        expect(clearResult2).eq(void 0);
    });
    test('keys should return all keys', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await perfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const keys1 = await perfectCacheInstance.keys();
        assert.sameMembers(keys1, ['key1', 'key2', 'key3']);
        const clearResult = await perfectCacheInstance.clear();
        expect(clearResult).eq(void 0);
        const keys2 = await perfectCacheInstance.keys();
        assert.sameMembers(keys2, []);
        const result4 = await perfectCacheInstance.setItem('key4', 'key4');
        expect(result4).eq(StoreResult.OK);
        const keys3 = await perfectCacheInstance.keys();
        assert.sameMembers(keys3, ['key4']);
    });
    test('length should return all keys length', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await perfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const length1 = await perfectCacheInstance.length();
        expect(length1).eq(3);
        const clearResult = await perfectCacheInstance.clear();
        expect(clearResult).eq(void 0);
        const length2 = await perfectCacheInstance.length();
        expect(length2).eq(0);
    });
    test('getItemList with keys should return all values', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await perfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const result4 = await perfectCacheInstance.setItem('string', 'string');
        expect(result4).eq(StoreResult.OK);
        const result5 = await perfectCacheInstance.setItem('number', 123);
        expect(result5).eq(StoreResult.OK);
        const result6 = await perfectCacheInstance.setItem('boolean', true);
        expect(result6).eq(StoreResult.OK);
        const result7 = await perfectCacheInstance.setItem('object', { a: 1, b: 2 });
        expect(result7).eq(StoreResult.OK);
        const result8 = await perfectCacheInstance.setItem('array', [1, 2, 3]);
        expect(result8).eq(StoreResult.OK);
        const result9 = await perfectCacheInstance.setItem('null', null);
        expect(result9).eq(StoreResult.OK);
        const result10 = await perfectCacheInstance.setItem('undefined', undefined);
        expect(result10).eq(StoreResult.OK);
        const getItemListResult1 = await perfectCacheInstance.getItemList(
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
        const getItemListResult2 = await perfectCacheInstance.getItemList(/^key/);
        expect(getItemListResult2).toStrictEqual({
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
        });
        const getItemListResult3 = await perfectCacheInstance.getItemList(['key0', 'key1', 'key2', 'key3']);
        expect(getItemListResult3).toStrictEqual({
            key0: undefined,
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
        });
        const getItemListResult4 = await perfectCacheInstance.getItemList(new RegExp('not_exists_key[0-9]'));
        expect(getItemListResult4).toStrictEqual({});
        const getAllItemResult = await perfectCacheInstance.getAllItem();
        expect(getAllItemResult).toStrictEqual({
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
            string: 'string',
            number: 123,
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
            undefined: undefined,
        });
    });
    test('removeItemList should success', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await perfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const result4 = await perfectCacheInstance.setItem('string', 'string');
        expect(result4).eq(StoreResult.OK);
        const result5 = await perfectCacheInstance.setItem('number', 123);
        expect(result5).eq(StoreResult.OK);
        const result6 = await perfectCacheInstance.setItem('boolean', true);
        expect(result6).eq(StoreResult.OK);
        const result7 = await perfectCacheInstance.setItem('object', { a: 1, b: 2 });
        expect(result7).eq(StoreResult.OK);
        const result8 = await perfectCacheInstance.setItem('array', [1, 2, 3]);
        expect(result8).eq(StoreResult.OK);
        const result9 = await perfectCacheInstance.setItem('null', null);
        expect(result9).eq(StoreResult.OK);
        const result10 = await perfectCacheInstance.setItem('undefined', undefined);
        expect(result10).eq(StoreResult.OK);
        const removeItemListResult1 = await perfectCacheInstance.removeItemList([
            'key0',
            'string',
            'number',
            'undefined',
        ]);
        expect(removeItemListResult1).eq(void 0);
        const getAllItemResult1 = await perfectCacheInstance.getAllItem();
        expect(getAllItemResult1).toStrictEqual({
            key1: 'key1',
            key2: 'key2',
            key3: 'key3',
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
        });
        const getItemListResult1 = await perfectCacheInstance.getItemList(['key0', 'string', 'number', 'undefined']);
        expect(getItemListResult1).toStrictEqual({
            key0: undefined,
            string: undefined,
            number: undefined,
            undefined: undefined,
        });
        const removeItemListResult2 = await perfectCacheInstance.removeItemList(/^key[0-9]/);
        expect(removeItemListResult2).eq(void 0);
        const getItemListResult2 = await perfectCacheInstance.getItemList(/^key[0-9]/);
        expect(getItemListResult2).toStrictEqual({});
        const getAllItemResult2 = await perfectCacheInstance.getAllItem();
        expect(getAllItemResult2).toStrictEqual({
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
        });
    });
    test('setItem with expiredTime and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, { expiredTime: expiredTime });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toBeUndefined();
    });
    test('setItem with expiredTime and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { expiredTime: expiredTime });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(1500);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toBeUndefined();
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with expiredTimeAt and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, {
            expiredTimeAt: Date.now() + expiredTime,
        });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toBeUndefined();
    });
    test('setItem with expiredTimeAt and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { expiredTimeAt: Date.now() + expiredTime });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(sleepTime * 2);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toBeUndefined();
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with maxAge and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, { maxAge: expiredTime });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(sleepTime);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with maxAge and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { maxAge: expiredTime });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(sleepTime);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).eq('value');
        await sleep(sleepTime);
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).eq('value');
        await sleep(sleepTime * 2);
        const value3 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value3).toStrictEqual(defaultValue);
    });
    test('setItem with setOnlyNotExist true and key exists', async () => {
        const result1 = await perfectCacheInstance.setItem('key', 'value1');
        expect(result1).eq(StoreResult.OK);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).eq('value1');
        const result2 = await perfectCacheInstance.setItem('key', 'value2', { setOnlyNotExist: true });
        expect(result2).eq(StoreResult.NX_SET_NOT_PERFORMED);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).eq('value1');
        const result3 = await perfectCacheInstance.setItem('key', 'value2');
        expect(result3).eq(StoreResult.OK);
        const value3 = await perfectCacheInstance.getItem('key');
        expect(value3).eq('value2');
    });
    test('setItem with setOnlyNotExist true and key not exists', async () => {
        const result1 = await perfectCacheInstance.setItem('key', 'value1', { setOnlyNotExist: true });
        expect(result1).eq(StoreResult.OK);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).eq('value1');
        const result2 = await perfectCacheInstance.setItem('key', 'value2', { setOnlyNotExist: true });
        expect(result2).eq(StoreResult.NX_SET_NOT_PERFORMED);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).eq('value1');
    });
    test('setItem with setOnlyExist true and key not exists', async () => {
        const result1 = await perfectCacheInstance.setItem('key', 'value1', { setOnlyExist: true });
        expect(result1).eq(StoreResult.XX_SET_NOT_PERFORMED);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toBeUndefined();
    });
    test('setItem with setOnlyExist true and key exists', async () => {
        const result1 = await perfectCacheInstance.setItem('key', 'value1');
        expect(result1).eq(StoreResult.OK);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).eq('value1');
        const result2 = await perfectCacheInstance.setItem('key', 'value2', { setOnlyExist: true });
        expect(result2).eq(StoreResult.OK);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).eq('value2');
    });
    test('setItemList with keys should success', async () => {
        const setItemListResult1 = await perfectCacheInstance.setItemList({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
            string: 'string',
            number: 123,
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
            undefined: undefined,
        });
        expect(setItemListResult1).eq(void 0);
        const keys1 = await perfectCacheInstance.keys();
        assert.sameMembers(keys1, [
            'key1',
            'key2',
            'key3',
            'string',
            'number',
            'boolean',
            'object',
            'array',
            'null',
            'undefined',
        ]);
        const getItemListResult1 = await perfectCacheInstance.getItemList();
        expect(getItemListResult1).toStrictEqual({});
        const getAllItem1 = await perfectCacheInstance.getAllItem();
        expect(getAllItem1).toStrictEqual({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
            string: 'string',
            number: 123,
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
            undefined: undefined,
        });
        const setItemListResult2 = await perfectCacheInstance.setItemList(
            { boolean: false, number: 456 },
            { setOnlyNotExist: true }
        );
        expect(setItemListResult2).eq(void 0);
        const getAllItem2 = await perfectCacheInstance.getAllItem();
        expect(getAllItem2).toStrictEqual({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
            string: 'string',
            number: 123,
            boolean: true,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
            undefined: undefined,
        });
        const setItemListResult3 = await perfectCacheInstance.setItemList(
            { boolean: false, number: 456 },
            { setOnlyExist: true }
        );
        expect(setItemListResult3).eq(void 0);
        const getAllItem3 = await perfectCacheInstance.getAllItem();
        expect(getAllItem3).toStrictEqual({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
            string: 'string',
            number: 456,
            boolean: false,
            object: { a: 1, b: 2 },
            array: [1, 2, 3],
            null: null,
            undefined: undefined,
        });
    });
    test('getItem null and fallback key with expiredTime', async () => {
        const result1 = await perfectCacheInstance.getItem('cacheExpiredTime_key');
        expect(result1).eq(`${fallbackValue} cacheExpiredTime_key`);
        await sleep(sleepTime);
        const result2 = await perfectCacheInstance.getItem('cacheExpiredTime_key', { withFallback: false });
        expect(result2).eq(`${fallbackValue} cacheExpiredTime_key`);
        await sleep(sleepTime);
        const result3 = await perfectCacheInstance.getItem('cacheExpiredTime_key', { withFallback: false });
        expect(result3).toBeUndefined();
    });
    test('getItem null and fallback key with maxAge', async () => {
        const result1 = await perfectCacheInstance.getItem('cacheMaxAge_key');
        expect(result1).eq(`${fallbackValue} cacheMaxAge_key`);
        await sleep(sleepTime);
        const result2 = await perfectCacheInstance.getItem('cacheMaxAge_key', { withFallback: false });
        expect(result2).eq(`${fallbackValue} cacheMaxAge_key`);
        await sleep(sleepTime);
        const result3 = await perfectCacheInstance.getItem('cacheMaxAge_key', { withFallback: false });
        expect(result3).eq(`${fallbackValue} cacheMaxAge_key`);
    });
    test('setItem with value circular structure should be fail', async () => {
        const setItemFunc = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value: { [key: string]: any } = { a: 1, b: 2, self: undefined };
            value.self = value;
            return perfectCacheInstance.setItem('key', value);
        };
        if (perfectCacheInstance.driver !== 'indexedDB') {
            await expect(setItemFunc).rejects.toThrowError('Converting circular structure to JSON');
        } else {
            await expect(setItemFunc()).resolves.not.toThrowError();
            await expect(setItemFunc()).resolves.toEqual(StoreResult.OK);
        }
    });
};
export { runTestCases };
