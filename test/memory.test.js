import { PerfectCache } from '../src';
describe('memory cache should be correct', () => {
    let PerfectCacheInstance;
    beforeAll(() => {
        PerfectCacheInstance = new PerfectCache();
    });
    test('key not exists', async () => {
        const value = await PerfectCacheInstance.getItem('key');
        expect(value).toBeUndefined();
    });
});
