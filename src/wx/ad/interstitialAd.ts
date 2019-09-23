import { DataCenter, SoundManager } from "../../export";

export default class InterstitialAd extends Laya.EventDispatcher {
    static LOAD = 'load_ad'
    static ERROR = 'error_ad'
    static CLOSE = 'close_ad'
    static ad: InterstitialAd = null
    isLoaded = false
    interstitialAd
    constructor(params) {
        super()
        this.createAd(params)
    }
    createAd(params) {
        let _this = this
        let interstitialAd = wx.createInterstitialAd({ adUnitId: params.adUnitId })
        interstitialAd.onLoad(function (res) {
            _this.isLoaded = true
            _this.event(InterstitialAd.LOAD, res)
        })
        interstitialAd.onError(function (res) {
            _this.isLoaded = false
            if(window['BK']){
                res = {
                    errMsg:res.msg,
                    errCode:res.code
                }
            }
            _this.event(InterstitialAd.ERROR, res)
        })
        interstitialAd.onClose(function (res) {
            _this.isLoaded = false
            /**兼容微信低版本 */
            if (!res) { res = { isEnded: true } }
            _this.event(InterstitialAd.CLOSE, res)
            SoundManager.onAudioInterruptionEnd()
        })
        this.interstitialAd = interstitialAd
    }
    show() {
        if(window['BK']){
            this.interstitialAd.show()
        } else {
            if (this.isLoaded){
                this.interstitialAd.show()
            } else {
                this.interstitialAd.load()
                this.once(InterstitialAd.LOAD,this,function(){
                    this.interstitialAd.show().then(null,res=>{
                        this.event(InterstitialAd.ERROR, res)
                    })
                    
                })
            }
        }
    }
    static show(params) {
        if (window['wx'] && !DataCenter.interstitialUnitId) {
            console.error('请在Main中设置interstitialUnitId之后再观看广告')
            return
        }
        if (!this.ad) {
            this.ad = new InterstitialAd({ adUnitId: DataCenter.interstitialUnitId})
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