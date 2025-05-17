import BaseStore from './BaseStore';
import { cacheLogger } from '../utils';
import type { BaseStoreOptions, StoreObject } from '../types';

export default class SessionStorageStore extends BaseStore<BaseStoreOptions> {
    static driver = 'sessionStorage' as const;
    constructor(opts: BaseStoreOptions) {
        super(opts);
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        const valueStr = sessionStorage.getItem(this.__getRealKey(key));
        return new Promise((resolve) => {
            if (valueStr) {
                try {
                    const valueObj: StoreObject = JSON.parse(valueStr);
                    resolve(valueObj);
                } catch (error) {
                    cacheLogger.error(`get key ${key} json parse error`, valueStr);
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        });
    }
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                sessionStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
                resolve();
            } catch (error) {
                cacheLogger.error(`set key ${key} json stringify error`, error);
                reject(error);
            }
        });
    }
    existsKey(key: string): Promise<boolean> {
        const valueStr = sessionStorage.getItem(this.__getRealKey(key));
        if (valueStr) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    removeItem(key: string): Promise<void> {
        sessionStorage.removeItem(this.__getRealKey(key));
        return Promise.resolve();
    }
    keys() {
        let keys: string[] = [];
        if (this.prefix) {
            keys = Object.keys(sessionStorage)
                .filter((key) => key.startsWith(this.prefix))
                .map((key) => key.replace(this.prefix, ''));
        } else {
            keys = Object.keys(sessionStorage);
        }
        return Promise.resolve(keys.sort());
    }
    clear(): Promise<void> {
        if (this.prefix) {
            return super.clear();
        } else {
            sessionStorage.clear();
            return Promise.resolve();
        }
    }
}
