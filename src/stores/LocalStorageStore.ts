import BaseStore from './BaseStore';
import { cacheDebugger } from '../utils';
import type { BaseStoreOptions, StoreObject } from '../types';

export default class LocalStorageStore extends BaseStore<BaseStoreOptions> {
    static driver = 'localStorage' as const;
    constructor(opts: BaseStoreOptions) {
        super(opts);
        this.getReady();
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        const valueStr = localStorage.getItem(this.__getRealKey(key));
        if (valueStr) {
            try {
                const valueObj = JSON.parse(valueStr);
                return Promise.resolve(valueObj);
            } catch (error) {
                cacheDebugger(`get key ${key} json parse error`, valueStr);
                return Promise.resolve(undefined);
            }
        } else {
            return Promise.resolve(undefined);
        }
    }
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        try {
            localStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
            return Promise.resolve();
        } catch (error) {
            cacheDebugger(`set key ${key} json stringify error`, error);
            return Promise.reject(error);
        }
    }
    existsKey(key: string): Promise<boolean> {
        if (localStorage.getItem(this.__getRealKey(key))) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    removeItem(key: string): Promise<void> {
        localStorage.removeItem(this.__getRealKey(key));
        return Promise.resolve();
    }
    keys() {
        const keys: string[] = [];
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return Promise.resolve(keys.sort());
    }
}
