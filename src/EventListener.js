import mitt from 'mitt';

export default class EventListener {
    mitt = new mitt();
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
