import { DataCenter, SoundManager } from "../../export";

export default class RewardedVideoAd extends Laya.EventDispatcher {
    static LOAD = 'load_ad'
    static ERROR = 'error_ad'
    static CLOSE = 'close_ad'
    static ad: RewardedVideoAd = null
    isLoaded = false
    videoAd
    constructor(params) {
        super()
        this.createAd(params)
    }
    createAd(params) {
        let _this = this
        let videoAd = py.createRewardedVideoAd({ adUnitId: params.adUnitId,appSid:DataCenter.appSid })
        videoAd.onLoad(function (res) {
            _this.isLoaded = true
            _this.event(RewardedVideoAd.LOAD, res)
        })
        videoAd.onError(function (res) {
            _this.isLoaded = false
            if(window['BK']){
                res = {
                    errMsg:res.msg,
                    errCode:res.code
                }
            }
            _this.event(RewardedVideoAd.ERROR, res)
        })
        videoAd.onClose(function (res) {
            _this.isLoaded = false
            /**兼容微信低版本 */
            if (!res) { res = { isEnded: true } }
            _this.event(RewardedVideoAd.CLOSE, res)
            SoundManager.onAudioInterruptionEnd()
        })
        this.videoAd = videoAd
    }
    show() {
        if(window['BK']){
            this.videoAd.show()
        } else {
            if (this.isLoaded){
                this.videoAd.show()
            } else {
                this.videoAd.load()
                this.once(RewardedVideoAd.LOAD,this,function(){
                    this.videoAd.show()
                })
            }
        }
    }
    static show(params,isLong?:boolean) {
        if (window['wx'] && !DataCenter.adUnitId) {
            console.error('请在Main中设置adUnitId之后再观看广告')
            return
        }
        if(isLong==undefined||!isLong){
            if (!this.ad) {
                this.ad = new RewardedVideoAd({ adUnitId: DataCenter.adUnitId,appSid:DataCenter.appSid })
            }  
        }else{     
            if (!this.ad) {
                this.ad = new RewardedVideoAd({ adUnitId: DataCenter.adUnitIdLong,appSid:DataCenter.appSid })
            }     
        }
        
        let ad = this.ad
        ad.offAllCaller(this)
        ad.on(this.LOAD, this, params.onLoad)
        ad.on(this.ERROR, this, params.onError)
        ad.on(this.CLOSE, this, params.onClose)
        SoundManager.onAudioInterruptionBegin()
        ad.show()
    }
}