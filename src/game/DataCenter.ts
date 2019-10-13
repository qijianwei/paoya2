import Utils from '../utils/utils';
import Observer from '../core/Observer';
import Request from '../core/network/Request';
import { PrizeType } from './enums'
import PaoYa from '../paoya';

interface PrizeInfo {
    type: PrizeType,
    value: string
}
export default class DataCenter {
    /**登录信息 */
    static loginData: LoginData
    static config: ConfigList
    /**当前用户信息 */
    static user: UserInfo
    static adUnitId:string
    static bannerUnitId:string //微信平台Banner的
    static interstitialUnitId:string//微信平台插屏广告
    static adUnitIdLong:string
    static qqViewId:number //QQ平台展示Banner广告的类型
    static gameStartTime:number //游戏开始时间

    static userInfoAuth:boolean //用户信息是否授权
    /**CDN资源地址 */
    static CDNURL: string = 'https://xgamejuedixiaomie.goxiaochengxu.cn/'
    static RESURL: string = 'https://xgamejuedixiaomie.goxiaochengxu.cn/'

    static showBannerAdWhenDialogPopup = true

    static GAMERES:string|Array<string>
    static GAMEPREPARE:any

    /**用户金币数变更监听 */
    static gold: Observer = new Observer()
    /**用户提现变更监听 */
    static rmb: Observer = new Observer()
    /**用户积分变更监听 */
    static integral: Observer = new Observer()
     /**用户钻石变更监听 */
    static diamond :Observer=new Observer()
    /**通过天梯ID获取天梯 */
    static findLadderById(id) {
        let result = this.loginData.config_list.game.ladder_config.filter((item) => {
            return item.id == id
        })
        return result[0]
    }
    /**获取天梯的段位icon */
    static makeLadderIconById(id) {
        let ladder = ""
        let ladderItem = this.findLadderById(id)
        if (ladderItem) {
            ladder = Utils.makeIcon(ladderItem.icon)
        }
        return ladder
    }

    static formatPrize(prize: string): Array<PrizeInfo> {
        let allPrize = prize.split(",")
        if (allPrize.length == 0) { return }
        let prizes = []
        allPrize.forEach((item, index) => {
            let prizeInfo = item.split("-")
            if (prizeInfo && prizeInfo.length == 2) {
                prizes.push({
                    type: prizeInfo[0],
                    value: prizeInfo[1]
                })
            }
        })
        return prizes
    }
    /**更新用户信息，包括豆子、红包等 */
    static refreshUserInfo() {
        if (!PaoYa.lifeCircleMonitor.inForeground)return
        Request.GET('update_chips', {}, (res) => {
            if (res.pao_gold != undefined) {
                this.gold.value = res.pao_gold
                this.user.gold = res.pao_gold
            }
            if (res.rmb != undefined) {
                this.rmb.value = res.rmb
                this.user.rmb = res.rmb
            }
            if (res.integral != undefined){
                this.integral.value = res.integral
                this.user.integral = res.integral
            }
            if (res.gold != undefined) {
                this.gold.value = res.gold;
                this.user.gold = res.gold;
            }
            if (res.diamond != undefined) {
                this.diamond.value = res.diamond;
                this.user.diamond = res.diamond;
            }
        }, (res) => {
            console.warn('更新用户信息失败')
        })
    }
}

