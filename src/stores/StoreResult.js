const StoreResult = {
  OK: Symbol('OK'),
  KEY_NOT_EXISTS: Symbol('KEY_NOT_EXISTS'),
  KEY_EXPIRED: Symbol('KEY_EXPIRED'),
  NX_SET_NOT_PERFORMED: Symbol('NX_SET_NOT_PERFORMED'),
  XX_SET_NOT_PERFORMED: Symbol('XX_SET_NOT_PERFORMED'),
};
export default StoreResult;
