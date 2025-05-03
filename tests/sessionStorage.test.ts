import { describe, beforeAll } from 'vitest';
import { PerfectCache, SessionStorageStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('sessionStorage cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, SessionStorageStore> = new PerfectCache(
        'sessionStorage'
    );
    beforeAll(() => perfectCacheInstance.ready(), 5000);
    runTestCases(perfectCacheInstance);
});
