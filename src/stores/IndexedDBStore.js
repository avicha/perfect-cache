import BaseStore from "./BaseStore";

export default class IndexedDBStore extends BaseStore {
  static driver = "indexedDB";
  dbName = "perfect-cache";
  objectStoreName = "perfect-cache";
  dbVersion = 1;
  dbConnection;
  constructor(opts) {
    super(opts);
    if (this.opts?.dbName) {
      this.dbName = this.opts.dbName;
    }
    if (this.opts?.objectStoreName) {
      this.objectStoreName = this.opts.objectStoreName;
    }
    if (this.opts?.dbVersion) {
      this.dbVersion = this.opts.dbVersion;
    }
    this.connectDB().then(() => {
      this.initObjectStore();
    });
  }
  connectDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => {
        window.console.error(
          `Database ${this.dbName} init occurs error`,
          request.result
        );
        reject(request.result);
      };
      request.onsuccess = () => {
        this.dbConnection = request.result;
        window.console.debug(`Database ${this.dbName} initialised.`);
        resolve(this.dbConnection);
      };
      request.onupgradeneeded = (event) => {
        this.dbConnection = event.target.result;
        window.console.debug("Database version upgraded success.");
        resolve(this.dbConnection);
      };
    });
  }
  initObjectStore() {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        if (
          !this.dbConnection.objectStoreNames.contains(this.objectStoreName)
        ) {
          window.console.debug(
            `ObjectStore ${this.objectStoreName} is not exists, now creating it!`
          );
          const objectStore = this.dbConnection.createObjectStore(
            this.objectStoreName,
            {
              keyPath: "key",
            }
          );
          // Use transaction oncomplete to make sure the objectStore creation is
          // finished before adding data into it.
          objectStore.transaction.oncomplete = (event) => {
            window.console.debug(
              `ObjectStore ${this.objectStoreName} is created now.`
            );
            this.ready();
            resolve();
          };
        } else {
          this.ready();
          resolve();
        }
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        reject(error);
      }
    });
  }
  keyValueGet(key) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], "readonly")
          .objectStore(this.objectStoreName)
          .get(this.__getRealKey(key));
        request.onerror = () => {
          window.console.error(
            "Database keyValueGet occurs error",
            request.result
          );
          reject(request.result);
        };
        request.onsuccess = () => {
          resolve(request.result?.value);
        };
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        reject(error);
      }
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], "readwrite")
          .objectStore(this.objectStoreName)
          .put({ key: this.__getRealKey(key), value });
        request.onerror = () => {
          window.console.error(
            "Database keyValueSet occurs error",
            request.result
          );
          reject(request.result);
        };
        request.onsuccess = () => {
          resolve(request.result?.value);
        };
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        reject(error);
      }
    });
  }
  existsKey(key) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], "readonly")
          .objectStore(this.objectStoreName)
          .count(this.__getRealKey(key));
        request.onerror = () => {
          window.console.error(
            "Database existsKey occurs error",
            request.result
          );
          reject(request.result);
        };
        request.onsuccess = () => {
          resolve(!!request.result);
        };
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        reject(error);
      }
    });
  }
}
