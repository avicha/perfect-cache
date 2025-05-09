import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest';
import { getSupportedDriverList, getStoreClass, connectToIndexedDB } from '../src/utils';
import LocalStorageStore from '../src/stores/LocalStorageStore';
import MemoryStore from '../src/stores/MemoryStore';
import SessionStorageStore from '../src/stores/SessionStorageStore';
import CookieStore from '../src/stores/CookieStore';
import IndexedDBStore from '../src/stores/IndexedDBStore';

describe('getSupportedDriverList should be correct', () => {
    let supportedDriverList: string[];
    beforeAll(() => {
        supportedDriverList = getSupportedDriverList();
    });
    test('supportedDriverList type', () => {
        expect(supportedDriverList).toBeInstanceOf(Array);
        expect(supportedDriverList.length).toBeGreaterThan(0);
    });
    test('supportedDriverList result', () => {
        expect(supportedDriverList).toContain('memory');
        expect(supportedDriverList).toContain('localStorage');
        expect(supportedDriverList).toContain('sessionStorage');
        expect(supportedDriverList).toContain('cookie');
        expect(supportedDriverList).toContain('indexedDB');
    });
});

describe('getStoreClass should be correct', () => {
    test('getStoreClass result', () => {
        expect(getStoreClass('memory')).toBe(MemoryStore);
        expect(getStoreClass('localStorage')).toBe(LocalStorageStore);
        expect(getStoreClass('sessionStorage')).toBe(SessionStorageStore);
        expect(getStoreClass('cookie')).toBe(CookieStore);
        expect(getStoreClass('indexedDB')).toBe(IndexedDBStore);
        expect(getStoreClass('unknown')).toBeUndefined();
    });
});

describe('connectToIndexedDB', () => {
    test('dbName and dbVersion correct should be success', async () => {
        const dbName = 'test-db';
        const dbVersion = 3;
        const dbConnection = await connectToIndexedDB(dbName, dbVersion);
        expect(dbConnection).toBeInstanceOf(IDBDatabase);
        expect(dbConnection.name).toBe(dbName);
        expect(dbConnection.version).toBe(dbVersion);
    });
    test('dbName and dbVersion error should be fail', async () => {
        const dbName = 'test-db';
        const dbVersion = 1;
        const promise = connectToIndexedDB(dbName, dbVersion);
        await expect(promise).rejects.toThrowError();
    });
    test('dbName and dbVersion undefined should be success', async () => {
        const dbName = 'test-db';
        const dbConnection = await connectToIndexedDB(dbName);
        expect(dbConnection).toBeInstanceOf(IDBDatabase);
        expect(dbConnection.name).toBe(dbName);
        expectTypeOf(dbConnection.version).toEqualTypeOf<number>();
    });
});
