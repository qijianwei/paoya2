import LoginService from "../game/service/LoginService";

export default class NotificationCenter {
    static defaultCenter = new Laya.EventDispatcher()
    /**监听通知中心的消息 */
    static on(type: string, caller: any, listener: Function, args?: any[]): Laya.EventDispatcher {
        return this.defaultCenter.on(type, caller, listener, args)
    }
    static addLoginNotification(caller: any, listener: Function){
        if (LoginService.isLogined){
            listener.call(caller)
        } else {
            NotificationCenter.once(NotificationName.LoginSuccess,caller,listener)
        }
    }
    /**监听通知中心的消息，只监听一次 */
    static once(type: string, caller: any, listener: Function, args?: Array<any>): Laya.EventDispatcher {
        return this.defaultCenter.once(type, caller, listener, args)
    }
    /**向通知中心发送Notification */
    static event(type: string, data?: any): boolean {
        return this.defaultCenter.event(type, data)
    }
    /**取消监听通知中心消息 */
    static off(type: string, caller: any, listener: Function, onceOnly?: boolean): Laya.EventDispatcher {
        return this.defaultCenter.off(type, caller, listener, onceOnly)
    }
    /**取消通知中心某种类型的消息 */
    static offAll(type?: string): Laya.EventDispatcher {
        return this.defaultCenter.offAll(type)
    }
    /**取消通知中心所有类型的消息 */
    static offAllCaller(caller: any): Laya.EventDispatcher {
        return this.defaultCenter.offAllCaller(caller)
    }
    /**向通知中心发送Notification */
    static postNotification(type: string, data?: any): boolean {
        return this.defaultCenter.event(type, data)
    }
}

//要扩展NotificationName，请在const.js 中重点标明
export class NotificationName {
    static ApplicationShow = 'app-show'
    static ApplicationHide = 'app-hide'

    static GameShow = 'game-show'

    static NetworkChanged = 'network-changed'
    static LoginSuccess = 'login-success'
    static GOLD_CHANGE = 'CHANGE_GOLD'
    static RMB_CHANGE = 'rmb-change'
    static START_GAME = 'start-game'
}