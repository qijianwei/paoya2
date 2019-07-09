import DataTrack from '../../dataTrack/dataTrack'
import NotificationCenter, { NotificationName } from '../../core/NotificationCenter'
import PaoYa from '../../paoya'

export class SocketConfig {
    static zone = "";
}
export default class Socket extends Laya.Socket {
    /**重连配置 */
    static reconnectConfig = {
        total: 3,      //总重连次数
        interval: 3,   //重连间隔
        duration: 8   //后续重连间隔
    }
    /**当前是否在重连 */
    isReconnecting = false
    /**当前重连次数 */
    reconnectTimes = 0

    get canReconnect(): boolean {
        let networkMonitor = PaoYa.networkMonitor;
        let lifeCircleMonitor = PaoYa.lifeCircleMonitor;
        console.log(`SOCKET是否连接:    ${this.connected ? "是" : "否"}`)
        console.log(`是否在前台:        ${lifeCircleMonitor.inForeground ? "是" : "否"}`)
        console.log(`网络是否连接:      ${networkMonitor.isConnected ? "是" : "否"}`)
        console.log(`是否正在重连:      ${this.isReconnecting ? "是" : "否"}`)
        return !this.connected && lifeCircleMonitor.inForeground && networkMonitor.isConnected && !this.isReconnecting;
    }
    constructor(public url) {
        super()
        // this.addObserver()
    }
    addObserver() {
        // NotificationCenter.on(NotificationName.NetworkChanged, this, this._startReconnect)
    }
    /**切换服务器 */
    changeUrl(url) {
        if (url != this.url) {
            this.url = url
            if (this.isReconnecting) {
                this._stopReconnect()
            }
            if (this.connected) {
                this['_connected'] = false
                this.close()
            }
            Laya.timer.once(500, this, () => {
                this.connect()
            })
        }
    }
    /**重写父类方法 */
    _onOpen(e) {
        super._onOpen(e)
        console.log(`S | OPEN: | ${JSON.stringify(e)}`)
        if (this.isReconnecting) {
            this._stopReconnect()
            this.onReconnectEnd()
        }
    }

    //{code:1006,reason:"abnormal closure"}服务器主动断开连接
    //{code:1000} 用户主动断开连接
    _onClose(e) {
        super._onClose(e)
        console.log(`S | CLOSE: | ${JSON.stringify(e)}`)
        // if (e.code == 1000) {
        //     return
        // }
        // if (e.code && e.code == 1006) { //网络原因导致的
        //     this._startReconnect(Socket.reconnectConfig.duration);
        // } else {
        //     this._startReconnect(Socket.reconnectConfig.interval);
        // }
    }
    /**重写父类方法 */
    _onMessage(msg) {
        super._onMessage(msg)
        if (!msg || !msg.data) return
        let data = msg.data
        this.handleMessage(data)
    }
    /**重写父类方法 */
    _onError(e) {
        super._onError(e)
        console.log(`S | Error: | ${JSON.stringify(e)}`)
    }

    /**处理消息返回内容，子类需重写 */
    handleMessage(msg) { }

    /**自定义方法，便于快速执行 */
    connect() {
        if (this.isReconnecting || this.connected) return
        this.connectByUrl(this.url)
    }
    /**重写父类方法 */
    connectByUrl(url) {
        DataTrack.startSocketTime()
        this.url = url;
        super.connectByUrl(url);
    }
    startWatchDog() {
        Laya.timer.loop(5000, this, this.handleWatchDog)
    }
    handleWatchDog() {
        if (this.connected) {
            this.stopWatchDog()
        } else {
            this._startReconnect()
        }
    }
    stopWatchDog() {
        Laya.timer.clear(this, this.handleWatchDog)
    }
    /**开始重连 */
    _startReconnect(interval = Socket.reconnectConfig.interval) {
        if (!this.canReconnect) return
        this.reconnectTimes = 0
        this._reconnect()
        this.onReconnectStart()
        this.isReconnecting = true
        Laya.timer.loop(interval * 1000, this, this._reconnect)
    }
    /**停止重连 */
    _stopReconnect() {
        if (!this.isReconnecting) return
        this.isReconnecting = false
        this.reconnectTimes = 0
        Laya.timer.clear(this, this._reconnect)
    }
    /**执行重连方法 */
    _reconnect() {
        if (this.connected){
            this._stopReconnect()
            this.onReconnectEnd()
            return
        }
        let config = Socket.reconnectConfig;
        if (this.reconnectTimes < config.total) {
            this.connect();
            this.reconnectTimes++;
            this.onReconnecting(this.reconnectTimes, config.total)
            if (this.reconnectTimes > config.total / 2) {
                Laya.timer.clear(this, this._reconnect);
                Laya.timer.loop(config.duration * 1000, this, this._reconnect);
            }
        } else {
            this._stopReconnect();
            this.onReconnectFail()
        }
    }

    /**子类重写 */
    onReconnecting(times, total) {
        this.event(Socket.RECONNECT_PROGRESS, [times, total])
    }
    onReconnectStart() {
        this.event(Socket.RECONNECT_START, [this.reconnectTimes, Socket.reconnectConfig.total])
    }
    onReconnectEnd() {
        this.event(Socket.RECONNECT_END)
    }
    onReconnectFail() {
        this.event(Socket.RECONNECT_FAIL)
    }

    static RECONNECT_START = "socket.reconnect.start";
    static RECONNECT_END = 'socket.reconnect.end';
    static RECONNECT_FAIL = 'socket.reconnect.fail';
    static RECONNECT_PROGRESS = 'socket.reconnect.progress';
}