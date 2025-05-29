import { describe, beforeAll } from 'vitest';
import { PerfectCache, CookieStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('cookie cache should be correct', () => {
    const perfectCacheInstance1 = new PerfectCache<BaseStoreOptions, CookieStore>('cookie', {
        prefix: '',
    });
    const perfectCacheInstance2 = new PerfectCache<BaseStoreOptions, CookieStore>('cookie', {
        prefix: 'cookie-',
    });
    beforeAll(() => Promise.all([perfectCacheInstance1.ready(), perfectCacheInstance2.ready()]), 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
});
