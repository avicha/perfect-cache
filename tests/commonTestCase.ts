import { beforeAll, beforeEach, expect, test } from 'vitest';
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
            { expiredTime: 200 }
        );
        perfectCacheInstance.fallbackKey(
            /^cacheMaxAge/,
            (fallbackKey) => {
                return `${fallbackValue} ${fallbackKey}`;
            },
            { maxAge: 200 }
        );
    });
    beforeEach(async () => {
        await perfectCacheInstance.clear();
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
        expect(clearResult1).eq(2);
        const exists1 = await perfectCacheInstance.existsKey('key1');
        expect(exists1).toBeFalsy();
        const exists2 = await perfectCacheInstance.existsKey('key2');
        expect(exists2).toBeFalsy();
        const clearResult2 = await perfectCacheInstance.clear();
        expect(clearResult2).eq(0);
    });
    test('keys should return all keys', async () => {
        const result1 = await perfectCacheInstance.setItem('key1', 'key1');
        expect(result1).eq(StoreResult.OK);
        const result2 = await perfectCacheInstance.setItem('key2', 'key2');
        expect(result2).eq(StoreResult.OK);
        const result3 = await perfectCacheInstance.setItem('key3', 'key3');
        expect(result3).eq(StoreResult.OK);
        const keys1 = await perfectCacheInstance.keys();
        expect(keys1).toStrictEqual(['key1', 'key2', 'key3']);
        const clearResult = await perfectCacheInstance.clear();
        expect(clearResult).eq(3);
        const keys2 = await perfectCacheInstance.keys();
        expect(keys2).toStrictEqual([]);
        const result4 = await perfectCacheInstance.setItem('key4', 'key4');
        expect(result4).eq(StoreResult.OK);
        const keys3 = await perfectCacheInstance.keys();
        expect(keys3).toStrictEqual(['key4']);
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
        expect(clearResult).eq(3);
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
    });
    test('setItem with expiredTime and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, { expiredTime: 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(150);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(150);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toBeUndefined();
    });
    test('setItem with expiredTime and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { expiredTime: 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(300);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toBeUndefined();
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with expiredTimeAt and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, { expiredTimeAt: Date.now() + 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(150);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(150);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toBeUndefined();
    });
    test('setItem with expiredTimeAt and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { expiredTimeAt: Date.now() + 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(300);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toBeUndefined();
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with maxAge and get with not expired should return the value', async () => {
        const result = await perfectCacheInstance.setItem('key', defaultValue, { maxAge: 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).toStrictEqual(defaultValue);
        await sleep(150);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).toStrictEqual(defaultValue);
        await sleep(150);
        const value2 = await perfectCacheInstance.getItem('key');
        expect(value2).toStrictEqual(defaultValue);
    });
    test('setItem with maxAge and get with expired should return the default value or undefined', async () => {
        const result = await perfectCacheInstance.setItem('key', 'value', { maxAge: 200 });
        expect(result).eq(StoreResult.OK);
        const value = await perfectCacheInstance.getItem('key');
        expect(value).eq('value');
        await sleep(150);
        const value1 = await perfectCacheInstance.getItem('key');
        expect(value1).eq('value');
        await sleep(150);
        const value2 = await perfectCacheInstance.getItem('key', { defaultVal: defaultValue });
        expect(value2).eq('value');
        await sleep(300);
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
    test('getItem null and fallback key with expiredTime', async () => {
        const result1 = await perfectCacheInstance.getItem('cacheExpiredTime_key');
        expect(result1).eq(`${fallbackValue} cacheExpiredTime_key`);
        await sleep(150);
        const result2 = await perfectCacheInstance.getItem('cacheExpiredTime_key', { withFallback: false });
        expect(result2).eq(`${fallbackValue} cacheExpiredTime_key`);
        await sleep(150);
        const result3 = await perfectCacheInstance.getItem('cacheExpiredTime_key', { withFallback: false });
        expect(result3).toBeUndefined();
    });
    test('getItem null and fallback key with maxAge', async () => {
        const result1 = await perfectCacheInstance.getItem('cacheMaxAge_key');
        expect(result1).eq(`${fallbackValue} cacheMaxAge_key`);
        await sleep(150);
        const result2 = await perfectCacheInstance.getItem('cacheMaxAge_key', { withFallback: false });
        expect(result2).eq(`${fallbackValue} cacheMaxAge_key`);
        await sleep(150);
        const result3 = await perfectCacheInstance.getItem('cacheMaxAge_key', { withFallback: false });
        expect(result3).eq(`${fallbackValue} cacheMaxAge_key`);
    });
};
export { runTestCases };
