import Socket from './Socket'
import Toast from '../../wx/Toast'
import DataTrack, { DataTrackType } from '../../dataTrack/dataTrack'
import Main from '../../game/main/main'
import Game from '../../game/main/game'
import PaoYa from '../../paoya'

export class ClientConfig {
    static watchDogTime = 5
    static maxRetryTime = 3
}
interface CacheCmd {
    cmd: string
    params: object
}

export default class Client extends Socket {
    static ignoreCmds = []
    static _ignoreCmds = [
        'betpk', 'startmatch', 'joinmatch', 'cancelmatch', 'matchagain',
        'cancelagain', 'promotionenroll', 'cancelenroll', 'laddermatch', 'cancelladdermatch',
        'demandpk', 'matchreject', 'sharestartgame', 'wheel_index','qq_join_room','receive_invite']
    static ignorePathThroughCmds = ['heartbeat']
    msgsSending: CacheCmd[] = []
    msgsSent: string[] = []
    map: Object = {}

    constructor(url=null) {
        super(url)
    }
    /**发送socket消息 */
    sendMessage(cmd: string, params) {
        if (!params.game_id && PaoYa.game) {
            params.game_id = PaoYa.game.gameId
        }
        params.command = cmd;

        let time = (new Date()).valueOf()
        params.m_id = time

        if (this.map[time] == undefined) {
            this.map[time] = 0
        } else {
            this.map[time] = this.map[time]++
        }
        var msg = JSON.stringify(params);
        if (this.connected) {
            if (cmd !== 'heartbeat') {
                console.log(`S >>> | ${cmd} | ${JSON.stringify(params)}`);
            }
            this.send(msg);
            let shouldCheck = true
            let cmds = Client.ignoreCmds
            for (let i = 0; i < cmds.length; i++) {
                let command = cmds[i]
                if (cmd === command) {
                    shouldCheck = false
                    break
                }
            }
            cmds = Client._ignoreCmds
            for (let i = 0; i < cmds.length; i++) {
                let command = cmds[i]
                if (cmd === command) {
                    shouldCheck = false
                    break
                }
            }
            if (shouldCheck) {
                this.msgsSent.push(msg)
            }
        } else {
            this.msgsSending.push({ cmd: cmd, params: params })
            if (!this.isReconnecting && this.url) {
                this._startReconnect()
            }
            console.warn("缓存socket命令，等待连接成功后再次发送");
        }
    }
    /**处理socket消息 */
    handleMessage(msg) {
        super.handleMessage(msg)
        var obj = JSON.parse(msg)
        var cmd = obj.command
        var value = obj.value
        var code = obj.code
        var message = obj.message || "请求出错"
        if (cmd !== 'heartbeat') {
            console.log(`S <<< | ${cmd} | ${JSON.stringify(value)}`)
        }
        if (cmd == Client.LOGIN) { this.onLogin() }
        this.event(cmd, [value, code, message])
        this.dispatchResultToNavigator(cmd, value, code, message, obj.errorcode)
        //remove item
        this.removeMsg(obj)
    }
    dispatchResultToNavigator(cmd, value, code, message, errorcode) {
        if (code != 200) {
            PaoYa.navigator._onReceiveSocketError(cmd, errorcode, message)
            console.error(`S <<< | ${cmd} | ${errorcode} | ${message}`)
        } else {
            if (Client.ignorePathThroughCmds.indexOf(cmd) < 0) {
                PaoYa.navigator._onReceiveMessage(cmd, value)
            }
        }
    }

    onLogin() {
        console.log('WebSocket登录成功')
        console.log(`S: | sending | msgs: ${this.msgsSending.length}个`)
        this.msgsSending.forEach(msg => {
            this.sendMessage(msg.cmd, msg.params)
        })
        // let msg = this.msgsSending.shift()
        // msg && this.send(msg)
        this.msgsSending.length = 0
        this.startWatchDog()
        this.startHeartBeat()
    }

    startWatchDog() {
        Laya.timer.loop(ClientConfig.watchDogTime, this, this.checkCmd)
    }

    stopWatchDog() {
        //测试是否需要清空历史命令
        this.msgsSent.length = 0
        Laya.timer.clear(this, this.checkCmd)
    }