/**
{
    "code": 200, 
    "time": 1543495809, 
    "message": "", 
    "value": {
        "gender": "男", 
        "member_province": "", 
        "member_city": "", 
        "resurrection_card": 1, 
        "timing_url": "wss://lobby.xingqiu123.com/", 
        "ladder_id": 0, 
        "login_bonus": 0, 
        "lobby_daily_first_login": false, 
        "nickname": "渡", 
        "mobile_bind_status": 0, 
        "id": 108125, 
        "is_first_game": 0, 
        "member_country": "冰岛", 
        "member_gold": 16041, 
        "wx_bind_status": 1, 
        "isProduction": 1, 
        "is_new": false, 
        "is_show": 1, 
        "token": "ud0Hhhv+4Ek0mn3G+2vpWelog+aifGxzX0wNnbWRG2w=", 
        "game_url": "wss://websocket.xingqiu123.com/", 
        "app_game_url": "ws://websocket.xingqiu123.com:8443/", 
        "member_rmb": "206.00", 
        "member_integral": 934, 
        "is_review": 0, 
        "config_list": {
            "game": {
                "match_cost": 10, 
                "introduce_time": 0, 
                "ladder_config": [ ], 
                "share_list": [
                    "我用三副同花顺碾压对家，快来赢红包领好礼！", 
                    "99%的智慧+1%的运气，这！就是伯恩
"
                ], 
                "game_time": 180, 
                "name": "伯恩扑克", 
                "match_type": [
                    {
                        "cost": 5, 
                        "name": "新手场", 
                        "limit": "7-100", 
                        "reward_integral": 10, 
                        "quick_limit": "0-50", 
                        "id": 94, 
                        "entry_fee": 2, 
                        "status": 1
                    }, 
                    {
                        "cost": 20, 
                        "name": "初级场", 
                        "limit": "25-500", 
                        "reward_integral": 10, 
                        "quick_limit": "50-300", 
                        "id": 95, 
                        "entry_fee": 5, 
                        "status": 1
                    }, 
                    {
                        "cost": 50, 
                        "name": "中级场", 
                        "limit": "60", 
                        "reward_integral": 10, 
                        "quick_limit": "300", 
                        "id": 96, 
                        "entry_fee": 10, 
                        "status": 1
                    }
                ], 
                "share_img": [
                    "game/share/1019_2.png", 
                    "game/share/1019_1.png"
                ], 
                "id": 1019, 
                "jsonconfig": {
                    "match_info": {
                        "ladder": 0, 
                        "pass": 0, 
                        "ordinary": 1, 
                        "share": 1, 
                        "is_jump": 1, 
                        "promotion": 0
                    }, 
                    "match_info_app": {
                        "ladder": 0, 
                        "pass": 0, 
                        "ordinary": 1, 
                        "share": 1, 
                        "is_jump": 1, 
                        "promotion": 0
                    }, 
                    "share_task": "5;1&1-10#3&1-10#5&1-15", 
                    "round_limit_count": "30", 
                    "game_reward": "10-50;15-100"
                }, 
                "strategy": "当一方血量减为0时，则游戏结束;当轮到你操作的时候，一定要尽快操作，停留时间越长，扣血越多;使用小策略来消除多的道具砖块，来获得增益buff吧"
            }, 
            "common_config": {
                "share_info": [
                    {
                        "img": "wxgame/qrcode/hitmouse.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/da_di_shu.sk", 
                        "appId": "wx17e66e26685ed5d0", 
                        "game_id": 1004
                    }, 
                    {
                        "img": "wxgame/qrcode/petgo.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/men_chong.sk", 
                        "appId": "wx28a78997b4784ef1", 
                        "game_id": 1005
                    }, 
                    {
                        "img": "wxgame/qrcode/food.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/mei_shi_jia.sk", 
                        "appId": "wx405ee3ea1e491440", 
                        "game_id": 1006
                    }, 
                    {
                        "img": "wxgame/qrcode/reversi.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/fan_fan_le.sk", 
                        "appId": "wx786d0c5f03d1c2fc", 
                        "game_id": 1007
                    }, 
                    {
                        "img": "wxgame/qrcode/xiaoxl.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/xiao_xiao_le.sk", 
                        "appId": "wx1fa0ca658a9a0ce6", 
                        "game_id": 1008
                    }, 
                    {
                        "img": "wxgame/qrcode/jump.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/tiao_yi_tiao.sk", 
                        "appId": "wxff74aa65beb1ba7e", 
                        "game_id": 1009
                    }, 
                    {
                        "img": "wxgame/qrcode/onlyme.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/bi_wu_chang.sk", 
                        "appId": "wxcaae4fff0e46aead", 
                        "game_id": 1011
                    }, 
                    {
                        "img": "wxgame/qrcode/coupling.png", 
                        "spine_url": "https://res.xingqiu123.com/wxgame/intro/chai_san_qing_lv.sk", 
                        "appId": "wxa163f2723eef4ea3", 
                        "game_id": 1012
                    }
                ], 
                "hall_img": "wxgame/qrcode/hall.png"
            }, 
            "item_list": [
                {
                    "pao_gold": 100, 
                    "price": 1, 
                    "free_gold": 0, 
                    "id": 13
                }, 
                {
                    "pao_gold": 600, 
                    "price": 6, 
                    "free_gold": 10, 
                    "id": 14
                }, 
                {
                    "pao_gold": 1800, 
                    "price": 18, 
                    "free_gold": 50, 
                    "id": 15
                }, 
                {
                    "pao_gold": 3000, 
                    "price": 30, 
                    "free_gold": 100, 
                    "id": 16
                }, 
                {
                    "pao_gold": 9800, 
                    "price": 98, 
                    "free_gold": 388, 
                    "id": 17
                }, 
                {
                    "pao_gold": 19800, 
                    "price": 198, 
                    "free_gold": 1288, 
                    "id": 18
                }
            ]
        }, 
        "avstar": "https://wx.qlogo.cn/mmopen/vi_32/ECOJ2KphCSiajao15elMo77txvPhpMqhLFsF2MOPM1FJxmVYRlSQCdv8icicPCPic69ibOQFIewKibMmgkQtokAEibrxA/132", 
        "age": 18, 
        "is_receive_boy": 0, 
        "app_timing_url": "ws://lobby.xingqiu123.com:8443/"
    }
}
 */