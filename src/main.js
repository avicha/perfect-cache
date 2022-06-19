import defaultOpts from './defaultOpts';
import EventListener from './EventListener';
import { getSupportedDriverList, getStoreClass } from './utils';

class BrowserCache extends EventListener {
  opts;
  __init = false;
  driver;
  store;
  constructor(driver, opts) {
    super();
    const suportedDriverList = getSupportedDriverList();
    // driver and opts is null, then set the default opts
    if (!driver && !opts) {
      opts = { ...defaultOpts };
    } else {
      // driver is not null
      if (driver) {
        // driver is string and valid
        if (suportedDriverList.includes(driver)) {
          if (Object.prototype.toString.call(opts) === '[object Object]') {
            opts = { ...defaultOpts, driver, ...opts };
          } else {
            opts = { ...defaultOpts, driver };
          }
        } else {
          // driver is object opts
          if (
            Object.prototype.toString.call(driver) === '[object Object]' &&
            suportedDriverList.includes(driver.driver)
          ) {
            opts = { ...defaultOpts, ...driver };
          } else {
            // driver is invalid
            throw new Error(
              'please input the correct driver param as the first param or in the opts params.'
            );
          }
        }
      } else {
        // driver is null and opts is not null
        throw new Error('please input the driver as first param.');
      }
    }
    if (opts && opts.driver) {
      this.opts = opts;
      this.initDriver();
    } else {
      throw new Error('please input the driver as first param.');
    }
  }
  initDriver() {
    const suportedDriverList = getSupportedDriverList();
    if (
      this.opts &&
      this.opts.driver &&
      suportedDriverList.includes(this.opts.driver)
    ) {
      this.__init = false;
      const StoreClass = getStoreClass(this.opts.driver);
      this.store = new StoreClass(this.opts);
      this.store.$on('ready', () => {
        this.__init = true;
        this.driver = this.opts.driver;
        this.$emit('ready');
      });
    }
  }
  setDriver(driver) {
    this.opts.driver = driver;
    this.initDriver();
  }
  existsKey() {
    return this.store.existsKey.apply(this.store, arguments);
  }
  get() {
    return this.store.get.apply(this.store, arguments);
  }
  set() {
    return this.store.set.apply(this.store, arguments);
  }
}
export default BrowserCache;
