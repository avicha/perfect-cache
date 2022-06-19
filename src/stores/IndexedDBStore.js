import AsyncStore from './AsyncStore';
export default class IndexedDBStore extends AsyncStore {
  static driver = 'indexedDB';
  dbName = 'browser-cache';
  objectStoreName = 'browser-cache';
  dbVersion = 1;
  dbConnection;
  constructor(opts) {
    super(opts);
    this.isReady = false;
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
        window.console.debug('Database version upgraded success.');
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
          this.dbConnection.createObjectStore(this.objectStoreName, {
            keyPath: 'key',
          });
        }
        this.isReady = true;
        this.$emit('ready');
        resolve();
      } else {
        const error = new Error(
          `Database ${this.dbName} connection is not initialised.`
        );
        window.console.error(error);
        reject(error);
      }
    });
  }
  keyValueGet(key) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], 'readonly')
          .objectStore(this.objectStoreName)
          .get(key);
        request.onerror = () => {
          window.console.error(
            'Database keyValueGet occurs error',
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
        window.console.error(error);
        reject(error);
      }
    });
  }
  keyValueSet(key, value) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], 'readwrite')
          .objectStore(this.objectStoreName)
          .put({ key, value });
        request.onerror = () => {
          window.console.error(
            'Database keyValueSet occurs error',
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
        window.console.error(error);
        reject(error);
      }
    });
  }
  existsKey(key) {
    return new Promise((resolve, reject) => {
      if (this.dbConnection) {
        const request = this.dbConnection
          .transaction([this.objectStoreName], 'readonly')
          .objectStore(this.objectStoreName)
          .count(key);
        request.onerror = () => {
          window.console.error(
            'Database existsKey occurs error',
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
        window.console.error(error);
        reject(error);
      }
    });
  }
}
