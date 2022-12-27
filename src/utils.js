import { systemStores, externalStores } from './stores';

const getSupportedDriverList = () => {
  let supportedDriverList = ['memory'];
  if (window?.localStorage && systemStores.localStorage) {
    supportedDriverList.push('localStorage');
  }
  if (window?.sessionStorage && systemStores.sessionStorage) {
    supportedDriverList.push('sessionStorage');
  }
  if (window?.document?.cookie && systemStores.cookie) {
    supportedDriverList.push('cookie');
  }
  if (window?.indexedDB && systemStores.indexedDB) {
    supportedDriverList.push('indexedDB');
  }
  supportedDriverList = supportedDriverList.concat(Object.keys(externalStores));
  return supportedDriverList;
};

const getStoreClass = (driver) => {
  return systemStores[driver] || externalStores[driver];
};

export { getSupportedDriverList, getStoreClass };
