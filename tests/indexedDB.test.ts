import { describe, beforeAll } from 'vitest';
import { PerfectCache, IndexedDBStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('indexedDB cache should be correct', () => {
    const perfectCacheInstance1: PerfectCache<BaseStoreOptions, IndexedDBStore> = new PerfectCache('indexedDB', {
        dbName: 'perfect-cache-test1',
        prefix: '',
    });
    const perfectCacheInstance2: PerfectCache<BaseStoreOptions, IndexedDBStore> = new PerfectCache('indexedDB', {
        dbName: 'perfect-cache-test2',
        prefix: 'indexedDB-',
    });
    const p1 = perfectCacheInstance1.ready(() => {
        console.log('IndexedDB cache is ready');
    });
    const p2 = perfectCacheInstance2.ready();
    beforeAll(() => Promise.all([p1, p2]), 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
});
