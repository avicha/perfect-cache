import BaseStore from "./BaseStore";
import MemcacheStore from "./MemcacheStore";
const systemStores = {};
for (const store of [MemcacheStore]) {
  systemStores[store.driver] = store;
}
const externalStores = {};
const registerStore = (store) => {
  if (Object.getPrototypeOf(store) === BaseStore) {
    if (store.driver && typeof store.driver === "string") {
      externalStores[store.driver] = store;
    } else {
      throw new Error("please input the driver name.");
    }
  }
};
export default {
  systemStores,
  externalStores,
  BaseStore,
  registerStore,
};
