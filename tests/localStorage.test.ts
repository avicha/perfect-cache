import { describe, beforeAll } from 'vitest';
import { PerfectCache, LocalStorageStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('localStorage cache should be correct', () => {
    const perfectCacheInstance1: PerfectCache<BaseStoreOptions, LocalStorageStore> = new PerfectCache('localStorage', {
        prefix: '',
    });
    const perfectCacheInstance2: PerfectCache<BaseStoreOptions, LocalStorageStore> = new PerfectCache('localStorage', {
        prefix: 'localStorage-',
    });
    beforeAll(() => {
        return Promise.all([
            new Promise((resolve) => {
                perfectCacheInstance1.ready(resolve);
            }),
            new Promise((resolve) => {
                perfectCacheInstance2.ready(resolve);
            }),
        ]);
    }, 5000);
    runTestCases(perfectCacheInstance1);
    runTestCases(perfectCacheInstance2);
});
