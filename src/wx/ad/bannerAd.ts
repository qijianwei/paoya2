import { DataCenter } from "../../export";

export default class BannerAd extends Laya.EventDispatcher {
    static LOAD = 'load_ad'
    static ERROR = 'error_ad'
    static RESIZE = 're-size'
    ad
    constructor(params= {} as BannerAdObject) {
        super()
        params.adUnitId = params.adUnitId || DataCenter.bannerUnitId
        params.viewId = params.qqViewId || DataCenter.qqViewId
        if (!params.style) {
            let style = {} as any
            if (window['wx']) {
                style.top = style.left = 0
                style.width = Laya.Browser.clientWidth||300
            } else if (window['BK']) {
                style.x = 0
                style.y = 0
            }
            params.style = style
        }
        let ad = py.createBannerAd(params), _this = this
        ad.onLoad(function (res) {
            _this.event(BannerAd.LOAD, res)
        })
        ad.onError(function (res) {
            _this.event(BannerAd.ERROR, res)
        })
        if (window['wx']) {
            let screenWidth = Laya.Browser.clientWidth, screenHeight = Laya.Browser.clientHeight
            ad.onResize((res) => {
                let bannerAd = ad['bannerAd']
                bannerAd.style.left = (screenWidth - res.width) / 2
                if(!params.style.top){
                    bannerAd.style.top = screenHeight - res.height
                }
                _this.event(BannerAd.RESIZE, [bannerAd, res, screenWidth, screenHeight])
            })
        }
        this.ad = ad
    }
    show() {
        this.ad.show()
    }
    hide() {
        this.ad.hide()
    }
    destroy() {
        this.ad.destroy()
        this.offAllCaller(BannerAd)
    }
    static show(params): BannerAd {
        let ad = new BannerAd(params)
        ad.on(BannerAd.LOAD, this, params.onLoad)
        ad.on(BannerAd.ERROR, this, params.onError)
        ad.on(BannerAd.RESIZE, this, params.onResize)
        ad.show()
        return ad
    }
    static hide(bannerAd) {
        bannerAd.hide()
    }
    static destroy(bannerAd) {
        bannerAd.destroy()
    }
}