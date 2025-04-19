/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt';
import type { Emitter, Handler, WildcardHandler } from 'mitt';

type Events = { ready: void; cacheExpired: string };
export default class EventListener {
    mitt: Emitter<Events>;
    constructor() {
        this.mitt = mitt();
    }
    $on(type: '*', handler: Handler<Events>): void;
    $on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
    $on(type: any, handler: any): void {
        return this.mitt.on(type, handler);
    }
    $off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void;
    $off(type: '*', handler: WildcardHandler<Events>): void;
    $off(type: any, handler: any): void {
        return this.mitt.off(type, handler);
    }
    $emit<Key extends keyof Events>(type: Key, evt: Events[Key]): void;
    $emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void;
    $emit(type: any, evt?: any): void {
        return this.mitt.emit(type, evt);
    }
}
