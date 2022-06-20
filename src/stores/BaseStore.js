import EventListener from '../EventListener';

export default class BaseStore extends EventListener {
  opts;
  isReady = false;
  constructor(opts = {}) {
    super();
    this.opts = opts;
    this.isReady = false;
  }
  existsKey() {
    throw new Error('please implement the existsKey method for this driver.');
  }
  get() {
    throw new Error('please implement the get method for this driver.');
  }
  set() {
    throw new Error('please implement the set method for this driver.');
  }
}
