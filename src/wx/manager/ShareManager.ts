import NotificationCenter, { NotificationName } from '../../core/NotificationCenter';
import Toast from '../Toast';

class ShareService {
    private successHandler: Function = null
    private failHandler: Function = null
    private inShare = false
    private shareTime = 0
    constructor() {
        NotificationCenter.on(NotificationName.ApplicationShow, this, this.onShow)
    }

    onShow(res) {
        if (!this.successHandler) return
        if (Date.now() - this.shareTime < 3000) {
            this.shareTime = 0
            if(this.failHandler){
                this.failHandler('分享到群才可以哦')
                this.stopObserve()
                return
            }
        }
        let random = Math.floor(Math.random() * 3)
        random = 0
        if (random == 0) {
            this.successHandler(res)
            this.successHandler = null
        } else {
            if (this.failHandler) {
                this.failHandler('请分享至群')
                this.failHandler = null
            }
        }
        this.stopObserve()
    }
    startObserve(suc, fail) {
        this.shareTime = Date.now()
        this.successHandler = suc
        this.failHandler = fail
    }
    stopObserve() {
        this.successHandler = null
        this.failHandler = null
    }

}

export default class ShareManager {
    /**分享的图片地址，可以是本地图片，也可以是网络图片 */
    static imageURL: string
    /**分享的图片地址，可以高度自定义 */
    static makeShareImageURLHandler: () => string
    /**自定义方法处理分享的query，比如添加全局统一参数,返回的是个对象 */
    static makeQueryHandler: Function
    /**是否验证群ID */
    static checkGroup = false
    /**记录分享状态 */
    static isShare = false
    static _shareService: ShareService = null
    /**组织分享 */
    static makeShareInfo(title, image = this.imageURL, query, success, fail = null) {
        if (this.makeQueryHandler) { query = this.makeQueryHandler(query) }
        console.warn(`分享出去的参数为${JSON.stringify(query)}`)
        return {
            title: title,
            imageUrl: image,
            query: toQueryString(query), //必须是 key1=val1&key2=val2 的格式。
            success: success,
            fail() {
                fail && fail()
            }
        }
    }
    /**分享主要方法，需要传入所有参数 */
    static share(title: string, image: string, query, success, fail = null) {
        let imageURL = image
        if (!imageURL) { imageURL = this.getShareImageURL() }
        if (!imageURL) {
            console.error("必须指定分享图片地址，建议使用ShareManager.imageURL全局设置统一分享图片")
            return
        }
        this.isShare=true;
        this._shareService || (this._shareService = new ShareService())
        let shareService = this._shareService
        if (window['wx']) { //只有在没有回调的平台中，才会去伪造分享成功返回
            shareService.startObserve(success, fail)
        }
        py.shareAppMessage(this.makeShareInfo(title, image, query, (res) => {
            shareService.stopObserve()
            console.warn("SHARE | " + JSON.stringify(res))
            success && success(res)
            // let isGroup = res.shareTickets && res.shareTickets.length > 0
            // if (isGroup && this.checkGroup) {
            //     let shareTicket = res.shareTickets[0];
            //     this.getShareInfo(shareTicket, (encryptedData, iv) => {
            //         success && success(isGroup, encryptedData, iv)
            //     }, () => {
            //         fail && fail()
            //     })
            // } else {
            //     success && success(isGroup)
            // }
        }, (res) => {
            shareService.stopObserve()
            fail && fail(res)
        }))
    }
    /**分享方法，可以不用传入图片，图片将从 ShareManager.imageURL 获取 */
    static shareTitle(title, query, success, fail = null) {
        let imageURL = this.getShareImageURL()
        if (!imageURL) {
            console.error("必须指定 ShareManager.imageURL 才可执行此方法")
            return
        }
        this.share(title, imageURL, query, success, fail)
    }
    /**获取分享内容 */
    static getShareInfo(shareTicket, suc, fail) {
        py.getShareInfo({
            shareTicket: shareTicket,
            timeout: 60000,
            success(res) {
                console.log("SHARE | getShareInfo | " + JSON.stringify(res))
                suc && suc(res)
            },
            fail: fail
        })
    }
    static getShareImageURL() {
        let imageURL = null
        if (this.makeShareImageURLHandler) {
            imageURL = this.makeShareImageURLHandler()
        }
        if (typeof imageURL !== 'string') {
            imageURL = this.imageURL
            console.warn('ShareManager.makeShareImageURLHandler 必须返回 string 类型的图片地址')
        }
        return imageURL
    }
}

function toQueryString(params) {
    var items = [], queryStr = ""
    for (var key in params) {
        items.push(key + "=" + params[key])
    }
    if (items.length) {
        queryStr = items.join("&")
    }
    return queryStr;
}