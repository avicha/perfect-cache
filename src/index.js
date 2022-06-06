import BrowserCache from './main';
import { BaseStore, registerStore } from './stores';
const browserCacheInstance = new BrowserCache();
export default browserCacheInstance;
export { BrowserCache, BaseStore, registerStore };
console.log(browserCacheInstance);
