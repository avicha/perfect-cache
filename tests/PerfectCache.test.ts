import { PerfectCache } from '../src';
import defaultOpts from '../src/defaultOpts';

describe('perfect cache should be correct', () => {
    test('new PerfectCache()', () => {
        const PerfectCacheInstance = new PerfectCache();
        expect(PerfectCacheInstance.opts).toStrictEqual(defaultOpts);
    });
    test('new PerfectCache(driver) valid', () => {
        const PerfectCacheInstance = new PerfectCache('memory');
        expect(PerfectCacheInstance.opts.driver).toBe('memory');
    });
    test('new PerfectCache(driver) invalid', () => {
        const initWithInvalidDriver = () => {
            new PerfectCache('invalid');
        };
        expect(initWithInvalidDriver).toThrow(
            'please input the correct driver param as the first param or in the opts params.'
        );
    });
});
