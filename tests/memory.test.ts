import { describe, beforeAll } from 'vitest';
import { PerfectCache, MemoryStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('sessionStorage cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, MemoryStore> = new PerfectCache('memory');
    beforeAll(() => perfectCacheInstance.ready(), 5000);
    runTestCases(perfectCacheInstance);
});
