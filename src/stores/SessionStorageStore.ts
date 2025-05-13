import BaseStore from './BaseStore';
import { cacheLogger } from '../utils';
import type { BaseStoreOptions, StoreObject } from '../types';

export default class SessionStorageStore extends BaseStore<BaseStoreOptions> {
    static driver = 'sessionStorage' as const;
    constructor(opts: BaseStoreOptions) {
        super(opts);
        // 这里为什么延迟ready，一方面因为统一制造异步ready的回调，另一方面方便vitest测试getReady函数被调用过了
        window.setTimeout(() => {
            this.getReady();
        }, 0);
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
        const keys: string[] = [];
        for (const key of Object.keys(sessionStorage)) {
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return Promise.resolve(keys.sort());
    }
}
