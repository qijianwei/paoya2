import { DataCenter } from "../../export";
import BannerAd from "../../wx/ad/bannerAd";

export default class Dialog extends Laya.Dialog {
    showBannerAdWhenDialogPopup = true
    constructor() {
        super()
        this.createJSONView()
    }
    createJSONView() {
        let json = this.constructor['JSONView']
        json && this.createView(json)
    }
    _onAdded(){
        super._onAdded()
        this.onAdded()
        this._showBannerAd()
    }
    onAdded(){

    }
    _onRemoved(){
        super._onRemoved()
        this.onRemoved()
        this._hideBannerAd()
    }
    onRemoved(){

    }
    _showBannerAd() {
        if (this.showBannerAdWhenDialogPopup && DataCenter.showBannerAdWhenDialogPopup) {
            this['bannerAd'] = BannerAd.show({})
        }
    }
    _hideBannerAd() {
        if (this['bannerAd']) {
            let bannerAd = this['bannerAd'] as BannerAd
            BannerAd.hide(bannerAd)
            BannerAd.destroy(bannerAd)
        }
    }
}