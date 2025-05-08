import { describe, beforeAll } from 'vitest';
import { PerfectCache, LocalStorageStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('localStorage cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, LocalStorageStore> = new PerfectCache('localStorage');
    beforeAll(() => {
        return new Promise((resolve) => {
            perfectCacheInstance.ready(resolve);
        });
    }, 5000);
    runTestCases(perfectCacheInstance);
});