    checkCmd() {
        let currentTimestamp = (new Date()).valueOf()
        this.msgsSent.forEach((item, index) => {
            let msg: ClientMessage = JSON.parse(item)
            if (msg.m_id && (currentTimestamp - msg.m_id > 5 * 1000)) {
                if (msg.retryTime < ClientConfig.maxRetryTime) {
                    //resend msg
                    DataTrack.track(DataTrackType.SocketRetry, { c: msg.command, t: msg.retryTime })
                    this.sendMessage(msg.command, msg)
                } else {
                    this.event(msg.command, [{}, -1, '请求超时'])
                    console.error(`命令 ${msg.command} 请求超时，如有误报，请在Main中添加ignoreCmds参数`)
                }
                //remove item
                this.removeMsg(msg)
            }
        })
    }
    removeMsg(msg: ClientMessage) {
        for (let i = 0; i < this.msgsSent.length; i++) {
            let item: ClientMessage = JSON.parse(this.msgsSent[i])
            if (item.m_id == msg.m_id) {
                this.msgsSent.splice(i, 1)
                delete this.map[item.m_id]
            }
        }
    }

    _onClose(e) {
        super._onClose(e)
        PaoYa.navigator._onReceiveSocketClose()
        this.stopHeartBeat()
        this.stopWatchDog()
    }

    startHeartBeat() {
        Laya.timer.loop(15000, this, this.handleHeartBeat)
    }
    stopHeartBeat() {
        Laya.timer.clear(this, this.handleHeartBeat)
    }
    handleHeartBeat() {
        this.sendMessage(Client.HEART_BEAT, {})
    }

    /**子类重写 */
    onReconnecting(cur, total) {
        super.onReconnecting(cur, total)
        Toast.showLoading(`连接中(${cur}/${total})`, true)
    }
    onReconnectStart() {
        super.onReconnectStart()
        this.stopHeartBeat()
        Toast.showLoading("正在连接...")
    }
    onReconnectEnd() {
        super.onReconnectEnd()
        Toast.hideLoading()
        Toast.showSuccess("连接成功", 1500)
    }
    onReconnectFail() {
        super.onReconnectFail()
        Toast.hideLoading()
        Toast.showSuccess("连接失败", 1500)
    }

    //通用命令
    static HEART_BEAT = "heartbeat"
    static DISCONNECT = "disconnect"
    static LEAVE_ROOM = 'leave_room'
    static LOGIN = 'login'

    //匹配
    static MATCH_SUCCESS = "matchsuccess"
    static MATCH_FAIL = "matchfail"
    static MATCH_JOIN = "joinmatch"
    static MATCH_CANCEL = "cancelmatch"

    //天梯
    static LADDER_MATCH_JOIN = "laddermatch"
    static LADDER_MATCH_CANCEL = "cancelladdermatch"

    //游戏阶段
    static GAME_START_MATCH = 'startmatch'
    static GAME_START_GAME = 'startpkgame'
    static GAME_START_PK = 'startpk'
    static GAME_BET = 'betpk'
    static GAME_END_PK = 'endpk'
    static GAME_END_PKGAME = 'endpkgame'

    //再来一局
    static AGIAN_SEND = 'matchagain'
    static AGAIN_REJECT = 'matchreject'
    static AGAIN_CANCAL = 'cancelagain'

    //赛事
    static CHAMPIONSHIP_JION = 'promotionenroll'
    static CHAMPIONSHIP_CANCEL = 'cancelenroll'
    static CHAMPIONSHIP_UPDATE_ROOM_COUNT = 'updateCount'
    static CHAMPIONSHIP_UPDATE_TOTAL_COUNT = 'updatecurUserCount'

    //分享
    static SHARE_START_GAME = "sharestartgame"
    static SHARE_INVITE_FRIEND = "invite_friend"
    static SHARE_RECEIVE_INVITE = "receive_invite"
    // static SHARE_LEAVE_ROOM = "shareleaveroom"

    //群约战pk
    static GROUP_JOIN_ROOM = "groupjoinroom"
    static GROUP_ROOM_STATUS = "grouproomStatus"
}