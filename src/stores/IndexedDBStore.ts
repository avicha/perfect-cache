/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseStore from './BaseStore';
import { connectToIndexedDB, createObjectStores, indexedDBLogger } from '../utils';
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
    createObjectStore(dbConnection: IDBDatabase): Promise<IDBDatabase> {
        return createObjectStores(dbConnection, [this.objectStoreName], { keyPath: 'key' });
    }
    createDBAndObjectStore(): Promise<this> {
        // 连接到db，如果连接触发了 onupgradeneeded 事件，则创建对象存储
        return this.connectDB((dbConnection) => {
            // 如果对象存储不存在，则创建对象存储
            if (!dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                this.createObjectStore(dbConnection);
            }
        }).then((dbConnection) => {
            // 连接db成功则设置连接
            this.setDBConnection(dbConnection);
            // 有两种情况
            // 1. 连接的db版本=db当前版本，所以没有触发 onupgradeneeded 事件，这时候可能还未创建对象存储
            // 2. 连接的db版本触发了 onupgradeneeded 事件，这时候对象存储已经创建好了
            // 所以在连接db成功的时候，需要检查对象存储是否存在，如果不存在则需要重新连接到下一个版本
            if (!dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                return this.connectToVersion(dbConnection.version + 1);
            } else {
                dbConnection.onversionchange = (event) => {
                    indexedDBLogger.debug(
                        `The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${event.oldVersion} to ${event.newVersion}`
                    );
                    // 如果别的数据库连接创建了新的版本，则需要重新连接到新的版本
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
        // 连接db之前，如果已经有连接的db，并且版本不一致，则关闭当前连接
        if (this.dbConnection && dbVersion && dbVersion !== this.dbConnection.version) {
            this.dbConnection.close();
            this.dbConnection.onversionchange = null;
            this.dbConnection = undefined;
        }
        // 记录当前需要连接的版本
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
                window.console.error(
                    `Database ${this.dbName} is connected to ${this.dbVersion || 'latest'} failed and store ${
                        this.objectStoreName
                    } is not ready because of the outdated version. now reconnect to the latest version`,
                    err
                );
                // maybe the given database version to connect is not the latest, so we need to reconnect to the latest one without the exact version.
                return this.connectToVersion();
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
