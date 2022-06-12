import BaseStore from './BaseStore';
import MemoryStore from './MemoryStore';
const systemStores = {};
for (const store of [MemoryStore]) {
  systemStores[store.driver] = store;
}
const externalStores = {};
const registerStore = (store) => {
  if (Object.getPrototypeOf(store) === BaseStore) {
    if (store.driver && typeof store.driver === 'string') {
      externalStores[store.driver] = store;
    } else {
      throw new Error('please input the driver name.');
    }
  }
};
export { systemStores, externalStores, BaseStore, registerStore };
