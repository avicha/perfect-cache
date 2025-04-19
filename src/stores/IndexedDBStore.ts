import BaseStore from './BaseStore';
import { connectToIndexedDB, indexedDBDebugger } from '../utils';
import type { IndexedDBStoreOptions, IndexedDBConnectOption, IndexedDBStoreObject, StoreObject } from '../types';

export default class IndexedDBStore extends BaseStore<IndexedDBStoreOptions> {
    static driver = 'indexedDB' as const;
    dbName = 'perfect-cache';
    objectStoreName = 'perfect-cache';
    dbVersion: number | undefined = undefined;
    dbConnection: IDBDatabase | undefined = undefined;
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
            this.dbConnection = this.opts.dbConnection;
        }
        if (!this.dbConnection) {
            this.connectToVersion(this.dbVersion);
        } else {
            this.dbVersion = this.dbConnection.version;
            this.ready();
        }
    }
    init() {
        // init the database connecttion and ensure the store table exists.
        return this.connectDB().then(() => {
            return this.initObjectStore();
        });
    }
    connectToVersion(dbVersion?: number) {
        this.dbVersion = dbVersion;
        indexedDBDebugger(
            `Database ${this.dbName} is connecting to version ${
                this.dbVersion || 'latest'
            } and store ${this.objectStoreName} will be created if not exists.`
        );
        this.init()
            .then(() => {
                indexedDBDebugger(
                    `Database ${this.dbName} is connected to ${this.dbVersion} success and store ${this.objectStoreName} is ready.`
                );
                this.ready();
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
                    this.connectToVersion(this.dbConnection.version + 1);
                } else {
                    window.console.error(
                        `Database ${this.dbName} is connected to ${this.dbVersion || 'latest'} failed and store ${
                            this.objectStoreName
                        } is not ready because of the outdated version. now reconnect to the latest version`,
                        err
                    );
                    // maybe the given database version to connect is not the latest, so we need to reconnect to the latest one without the exact version.
                    this.connectToVersion();
                }
            });
    }
    waitForConnectionReady(callback: (error?: Error) => void, connectOption: IndexedDBConnectOption = {}) {
        const { timeout, interval = 100, readyLog = false } = connectOption;
        if (this.isReady && this.dbConnection) {
            if (readyLog) {
                indexedDBDebugger(
                    `Database connection ${this.dbName} is connected and store ${this.objectStoreName} is ready.(^v^)`
                );
            }
            if (callback && typeof callback === 'function') {
                callback();
            }
        } else {
            indexedDBDebugger(
                `Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready...`
            );
            if ((timeout && timeout > 0) || timeout === undefined) {
                window.setTimeout(() => {
                    this.waitForConnectionReady(callback, {
                        timeout: timeout ? timeout - interval : undefined,
                        interval,
                        readyLog: true,
                    });
                }, interval);
            } else {
                if (callback && typeof callback === 'function') {
                    callback(
                        new Error(
                            `Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready timeout.`
                        )
                    );
                }
            }
        }
    }
    connectDB() {
        if (this.dbConnection) {
            this.dbConnection.close();
            this.dbConnection.onversionchange = null;
            this.dbConnection = undefined;
            this.isReady = false;
        }
        return connectToIndexedDB(this.dbName, this.dbVersion).then((dbConnection) => {
            this.dbConnection = dbConnection;
            this.dbVersion = dbConnection.version;
            dbConnection.onversionchange = (event) => {
                indexedDBDebugger(
                    `The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${event.oldVersion} to ${event.newVersion}`
                );
                this.connectToVersion(event.newVersion || undefined);
            };
        });
    }
    initObjectStore(): Promise<IDBObjectStore | undefined> {
        return new Promise((resolve, reject) => {
            if (this.dbConnection) {
                if (!this.dbConnection.objectStoreNames.contains(this.objectStoreName)) {
                    indexedDBDebugger(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);
                    const objectStore = this.dbConnection.createObjectStore(this.objectStoreName, {
                        keyPath: 'key',
                    });
                    // Use transaction oncomplete to make sure the objectStore creation is
                    // finished before adding data into it.
                    objectStore.transaction.oncomplete = (_event) => {
                        indexedDBDebugger(`ObjectStore ${this.objectStoreName} is created now.`);
                        resolve(objectStore);
                    };
                } else {
                    resolve(undefined);
                }
            } else {
                const error = new Error(`Database ${this.dbName} connection is not initialised.`);
                reject(error);
            }
        });
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        return new Promise((resolve, reject) => {
            this.waitForConnectionReady((error) => {
                if (error) {
                    reject(error);
                } else {
                    const request = this.dbConnection!.transaction([this.objectStoreName], 'readonly')
                        .objectStore(this.objectStoreName)
                        .get(this.__getRealKey(key));
                    request.onerror = () => {
                        window.console.error('Database get occurs error', request.result);
                        reject(request.result);
                    };
                    request.onsuccess = () => {
                        resolve((request.result as IndexedDBStoreObject)?.value);
                    };
                }
            });
        });
    }
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        return new Promise((resolve, reject) => {
            this.waitForConnectionReady((error) => {
                if (error) {
                    reject(error);
                } else {
                    const request = this.dbConnection!.transaction([this.objectStoreName], 'readwrite')
                        .objectStore(this.objectStoreName)
                        .put({ key: this.__getRealKey(key), value });
                    request.onerror = () => {
                        window.console.error('Database put occurs error', request.result);
                        reject(request.result);
                    };
                    request.onsuccess = () => {
                        resolve();
                    };
                }
            });
        });
    }
    existsKey(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.waitForConnectionReady((error) => {
                if (error) {
                    reject(error);
                } else {
                    const request = this.dbConnection!.transaction([this.objectStoreName], 'readonly')
                        .objectStore(this.objectStoreName)
                        .count(this.__getRealKey(key));
                    request.onerror = () => {
                        window.console.error('Database count occurs error', request.result);
                        reject(request.result);
                    };
                    request.onsuccess = () => {
                        resolve(!!request.result);
                    };
                }
            });
        });
    }
    removeItem(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.waitForConnectionReady((error) => {
                if (error) {
                    reject(error);
                } else {
                    const request = this.dbConnection!.transaction([this.objectStoreName], 'readwrite')
                        .objectStore(this.objectStoreName)
                        .delete(this.__getRealKey(key));
                    request.onerror = () => {
                        window.console.error('Database delete occurs error', request.result);
                        reject(request.result);
                    };
                    request.onsuccess = () => {
                        resolve();
                    };
                }
            });
        });
    }
    keys(): Promise<string[]> {
        const keys: string[] = [];
        return new Promise((resolve, reject) => {
            this.waitForConnectionReady((error) => {
                if (error) {
                    reject(error);
                } else {
                    const request = this.dbConnection!.transaction([this.objectStoreName], 'readonly')
                        .objectStore(this.objectStoreName)
                        .openCursor();
                    request.onerror = () => {
                        window.console.error('Database openCursor occurs error', request.result);
                        reject(request.result);
                    };
                    request.onsuccess = (e) => {
                        const cursor = request.result;
                        if (cursor) {
                            if ((cursor.key as string).startsWith(this.prefix)) {
                                keys.push((cursor.key as string).replace(this.prefix, ''));
                            }
                            cursor.continue();
                        } else {
                            resolve(keys);
                        }
                    };
                }
            });
        });
    }
}
