import { systemStores, externalStores } from "./stores";

/**
 *
 * @return {Array} the supported driver list
 */
const getSupportedDriverList = () => {
  let supportedDriverList = ["memory"];
  if (window?.localStorage && systemStores.localStorage) {
    supportedDriverList.push("localStorage");
  }
  if (window?.sessionStorage && systemStores.sessionStorage) {
    supportedDriverList.push("sessionStorage");
  }
  if (window?.document && "cookie" in window?.document && systemStores.cookie) {
    supportedDriverList.push("cookie");
  }
  if (window?.indexedDB && systemStores.indexedDB) {
    supportedDriverList.push("indexedDB");
  }
  supportedDriverList = supportedDriverList.concat(Object.keys(externalStores));
  return supportedDriverList;
};

/**
 *
 * @param {String} driver the store driver
 * @return {Class} the store class
 */
const getStoreClass = (driver) => {
  return systemStores[driver] || externalStores[driver];
};

export { getSupportedDriverList, getStoreClass };
