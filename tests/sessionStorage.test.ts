import { describe, beforeAll } from 'vitest';
import { PerfectCache, SessionStorageStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('sessionStorage cache should be correct', () => {
    const perfectCacheInstance1: PerfectCache<BaseStoreOptions, SessionStorageStore> = new PerfectCache(
        'sessionStorage',
        { prefix: '' }
    );
    const perfectCacheInstance2: PerfectCache<BaseStoreOptions, SessionStorageStore> = new PerfectCache(
        'sessionStorage',
        { prefix: 'sessionStorage-' }
    );
    beforeAll(() => Promise.all([perfectCacheInstance1.ready(), perfectCacheInstance2.ready()]), 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
});
