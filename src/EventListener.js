import mitt from 'mitt';

export default class EventListener {
  mitt = new mitt();
  get all() {
    return this.mitt.all;
  }
  $on() {
    return this.mitt.on.apply(this, arguments);
  }
  $off() {
    return this.mitt.off.apply(this, arguments);
  }
  $emit() {
    return this.mitt.emit.apply(this, arguments);
  }
}
