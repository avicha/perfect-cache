import BaseStore from "./BaseStore";
import LocalStorageStore from "./LocalStorageStore";
import MemoryStore from "./MemoryStore";
import SessionStorageStore from "./SessionStorageStore";
import CookieStore from "./CookieStore";
import IndexedDBStore from "./IndexedDBStore";
import StoreResult from "./StoreResult";

const systemStores = {};
for (const store of [
  MemoryStore,
  LocalStorageStore,
  SessionStorageStore,
  CookieStore,
  IndexedDBStore,
]) {
  systemStores[store.driver] = store;
}
const externalStores = {};
const registerStore = (store) => {
  if (store instanceof BaseStore.constructor) {
    if (store.driver && typeof store.driver === "string") {
      externalStores[store.driver] = store;
    } else {
      throw new Error("please input the driver name.");
    }
  } else {
    throw new Error("the store driver class must be subclass of BaseStore.");
  }
};
export { systemStores, externalStores, BaseStore, StoreResult, registerStore };
