import jsCookie from 'js-cookie';
import BaseStore from './BaseStore';
import { cacheLogger } from '../utils';
import type { BaseStoreOptions, StoreObject } from '../types';

export default class CookieStore extends BaseStore<BaseStoreOptions> {
    static driver = 'cookie' as const;
    constructor(opts: BaseStoreOptions) {
        super(opts);
        // 这里为什么延迟ready，一方面因为统一制造异步ready的回调，另一方面方便vitest测试getReady函数被调用过了
        window.setTimeout(() => {
            this.getReady();
        }, 0);
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        const valueStr = jsCookie.get(this.__getRealKey(key));
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
                jsCookie.set(this.__getRealKey(key), JSON.stringify(value));
                resolve();
            } catch (error) {
                cacheLogger.error(`set key ${key} json stringify error`, error);
                reject(error);
            }
        });
    }
    existsKey(key: string): Promise<boolean> {
        if (jsCookie.get(this.__getRealKey(key))) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    removeItem(key: string): Promise<void> {
        jsCookie.remove(this.__getRealKey(key));
        return Promise.resolve();
    }
    keys() {
        const cookies = jsCookie.get();
        const keys: string[] = [];
        for (const key of Object.keys(cookies)) {
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return Promise.resolve(keys.sort());
    }
}
