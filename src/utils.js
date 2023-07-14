import { systemStores, externalStores } from "./stores";
import debug from "debug";
const cacheDebugger = debug("perfect-cache");
const indexedDBDebugger = cacheDebugger.extend("indexedDB");
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

const connectToIndexedDB = (dbName, dbVersion) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, dbVersion);
    request.onerror = (e) => {
      window.console.error(
        `Database ${dbName} version ${dbVersion} initialised error.`,
        e
      );
      reject(e);
    };
    request.onsuccess = () => {
      const dbConnection = request.result;
      const dbVersion = dbConnection.version;
      indexedDBDebugger(
        `Database ${dbName} version ${dbVersion} initialised success.`
      );
      resolve(dbConnection);
    };
    request.onupgradeneeded = (event) => {
      const dbConnection = event.target.result;
      indexedDBDebugger(
        `Database ${dbName} upgrade needed as oldVersion is ${event.oldVersion} and newVersion is ${event.newVersion}.`
      );
      resolve(dbConnection);
    };
  });
};

export {
  getSupportedDriverList,
  getStoreClass,
  connectToIndexedDB,
  cacheDebugger,
  indexedDBDebugger,
};
