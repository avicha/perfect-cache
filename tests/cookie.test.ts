import { describe, beforeAll } from 'vitest';
import { PerfectCache, CookieStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('cookie cache should be correct', () => {
    const perfectCacheInstance1: PerfectCache<BaseStoreOptions, CookieStore> = new PerfectCache('cookie', {
        prefix: '',
    });
    const perfectCacheInstance2: PerfectCache<BaseStoreOptions, CookieStore> = new PerfectCache('cookie', {
        prefix: 'cookie-',
    });
    beforeAll(() => Promise.all([perfectCacheInstance1.ready(), perfectCacheInstance2.ready()]), 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
});
