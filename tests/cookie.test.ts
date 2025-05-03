import { describe, beforeAll } from 'vitest';
import { PerfectCache, CookieStore } from '../src';
import { runTestCases } from './commonTestCase';
import type { BaseStoreOptions } from '../src/types';

describe('cookie cache should be correct', () => {
    const perfectCacheInstance: PerfectCache<BaseStoreOptions, CookieStore> = new PerfectCache('cookie');
    beforeAll(() => perfectCacheInstance.ready(), 5000);
    runTestCases(perfectCacheInstance);
});
