import BaseStore from './BaseStore';
import { cacheLogger } from '../utils';
import type { BaseStoreOptions, StoreObject } from '../types';

export default class MemoryStore extends BaseStore<BaseStoreOptions> {
    static driver = 'memory' as const;
    data = new Map<string, string>();
    constructor(opts: BaseStoreOptions) {
        super(opts);
        // 这里为什么延迟ready，一方面因为统一制造异步ready的回调，另一方面方便vitest测试getReady函数被调用过了
        window.setTimeout(() => {
            this.getReady();
        }, 0);
    }
    keyValueGet(key: string): Promise<StoreObject | undefined> {
        const valueStr = this.data.get(this.__getRealKey(key));
        if (valueStr) {
            try {
                const valueObj: StoreObject = JSON.parse(valueStr);
                return Promise.resolve(valueObj);
            } catch (error) {
                cacheLogger.error(`get key ${key} json parse error`, valueStr);
                return Promise.resolve(undefined);
            }
        } else {
            return Promise.resolve(undefined);
        }
    }
    keyValueSet(key: string, value: StoreObject): Promise<void> {
        try {
            this.data.set(this.__getRealKey(key), JSON.stringify(value));
            return Promise.resolve();
        } catch (error) {
            cacheLogger.error(`set key ${key} json stringify error`, error);
            return Promise.reject(error);
        }
    }
    existsKey(key: string): Promise<boolean> {
        if (this.data.has(this.__getRealKey(key))) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
    removeItem(key: string): Promise<void> {
        this.data.delete(this.__getRealKey(key));
        return Promise.resolve();
    }
    keys() {
        const keys = Array.from(this.data.keys()).map((key) => key.replace(this.prefix, ''));
        return Promise.resolve(keys.sort());
    }
    clear(): Promise<number> {
        const size = this.data.size;
        this.data.clear();
        return Promise.resolve(size);
    }
    length() {
        return Promise.resolve(this.data.size);
    }
}
