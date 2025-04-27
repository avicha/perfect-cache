import { describe, expect, test } from 'vitest';
import { PerfectCache } from 'perfect-cache';
import defaultOpts from '../src/defaultOpts';

describe('perfect cache should be correct', () => {
    test('new PerfectCache() valid', () => {
        const PerfectCacheInstance = new PerfectCache();
        expect(PerfectCacheInstance.opts).toStrictEqual(defaultOpts);
        expect(PerfectCacheInstance.opts.driver).toBe('memory');
        expect(PerfectCacheInstance.store?.prefix).toBe('cache:');
    });
    test('new PerfectCache(driver) valid', () => {
        const PerfectCacheInstance = new PerfectCache('memory');
        expect(PerfectCacheInstance.opts.driver).toBe('memory');
        expect(PerfectCacheInstance.store?.prefix).toBe('cache:');
    });
    test('new PerfectCache(opts) valid', () => {
        const PerfectCacheInstance = new PerfectCache({ driver: 'localStorage', prefix: 'app:' });
        expect(PerfectCacheInstance.opts.driver).toBe('localStorage');
        expect(PerfectCacheInstance.store?.prefix).toBe('app:');
    });

    test('new PerfectCache(driver, opts) valid', () => {
        const PerfectCacheInstance = new PerfectCache('localStorage', { prefix: 'app:' });
        expect(PerfectCacheInstance.opts.driver).toBe('localStorage');
        expect(PerfectCacheInstance.store?.prefix).toBe('app:');
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
});
