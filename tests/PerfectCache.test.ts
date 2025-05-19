import { describe, expect, test } from 'vitest';
import { PerfectCache } from '../src';
import defaultOpts from '../src/defaultOpts';

describe('perfect cache should be correct', () => {
    test('new PerfectCache() valid', () => {
        const perfectCacheInstance = new PerfectCache();
        expect(perfectCacheInstance.opts).toStrictEqual(defaultOpts);
        expect(perfectCacheInstance.opts.driver).toBe('memory');
        expect(perfectCacheInstance.store?.prefix).toBe('');
    });
    test('new PerfectCache(driver) valid', () => {
        const perfectCacheInstance = new PerfectCache('memory');
        expect(perfectCacheInstance.opts.driver).toBe('memory');
        expect(perfectCacheInstance.store?.prefix).toBe('');
    });
    test('new PerfectCache(opts) valid', () => {
        const perfectCacheInstance = new PerfectCache({ driver: 'localStorage', prefix: 'app:' });
        expect(perfectCacheInstance.opts.driver).toBe('localStorage');
        expect(perfectCacheInstance.store?.prefix).toBe('app:');
    });

    test('new PerfectCache(driver, opts) valid', () => {
        const perfectCacheInstance = new PerfectCache('localStorage', { prefix: 'app:' });
        expect(perfectCacheInstance.opts.driver).toBe('localStorage');
        expect(perfectCacheInstance.store?.prefix).toBe('app:');
    });
    test('new PerfectCache(driver) invalid', () => {
        const initWithInvalidDriver = () => {
            new PerfectCache('invalid');
        };
        expect(initWithInvalidDriver).toThrow(
            'please input the correct driver param as the first param or in the opts params.'
        );
    });
    test('new PerfectCache(undefined, driver) invalid', () => {
        const initWithInvalidFirstParam = () => {
            new PerfectCache(undefined, { prefix: 'app:' });
        };
        expect(initWithInvalidFirstParam).toThrow('please input the driver as first param.');
    });
    test('new PerfectCache(opts) invalid', () => {
        const initWithInvalidFirstParam = () => {
            new PerfectCache({ driver: 'invalid', prefix: 'app:' });
        };
        expect(initWithInvalidFirstParam).toThrow(
            'please input the correct driver param as the first param or in the opts params.'
        );
    });
    test('fallbackKey string normal', () => {
        const perfectCacheInstance = new PerfectCache('memory', { prefix: 'app:' });
        const key = 'test';
        perfectCacheInstance.fallbackKey(key, (fallbackKey) => {
            return fallbackKey;
        });
        expect(perfectCacheInstance.keyFallbacks.map((item) => item.key)).toContain(key);
    });
    test('fallbackKey regex normal', () => {
        const perfectCacheInstance = new PerfectCache('memory', { prefix: 'app:' });
        const keyRegex = /menu/;
        perfectCacheInstance.fallbackKey(keyRegex, (fallbackKey) => {
            return fallbackKey;
        });
        expect(perfectCacheInstance.keyRegexFallbacks.map((item) => item.regex)).toContain(keyRegex);
    });
    test('fallbackKey invalid', () => {
        const perfectCacheInstance = new PerfectCache('memory', { prefix: 'app:' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key: any = new Date();
        perfectCacheInstance.fallbackKey(key, (fallbackKey: string) => {
            return fallbackKey;
        });
        expect(perfectCacheInstance.keyFallbacks.findIndex((item) => item.key === key)).toBe(-1);
    });
    test('fallbackKey string, fallbackFunction invalid', () => {
        const perfectCacheInstance = new PerfectCache('memory', { prefix: 'app:' });
        const key = 'test';
        const fn = () => {
            perfectCacheInstance.fallbackKey(key, Promise.resolve('fallbackKey'));
        };
        expect(fn).toThrow('please input the fallback as type [Function]');
    });
    test('fallbackKey regex, fallbackFunction invalid', () => {
        const perfectCacheInstance = new PerfectCache('memory', { prefix: 'app:' });
        const keyRegex = /menu/;
        const fn = () => {
            perfectCacheInstance.fallbackKey(keyRegex, Promise.resolve('fallbackKey'));
        };
        expect(fn).toThrow('please input the fallback as type [Function]');
    });
});
