import Request from '../network/Request'
import ShareManager from '../../wx/manager/ShareManager'
import NotificationCenter from '../NotificationCenter';
import Client from '../network/Client';
import PaoYa from '../../paoya'
import RewardedVideoAd from '../../wx/ad/rewardedVideoAd';
import BannerAd from '../../wx/ad/bannerAd';
import DataCenter from '../../game/DataCenter';
export default class Component extends Laya.Script {
    private _requests: Array<Request> = []
    private socket: Client = PaoYa.socket
    private dialogs: Array<Laya.Dialog> = []
    private bannerAds: Array<BannerAd> = []
    navigator = PaoYa.navigator

    _onEnable() {
        super._onEnable()
        this.owner.addClickListener(this, this.onThrottleClick, true)
    }
    _onViewClick(e: Laya.Event) {
        switch (e.target.name) {
            case 'pop':
                this.navigator.pop()
                break
            case 'popToRoot':
                this.navigator.popToRootScene()
                break
        }
        this.onThrottleClick(e)
    }
    /**有节制的点击，防止用户点击频率过快，默认间隔500ms */
    onThrottleClick(e) {

    }
    _onLoad(){
        this.onLoad()
    }
    onLoad(){

    }
    _onAppear() {
        this.showAllBannerAd()
        this.onAppear()
    }
    onAppear() {

    }
    _onDisappear() {
        this.hideAllBannerAd()
        this.onDisappear()
    }
    onDisappear() {

    }
    _destroy() {
        this.offMessageListener()
        this.offNotificationListener()
        this.destroyXMR()
        this.destroyBannerAd()
        super._destroy()
    }

    _onReceiveMessage(cmd: string, value: any) {
        if (!this.enabled) return
        this.onReceiveMessage(cmd, value)
    }
    _onReceiveSocketError(cmd: string, code: number, message: string) {
        this.onReceiveSocketError(cmd, code, message)
    }
    /**当前 scene 收到服务器 socket 命令时触发，虚方法 */
    onReceiveMessage(cmd: string, value: any) {

    }
    /**当前 scene 收到服务器socket命令错误时触发，虚方法 */
    onReceiveSocketError(cmd: string, code: number, message: string) {
    }
    /**添加socket事件监听 */
    onMessage(name: string, caller: any, listener: Function, args?: any[]) {
        this.socket.on(name, caller, listener, args)
    }
    /**移除socket的事件监听 */
    private offMessageListener() {
        this.socket.offAllCaller(this)
    }
    /**向socket发送消息 */
    sendMessage(cmd: string, params: any) {
        this.socket.sendMessage(cmd, params)
    }

    /**向通知中心注册消息，以便接收回调 */
    onNotification(name: string, caller: any, listener: Function, args?: any[]) {
        NotificationCenter.on(name, caller, listener, args)
    }
    /**移除通知中心的当前对象监听 */
    private offNotificationListener() {
        NotificationCenter.offAllCaller(this)
    }
    /**向通知中心发送消息，以便触发相关通知 */
    postNotification(name: string, params?: any) {
        NotificationCenter.postNotification(name, params)
    }
    /**接收通知中心发送过来的消息，以便处理相关逻辑，虚方法 */
    onReceiveNotification(name: string, params: any) {

    }
    _onReceiveNotification(name: string, params: any) {
        if (!this.enabled) return
        this.onReceiveNotification(name, params)
    }

    /** ================ Request ================ **/
    GET(path: string, params: object | Function, success: Function, fail: Function) {
        //TODO:
        //1、支持动态参数
        if (params instanceof Function) {
            success = params as Function
            params = {}
            fail = success
        }
        let xmr = Request.GET(path, params, (value) => {
            success.call(this, value)
        }, (msg, code) => {
            fail.call(this, msg, code)
        })
        this._requests.push(xmr)
    }
    POST(path: string, params: object | Function, success: Function, fail: Function) {
        //1、支持动态参数
        if (params instanceof Function) {
            success = params as Function
            params = {}
            fail = success
        }
        let xmr = Request.POST(path, params, (res) => {
            success.call(this, res)
        }, (msg, code) => {
            fail.call(this, msg, code)
        })
        this._requests.push(xmr)
    }
    destroyXMR() {
        for (let i = this._requests.length - 1; i >= 0; i--) {
            let xmr = this._requests.pop();
            if (xmr.http.readyState != XMLHttpRequest.DONE) {
                xmr.http.abort && xmr.http.abort();
            }
        }
    }
    /** ================ Share ================ **/
    /**分享主要方法，需要传入所有参数 */
    share(title: string, image: string, query: object | Function, success?: Function, fail?: Function): void {
        if (query instanceof Function) {
            fail = success
            success = query
            query = {}
        }
        //TODO: 
        //1、支持动态参数
        //2、支持新版本回掉
        ShareManager.share(title, image, query, (res) => {
            success && success.call(this, res)
        }, fail&&fail.bind(this))
    }
    /**分享方法，可以不用传入图片，图片将从 ShareManager.imageURL 获取 */
    shareTitle(title: any, query: any, success: any, fail?: any): void {
        ShareManager.shareTitle(title, query, success, fail)
    }

    shareDefault(query: any = {}, success?: any, fail?: any): void {
        if (typeof query == 'function') {
            success = query
            fail = success
            query = {}
        }
        let title = DataCenter.config.game.share_list.randomItem
        this.shareTitle(title, query, success, fail)
    }

    showRewardedVideoAd(params) {
        RewardedVideoAd.show(params)
    }
    showBannerAd(params) {
        let ad = BannerAd.show(params)
        this.bannerAds.push(ad)
        return ad
    }
    /**显示当前Component中所有的banner广告 */
    showAllBannerAd() {
        for (let i = 0, length = this.bannerAds.length; i < length; i++) {
            let ad = this.bannerAds[i]
            ad.show()
        }
    }
    hideAllBannerAd() {
        for (let i = 0, length = this.bannerAds.length; i < length; i++) {
            let ad = this.bannerAds[i]
            ad.hide()
        }
    }
    destroyBannerAd() {
        for (let i = 0, length = this.bannerAds.length; i < length; i++) {
            let ad = this.bannerAds[i]
            ad.hide()
            ad.destroy()
        }
    }

    /** ================ 微信方法分发 ================ **/
    _onShow(res) {
        this.onShow(res)
    }
    /**进入前台时执行，由游戏事件分发主动调用 */
    onShow(res) {

    }
    _onHide(res) {
        this.onHide(res)
    }
    /**进入后台时执行，由游戏事件分发主动调用 */
    onHide(res) {

    }
    popup(dialog: Laya.Dialog) {
        if (dialog instanceof Laya.Dialog) {
            dialog.popup()
            this.dialogs.push(dialog)
        } else {
            console.error('当前popup的不是Dialog实例')
        }
    }
    closeDialogs() {
        for (let i = 0, length = this.dialogs.length; i < length; i++) {
            let dialog = this.dialogs[i]
            dialog.destroy()
        }
    }
    /**点击右上角转发时触发 */
    onShareAppMessage(): object {
        return null
    }
    /**当网络变化时调用 */
    onNetworkChange(e) {

    }
    /**当socket断开时调用 */
    onSocketClose() {

    }
}