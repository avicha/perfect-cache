import BaseStore from './BaseStore';
export default class MemoryStore extends BaseStore {
  static driver = 'memory';
}
