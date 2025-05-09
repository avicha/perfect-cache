import { describe, beforeAll } from 'vitest';
import { PerfectCache, IndexedDBStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('indexedDB cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, IndexedDBStore> = new PerfectCache('indexedDB');
    const p = perfectCacheInstance.ready(() => {
        console.log('IndexedDB cache is ready');
    });
    beforeAll(() => p, 5000);
    runTestCases(perfectCacheInstance);
});
