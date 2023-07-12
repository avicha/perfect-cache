import BaseStore from "./BaseStore";

export default class IndexedDBStore extends BaseStore {
  static driver = "indexedDB";
  dbName = "perfect-cache";
  objectStoreName = "perfect-cache";
  dbVersion = undefined;
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
    this.init().catch(() => {
      if (this.dbConnection) {
        this.upgradeToVersion(this.dbConnection.version + 1);
      } else {
        this.upgradeToVersion();
      }
    });
  }
  init() {
    return this.connectDB().then(() => {
      return this.initObjectStore();
    });
  }
  upgradeToVersion(newVersion) {
    if (this.dbConnection) {
      this.dbConnection.close();
      this.dbVersion = newVersion;
    } else {
      this.dbVersion = undefined;
    }
    window.console.debug(
      `Database ${this.dbName} store ${this.objectStoreName} is upgrading to version ${this.dbVersion}...`
    );
    this.init()
      .then(() => {
        window.console.debug(
          `Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} success.`
        );
      })
      .catch((err) => {
        window.console.error(
          `Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} failed.`,
          err
        );
      });
  }
  connectDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (e) => {
        window.console.error(
          `Database ${this.dbName} store ${this.objectStoreName} init version ${this.dbVersion} occurs error`,
          e
        );
        reject(e);
      };
      request.onsuccess = () => {
        this.dbConnection = request.result;
        this.dbVersion = this.dbConnection.version;
        window.console.debug(
          `Database ${this.dbName} store ${this.objectStoreName} version ${this.dbConnection.version} initialised.`
        );
        this.dbConnection.onversionchange = (event) => {
          window.console.debug(
            `The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${event.oldVersion} to ${event.newVersion}`
          );
          this.upgradeToVersion(event.newVersion);
        };
        resolve(this.dbConnection);
      };
      request.onupgradeneeded = (event) => {
        this.dbConnection = event.target.result;
        this.dbVersion = this.dbConnection.version;
        window.console.debug(
          `Database ${this.dbName} store ${this.objectStoreName} upgrade needed as oldVersion is ${event.oldVersion} and newVersion is ${event.newVersion}.`
        );
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
            this.ready(resolve);
          };
        } else {
          this.ready(resolve);
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
          window.console.error("Database get occurs error", request.result);
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
          window.console.error("Database put occurs error", request.result);
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
          window.console.error("Database count occurs error", request.result);
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
  removeItem(key) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], "readwrite")
          .objectStore(this.objectStoreName)
          .delete(this.__getRealKey(key));
        request.onerror = () => {
          window.console.error("Database delete occurs error", request.result);
          reject(request.result);
        };
        request.onsuccess = () => {
          resolve();
        };
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        reject(error);
      }
    });
  }
  keys() {
    const keys = [];
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], "readonly")
          .objectStore(this.objectStoreName)
          .openCursor();
        request.onerror = () => {
          window.console.error(
            "Database openCursor occurs error",
            request.result
          );
          reject(request.result);
        };
        request.onsuccess = (e) => {
          var cursor = e.target.result;
          if (cursor) {
            if (cursor.key.startsWith(this.prefix)) {
              keys.push(cursor.key.replace(this.prefix, ""));
            }
            cursor.continue();
          } else {
            resolve(keys);
          }
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
