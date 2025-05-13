import { describe, test, expect, vi } from 'vitest';
import { PerfectCache, IndexedDBStore } from '../src';
import type { IndexedDBStoreOptions } from '../src/types';

describe('indexedDB connection should be correct', () => {
    const appCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
        dbName: 'perfectCache',
        objectStoreName: 'app-cache',
        dbVersion: 2,
        prefix: 'app:',
    });
    const appConnectToVersion = vi.spyOn(appCache.store!, 'connectToVersion');
    const appInit = vi.spyOn(appCache.store!, 'init');
    const appConnectDB = vi.spyOn(appCache.store!, 'connectDB');
    const appInitObjectStore = vi.spyOn(appCache.store!, 'initObjectStore');
    const appGetReady = vi.spyOn(appCache.store!, 'getReady');
    test('connection upgrade need when first create', async () => {
        await appCache.ready();
        expect(appConnectToVersion).toHaveBeenCalledExactlyOnceWith(2);
        expect(appConnectToVersion).toHaveResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledOnce();
        expect(appInit).toHaveResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledOnce();
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appInit);
        expect(appInitObjectStore).toHaveBeenCalledOnce();
        expect(appInitObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledOnce();
        expect(appGetReady).toHaveBeenCalledAfter(appInitObjectStore);
    });
    test('connection trigger onversionchange when invalid state error', async () => {
        const dictCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: 'perfectCache',
            objectStoreName: 'dict-cache',
            dbVersion: 1,
            prefix: 'dict:',
        });
        const dictConnectToVersion = vi.spyOn(dictCache.store!, 'connectToVersion');
        const dictInit = vi.spyOn(dictCache.store!, 'init');
        const dictConnectDB = vi.spyOn(dictCache.store!, 'connectDB');
        const dictInitObjectStore = vi.spyOn(dictCache.store!, 'initObjectStore');
        const dictGetReady = vi.spyOn(dictCache.store!, 'getReady');
        await dictCache.ready();
        // 第一次按指定版本连接1
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(1, 1);
        // 因为最新版本是2，所以第二次按最新版本连接2
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(2);
        // 因为创建新的store，所以第三次按升级版本连接3
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(3, 3);
        // 所以init函数也会被触发三次
        expect(dictInit).toHaveBeenCalledTimes(3);
        expect(dictInit).toHaveBeenCalledAfter(dictConnectToVersion);
        // 连接数据库也会被触发三次
        expect(dictConnectDB).toHaveBeenCalledTimes(3);
        expect(dictConnectDB).toHaveBeenCalledAfter(dictInit);
        // 第一次连接db已经失败了，所以不会调用创建objectStore，所以被触发两次
        expect(dictInitObjectStore).toHaveBeenCalledTimes(2);
        expect(dictInitObjectStore).toHaveBeenCalledAfter(dictConnectDB);
        // 最后触发一次ready
        expect(dictGetReady).toHaveBeenCalledOnce();
        expect(dictGetReady).toHaveBeenCalledAfter(dictInitObjectStore);
    });
});
