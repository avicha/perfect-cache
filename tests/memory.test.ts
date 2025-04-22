import { beforeAll, describe, expect, test } from 'vitest';
import { PerfectCache, MemoryStore } from '../src';
import type { BaseStoreOptions } from '../src/types';

describe('memory cache should be correct', () => {
    let PerfectCacheInstance: PerfectCache<BaseStoreOptions, MemoryStore>;
    beforeAll(() => {
        PerfectCacheInstance = new PerfectCache();
    });
    test('key not exists', async () => {
        const value = await PerfectCacheInstance.getItem('key');
        expect(value).toBeUndefined();
    });
});
