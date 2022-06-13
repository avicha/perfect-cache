import SyncStore from './SyncStore';
export default class MemoryStore extends SyncStore {
  static driver = 'memory';
  data = new Map();
  keyValueGet(key) {
    return this.data.get(key);
  }
  keyValueSet(key, value) {
    this.data.set(key, value);
  }
  existsKey(key) {
    if (this.data.has(key)) {
      return 1;
    } else {
      return 0;
    }
  }
}
