import EventListener from "../EventListener";

export default class BaseStore extends EventListener {
  opts;
  isAsync = false;
  isReady = false;
  prefix = "cache:";
  constructor(opts = {}) {
    super();
    this.opts = opts;
    if (this.opts.prefix) {
      this.prefix = this.opts.prefix;
    }
    this.isReady = false;
  }
  __getRealKey(key) {
    return `${this.prefix}${key}`;
  }
  existsKey() {
    throw new Error("please implement the existsKey method for this driver.");
  }
  get() {
    throw new Error("please implement the get method for this driver.");
  }
  set() {
    throw new Error("please implement the set method for this driver.");
  }
}
