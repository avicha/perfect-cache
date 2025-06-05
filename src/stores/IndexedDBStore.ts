/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseStore from './BaseStore';
import { connectToIndexedDB, indexedDBLogger } from '../utils';
import type { IndexedDBStoreOptions, IndexedDBStoreObject, StoreObject } from '../types';

export default class IndexedDBStore extends BaseStore<IndexedDBStoreOptions> {
    static driver = 'indexedDB' as const;
    dbName = 'perfect-cache';
    objectStoreName = 'perfect-cache';
    dbVersion: number | undefined = undefined;
    dbConnection: IDBDatabase | undefined = undefined;
    prefix = '';
    constructor(opts: IndexedDBStoreOptions) {
        super(opts);
        if (this.opts?.dbName) {
            this.dbName = this.opts.dbName;
        }
        if (this.opts?.objectStoreName) {
            this.objectStoreName = this.opts.objectStoreName;
        }
        if (this.opts?.dbVersion) {
            this.dbVersion = this.opts.dbVersion;
        }
        if (this.opts?.dbConnection) {
            this.setDBConnection(this.opts?.dbConnection);
        }
        if (typeof this.opts.prefix === 'string') {
            this.prefix = this.opts.prefix;
        }
    }
    setDBConnection(dbConnection: IDBDatabase) {
        this.dbConnection = dbConnection;
        this.dbVersion = dbConnection.version;
        this.dbName = dbConnection.name;
    }
    init() {
        this.connectToVersion(this.dbVersion);
        return this;
    }
    connectDB(onupgradeneeded?: (dbConnection: IDBDatabase) => void) {
        if (this.dbConnection) {
            return Promise.resolve(this.dbConnection);
        } else {
            return connectToIndexedDB(this.dbName, this.dbVersion, (dbConnection) => {
                if (onupgradeneeded && typeof onupgradeneeded === 'function') {
                    onupgradeneeded(dbConnection);
                }
            });
        }
    }
    createObjectStore(dbConnection: IDBDatabase): Promise<IDBObjectStore | undefined> {
        return new Promise((resolve, reject) => {
            if (dbConnection) {
                if (!dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                    indexedDBLogger.debug(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);
                    try {
                        const objectStore = dbConnection.createObjectStore(this.objectStoreName, {
                            keyPath: 'key',
                        });
                        // Use transaction oncomplete to make sure the objectStore creation is
                        // finished before adding data into it.
                        objectStore.transaction.oncomplete = (_event) => {
                            indexedDBLogger.debug(`ObjectStore ${this.objectStoreName} is created now.`);
                            resolve(objectStore);
                        };
                        // // 这个事件貌似不会执行到，当创建store出错的时候会直接抛出异常
                        // objectStore.transaction.onerror = (_event) => {
                        //     window.console.error(`ObjectStore ${this.objectStoreName} occurs error`, _event);
                        //     reject(_event);
                        // };
                    } catch (e) {
                        window.console.error(`ObjectStore ${this.objectStoreName} create failed`, e);
                        reject(e);
                    }
                } else {
                    resolve(undefined);
                }
            } else {
                const error = new Error(`Database ${this.dbName} connection is not initialised.`);
                reject(error);
            }
        });
    }
    createDBAndObjectStore(): Promise<this> {
        // init the database connecttion and ensure the store table exists.
        return this.connectDB((dbConnection) => {
            if (!dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                this.createObjectStore(dbConnection);
            }
        }).then((dbConnection) => {
            this.setDBConnection(dbConnection);
            if (!dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                return this.connectToVersion(dbConnection.version + 1);
            } else {
                dbConnection.onversionchange = (event) => {
                    indexedDBLogger.debug(
                        `The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${event.oldVersion} to ${event.newVersion}`
                    );
                    this.connectToVersion(event.newVersion || undefined);
                };
                // 这里为什么延迟getReady，纯粹方便vitest测试connectToVersion函数被调用过了，并且返回this，不然ready的时候函数还未调用完成，就会导致vitest测试报错
                let readyTick: number | undefined = window.setTimeout(() => {
                    this.getReady();
                    clearTimeout(readyTick);
                    readyTick = undefined;
                }, 0);
                return this;
            }
        });
    }
    connectToVersion(dbVersion?: number): Promise<this> {
        if (this.dbConnection && dbVersion && dbVersion !== this.dbConnection.version) {
            this.dbConnection.close();
            this.dbConnection.onversionchange = null;
            this.dbConnection = undefined;
        }
        this.dbVersion = dbVersion;
        this.isReady = false;
        indexedDBLogger.debug(
            `Database ${this.dbName} is connecting to version ${
                this.dbVersion || 'latest'
            } and store ${this.objectStoreName} will be created if not exists.`
        );
        return this.createDBAndObjectStore()
            .then(() => {
                indexedDBLogger.debug(
                    `Database ${this.dbName} is connected to ${this.dbVersion} success and store ${this.objectStoreName} is ready.`
                );
                return this;
            })
            .catch((err) => {
                // get the database connection failed, maybe the version is not match, so we need to upgrade it.
                if (this.dbConnection) {
                    window.console.error(
                        `Database ${this.dbName} is connected to ${this.dbConnection.version} success but store ${
                            this.objectStoreName
                        } init failed because of the outdated version. now reconnect to the next version ${
                            this.dbConnection.version + 1
                        }`,
                        err
                    );
                    return this.connectToVersion(this.dbConnection.version + 1);
                } else {
                    window.console.error(
                        `Database ${this.dbName} is connected to ${this.dbVersion || 'latest'} failed and store ${
                            this.objectStoreName
                        } is not ready because of the outdated version. now reconnect to the latest version`,
                        err
                    );
                    // maybe the given database version to connect is not the latest, so we need to reconnect to the latest one without the exact version.
                    return this.connectToVersion();
                }
            });
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        return new Promise((resolve, reject) => {
            const request = this.dbConnection!.transaction(this.objectStoreName, 'readonly')
                .objectStore(this.objectStoreName)
                .get(this.__getRealKey(key));
            request.onerror = () => {
                window.console.error('Database get occurs error', request.result);
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve((request.result as IndexedDBStoreObject)?.value);
            };
        });
    }
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.dbConnection!.transaction(this.objectStoreName, 'readwrite')
                .objectStore(this.objectStoreName)
                .put({ key: this.__getRealKey(key), value });
            request.onerror = () => {
                window.console.error('Database put occurs error', request.result);
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    existsKey(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const request = this.dbConnection!.transaction(this.objectStoreName, 'readonly')
                .objectStore(this.objectStoreName)
                .count(this.__getRealKey(key));
            request.onerror = () => {
                window.console.error('Database count occurs error', request.result);
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve(!!request.result);
            };
        });
    }
    removeItem(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.dbConnection!.transaction(this.objectStoreName, 'readwrite')
                .objectStore(this.objectStoreName)
                .delete(this.__getRealKey(key));
            request.onerror = () => {
                window.console.error('Database delete occurs error', request.result);
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    keys(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const request = this.dbConnection!.transaction(this.objectStoreName, 'readonly')
                .objectStore(this.objectStoreName)
                .getAllKeys();
            request.onerror = () => {
                window.console.error('Database getAllKeys occurs error', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                const keys = request.result;
                const resKeys = this.prefix
                    ? keys
                          .filter((key) => {
                              return (key as string).startsWith(this.prefix);
                          })
                          .map((key) => {
                              return (key as string).replace(this.prefix, '');
                          })
                    : keys.map((key) => key as string);
                resolve(resKeys.sort());
            };
        });
    }
    clear(): Promise<void> {
        if (this.prefix) {
            return new Promise((resolve, reject) => {
                this.keys().then((keys) => {
                    const transaction = this.dbConnection!.transaction(this.objectStoreName, 'readwrite');
                    const objectStore = transaction.objectStore(this.objectStoreName);
                    for (const key of keys) {
                        objectStore.delete(this.__getRealKey(key));
                    }
                    transaction.onerror = (ev) => {
                        window.console.error('Database clear occurs error', ev);
                        reject(transaction.error);
                    };
                    transaction.oncomplete = () => {
                        resolve();
                    };
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                const request = this.dbConnection!.transaction([this.objectStoreName], 'readwrite')
                    .objectStore(this.objectStoreName)
                    .clear();
                request.onerror = () => {
                    window.console.error('Database clear occurs error', request.result);
                    reject(request.error);
                };
                request.onsuccess = () => {
                    resolve(void 0);
                };
            });
        }
    }
    async removeItemList(keys?: string[] | RegExp): Promise<void> {
        let storeKeys: string[] = [];
        const itemListMap: { [key: string]: any } = {};
        if (Array.isArray(keys)) {
            storeKeys = keys;
        } else {
            if (keys instanceof RegExp) {
                storeKeys = (await this.keys()).filter((key) => {
                    return keys.test(key);
                });
            }
        }
        return new Promise((resolve, reject) => {
            const transaction = this.dbConnection!.transaction(this.objectStoreName, 'readwrite');
            const objectStore = transaction.objectStore(this.objectStoreName);
            for (const key of storeKeys) {
                objectStore.delete(this.__getRealKey(key));
            }
            transaction.onerror = (ev) => {
                window.console.error('Database clear occurs error', ev);
                reject(transaction.error);
            };
            transaction.oncomplete = () => {
                resolve(void 0);
            };
            return itemListMap;
        });
    }
}
