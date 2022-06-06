import BaseStore from "./BaseStore";
export default class MemcacheStore extends BaseStore {
  static driver = "memcache";
}
