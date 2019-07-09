/**为View添加了JSONView变量，用于记录该View的创建JSON，方便从JSON创建view */
export default class View extends Laya.View {
    /**用于记录打开当前scene时，从外部传进来的数据 */
    params: any = null
    sceneName: string = ''
    constructor() {
        super()
        this.setupJSONView()
        this.createJSONView()
        this._addClickListener()
    }
    /**为当前View的子View设置JSONView，方便统一进行处理，虚方法 */
    setupJSONView(){

    }
    createJSONView(){
        let json = this.constructor['JSONView']
        json && this.createView(json)
    }

    /**添加点击事件监听，以便进行简单处理 */
    _addClickListener() {
        let prototype = View.prototype
        if (this.onClick !== prototype.onClick) {
            this.on(Laya.Event.CLICK, this, this._onClick)
        }
    }
    _onClick(e: Laya.Event) {
        this.onClick(e)
    }
    /**当前Scene被点击时调用，虚方法 */
    onClick(e: Laya.Event) {

    }
    _onAppear() {
        this.onAppear()
    }
    onAppear() {

    }
    _onDisappear() {
        this.onDisappear()
    }
    onDisappear() {
    }
    _onAdded() {
        super._onAdded()
        this.onAdded()
    }
    _onRemoved() {
        super._onRemoved()
        this.onRemoved()
    }
    onAdded() {

    }
    onRemoved() {

    }
    open(closeOther = false, param: any) {
        this.params = param
        super.open(closeOther, param)
    }
}