export default class BaseStore {
  get() {
    throw new Error('please implement the get method for this driver.');
  }
  set() {
    throw new Error('please implement the set method for this driver.');
  }
}
