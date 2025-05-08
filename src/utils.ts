import { systemStores, externalStores } from './stores';
import debug from 'debug';
import type { SupportedDriver } from './types';

const cacheDebugger = debug('perfect-cache');
const indexedDBDebugger = cacheDebugger.extend('indexedDB');
/**
 *
 * @return {Array} the supported driver list
 */
const getSupportedDriverList = (): string[] => {
    let supportedDriverList: string[] = ['memory'];
    if (typeof window !== 'undefined' && window?.localStorage && systemStores.localStorage) {
        supportedDriverList.push('localStorage');
    }
    if (typeof window !== 'undefined' && window?.sessionStorage && systemStores.sessionStorage) {
        supportedDriverList.push('sessionStorage');
    }
    if (typeof window !== 'undefined' && window?.document && 'cookie' in window.document && systemStores.cookie) {
        supportedDriverList.push('cookie');
    }
    if (typeof window !== 'undefined' && window?.indexedDB && systemStores.indexedDB) {
        supportedDriverList.push('indexedDB');
    }
    supportedDriverList = supportedDriverList.concat(Object.keys(externalStores));
    return supportedDriverList;
};

/**
 *
 * @param {String} driver the store driver
 * @return {Class} the store class
 */
const getStoreClass = (driver: SupportedDriver | string) => {
    if (driver in systemStores) {
        return systemStores[driver as SupportedDriver];
    } else {
        return externalStores[driver];
    }
};

const connectToIndexedDB = (dbName: string, dbVersion?: number): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, dbVersion);
        request.onerror = (e) => {
            const error = (e.target as IDBOpenDBRequest).error;
            const errMsg = error?.message || 'unknown error';
            console.error(`Database ${dbName} version ${dbVersion || 'latest'} initialised error.`, error);
            reject(new Error(errMsg));
        };
        request.onsuccess = () => {
            const dbConnection = request.result;
            const dbVersion = dbConnection.version;
            indexedDBDebugger(`Database ${dbName} version ${dbVersion} initialised success.`);
            resolve(dbConnection);
        };
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const dbConnection = request.result;
            indexedDBDebugger(
                `Database ${dbName} upgrade needed as oldVersion is ${event.oldVersion} and newVersion is ${event.newVersion}.`
            );
            resolve(dbConnection);
        };
    });
};

export { getSupportedDriverList, getStoreClass, connectToIndexedDB, cacheDebugger, indexedDBDebugger };
