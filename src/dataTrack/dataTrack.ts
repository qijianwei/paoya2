import MTA from './mta_analysis'
import Request from '../core/network/Request'
import Game from '../game/main/game'
import PaoYa from '../paoya'

export default class DataTrack {
    static loginCostTime: Object = {}
    static socketCostTime: number = 0
    static socketLoginTime: number = 0

    static setup(appID = "500624773", eventID = "500624774", options) {
        MTA.App.init({
            "appID": appID,
            "eventID": eventID,
            "lauchOpts": options
        });
    }
    static track(type: DataTrackType, params) {
        if (!params.gameId && PaoYa.game.gameId) {
            params.gameId = PaoYa.game.gameId
        }
        if (params.data) {
            let value = JSON.parse(params.data)
            value.T = PaoYa.networkMonitor.type
            params.data = JSON.stringify(value)
        }
        console.log(`T | upload | ${JSON.stringify(params)}`)
        MTA.Event.stat(type + '', params);
    }
    static trackType(type: DataTrackType) {
        Request.POST('userStatistics', { type: type }, null)
    }
    static now() {
        return new Date().valueOf()
    }
    static startTrackTime(id: string) {
        this.loginCostTime[id] = DataTrack.now()
    }
    static stopTrackTime(id: string) {
        let time = this.loginCostTime[id]
        let delta = DataTrack.now() - time
        this.loginCostTime[id] = delta
        console.warn(`T | ${id} | cost | ${delta} ms`)
    }

    static startSocketTime() {
        this.socketCostTime = DataTrack.now()
    }
    static stopSocketTime() {
        let time = DataTrack.now() - this.socketCostTime
        console.warn(`T | Socket | cost | ${time}ms`)
        this.track(DataTrackType.SocketTimeCost, {
            data: JSON.stringify({
                t: time
            })
        })
    }

    static startSocketLogin() {
        this.socketLoginTime = DataTrack.now()
    }
    static stopSocketLogin() {
        let time = DataTrack.now() - this.socketLoginTime
        console.warn(`T | Socket login | cost | ${time}ms`)
        this.track(DataTrackType.SocketLoginTimeCost, { data: JSON.stringify({ t: time }) })
    }

    static uploadLoginCostTime() {
        let upload = JSON.stringify(this.loginCostTime)
        console.log(`T | login | upload | ${upload}`)
        this.track(DataTrackType.LoginTimeCost, { data: upload })
    }
}

export enum DataTrackType {
    LoginTimeCost = 3001,
    SocketTimeCost = 3002,
    SocketLoginTimeCost = 3003,
    SocketRetry = 3004,
    HTTPRetry = 3005,

    Ladder = 1001,          //天梯赛
    FriendBattle = 1002,    //好友对战
    RedPacket = 1003,       //红包赛
    PlayOffline = 1004,     //单人游戏
    Rank = 1004,            //排行榜
    HallBack = 1006,        //返回大厅
    WithDraw = 1007,        //提现按钮
    Jump = 1008,            //顶部跳转其他游戏按钮
    Change = 1009           //换换手气
}