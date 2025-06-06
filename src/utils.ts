import { systemStores, externalStores } from './stores';
import debug from 'debug';
import type { SupportedDriver } from './types';

const cacheDebug = debug('perfect-cache:debug');
cacheDebug.log = console.debug.bind(console);
const cacheLog = debug('perfect-cache:log');
cacheLog.log = console.log.bind(console);
const cacheError = debug('perfect-cache:error');
cacheError.log = console.error.bind(console);
const cacheWarn = debug('perfect-cache:warn');
cacheWarn.log = console.warn.bind(console);
const cacheLogger = {
    debug: cacheDebug,
    log: cacheLog,
    error: cacheError,
    warn: cacheWarn,
};
const indexedDBDebug = debug('perfect-cache:indexedDB:debug');
indexedDBDebug.log = console.debug.bind(console);
const indexedDBLog = debug('perfect-cache:indexedDB:log');
indexedDBLog.log = console.log.bind(console);
const indexedDBError = debug('perfect-cache:indexedDB:error');
indexedDBError.log = console.error.bind(console);
const indexedDBWarn = debug('perfect-cache:indexedDB:warn');
indexedDBWarn.log = console.warn.bind(console);
const indexedDBLogger = {
    debug: indexedDBDebug,
    log: indexedDBLog,
    error: indexedDBError,
    warn: indexedDBWarn,
};

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

const connectToIndexedDB = (
    dbName: string,
    dbVersion?: number,
    onupgradeneeded?: (dbConnection: IDBDatabase) => void
): Promise<IDBDatabase> => {
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
            indexedDBLogger.debug(`Database ${dbName} version ${dbVersion} initialised success.`);
            resolve(dbConnection);
        };
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const dbConnection = request.result;
            indexedDBLogger.debug(
                `Database ${dbName} upgrade needed as oldVersion is ${event.oldVersion} and newVersion is ${event.newVersion}.`
            );
            if (onupgradeneeded) {
                onupgradeneeded(dbConnection);
            }
        };
    });
};
const createObjectStores = (
    dbConnection: IDBDatabase,
    objectStoreNames: string[],
    createOptions?: IDBObjectStoreParameters
) => {
    const needCreateObjectStores = objectStoreNames.filter(
        (objectStoreName) => !dbConnection.objectStoreNames.contains(objectStoreName)
    );
    // 如果有需要创建的对象存储
    if (needCreateObjectStores.length) {
        return new Promise<IDBDatabase>((resolve, reject) => {
            let transaction: IDBTransaction | undefined;
            for (const objectStoreName of objectStoreNames) {
                if (!dbConnection.objectStoreNames.contains(objectStoreName)) {
                    const objectStore = dbConnection.createObjectStore(objectStoreName, {
                        autoIncrement: createOptions?.autoIncrement,
                        keyPath: createOptions?.keyPath || 'key',
                    });
                    transaction = objectStore.transaction;
                    indexedDBLogger.debug(`Object store ${objectStoreName} created.`);
                } else {
                    indexedDBLogger.debug(`Object store ${objectStoreName} already exists.`);
                }
            }
            if (transaction) {
                transaction.oncomplete = () => {
                    indexedDBLogger.debug(`Object stores ${needCreateObjectStores.toString()} created successfully.`);
                    resolve(dbConnection);
                };
                transaction.onerror = (e) => {
                    const error = (e.target as IDBTransaction).error;
                    indexedDBLogger.error(`Object stores ${needCreateObjectStores.toString()} create error.`, error);
                    reject(error);
                };
            } else {
                indexedDBLogger.debug(`No object stores to create in database ${dbConnection.name}.`);
                resolve(dbConnection);
            }
        });
    } else {
        indexedDBLogger.debug(`No object stores to create in database ${dbConnection.name}.`);
        return Promise.resolve(dbConnection);
    }
};
const createDBAndObjectStores = (
    dbName: string,
    objectStoreNames: string[],
    createOptions?: IDBObjectStoreParameters
) => {
    // 先连接到最新的db，这时候肯定不会触发 onupgradeneeded 事件
    return connectToIndexedDB(dbName).then((dbConnection) => {
        if (objectStoreNames.length) {
            const needCreateObjectStores = objectStoreNames.filter(
                (objectStoreName) => !dbConnection.objectStoreNames.contains(objectStoreName)
            );
            // 如果有被需要创建的对象存储
            if (needCreateObjectStores.length) {
                // 关闭之前的连接
                dbConnection.close();
                // 重新连接高级版本，这时候必然触发 onupgradeneeded 事件，在 onupgradeneeded 事件中创建对象存储
                return connectToIndexedDB(dbName, dbConnection.version + 1, (newDbConnection) => {
                    return createObjectStores(newDbConnection, needCreateObjectStores, createOptions);
                });
            } else {
                indexedDBLogger.debug(`All object stores already exist in database ${dbName}.`);
                return dbConnection;
            }
        } else {
            indexedDBLogger.debug(`No object stores to create in database ${dbName}.`);
            return dbConnection;
        }
    });
};
export {
    getSupportedDriverList,
    getStoreClass,
    connectToIndexedDB,
    createObjectStores,
    createDBAndObjectStores,
    cacheLogger,
    indexedDBLogger,
};
