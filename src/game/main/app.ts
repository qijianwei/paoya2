import UpdateManager from '../../wx/manager/UpdateManager'
import Toast from '../../wx/Toast'
import PaoYa from '../../paoya';

export default class Application extends Laya.EventDispatcher {

    launchOption: LaunchOption
    /**是否是第一次启动 */
    isFirstLaunch = true

    constructor() {
        super()
        this._init();
        let launchOption = py.getLaunchOptionsSync()
        let query = launchOption.query || {}
        if (launchOption.referrerInfo && launchOption.referrerInfo.extraData) {
            let extraData = launchOption.referrerInfo.extraData
            query['token'] = extraData.token || ''
            query['baseURL'] = extraData.baseURL || ''
            query['type'] = extraData.to || 0
            query['p'] = extraData.p
        }
        console.warn(`LAUNCH | origin | ${JSON.stringify(launchOption)}`)
        console.warn(`LAUNCH | true |${JSON.stringify(launchOption)}`)
        this.launchOption = launchOption
        this._initPlatform()
        this._checkUpdate()
    }

    _init() {

    }

    _initPlatform() {
        py.init()
        /**转发 */
        py.onShareAppMessage(() => {
            let msg = PaoYa.navigator.onShareAppMessage()
            if (msg) {
                return msg
            } else {
                return this.onShareAppMessage()
            }
        })
    }

    _checkUpdate() {
        let manager = new UpdateManager()
        manager.on(UpdateManager.HAS_UPDATE, this, function () {

        })
        manager.on(UpdateManager.UPDATE_READY, this, function (cb) {
            Toast.showModal("提示", "新版本下载成功", "重启", function () {
                cb && cb()
            })
        })
        manager.on(UpdateManager.UPDATE_FAIL, this, function () {

        })
    }

    /**返回用户【转发】消息 */
    onShareAppMessage() {
        return null
    }

    /**退出当前小游戏 */
    exit() {
        py.exit()
    }
}