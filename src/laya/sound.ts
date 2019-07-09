export default class SoundManager extends Laya.SoundManager {
    static onShowHandler: Function
    static onHideHandler: Function
    static onAudioInterruptionBeginHandler: Function
    static onAudioInterruptionEndHandler: Function

    static onShow() {
        // this._windowFocus()
        this.onShowHandler && this.onShowHandler()
    }
    static onHide() {
        // this._windowBlur()
        this.onHideHandler && this.onHideHandler()
    }
    static onAudioInterruptionBegin() {
        // this._windowBlur()
        this.onAudioInterruptionBeginHandler && this.onAudioInterruptionBeginHandler()
    }
    static onAudioInterruptionEnd() {
        // this._windowFocus()
        this.onAudioInterruptionEndHandler && this.onAudioInterruptionEndHandler()
    }
    static _windowFocus() {
        Laya.stage['_isFocused'] = true;
        Laya.stage.event(/*laya.events.Event.FOCUS*/"focus");
        Laya.stage.event(/*laya.events.Event.FOCUS_CHANGE*/"focuschange");

    }
    static _windowBlur() {
        Laya.stage['_isFocused'] = false;
        Laya.stage.event(/*laya.events.Event.BLUR*/"blur");
        Laya.stage.event(/*laya.events.Event.FOCUS_CHANGE*/"focuschange");

    }
}