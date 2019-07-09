export default class Observer extends Laya.EventDispatcher {
    _value: any
    set value(newValue) {
        this._value = newValue
        this.event(Laya.Event.CHANGED, newValue)
    }
    get value() {
        return this._value
    }
    addObserver(caller: any, method: Function) {
        method.call(caller, this._value)
        this.on(Laya.Event.CHANGED, caller, method)
    }
    removeObserver(caller: any, method: Function) {
        this.off(Laya.Event.CHANGED,caller,method)
    }
}