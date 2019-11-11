import DataCenter from '../DataCenter'
import UpdateManager from '../../wx/manager/UpdateManager'
import PaoYa from '../../paoya';
import Toast from '../../wx/Toast'
import Navigator from '../../core/navigator/Navigator'
import LaunchScreenView from '../view/LaunchScreenView';

export default class Game extends Laya.EventDispatcher {
    /**当前游戏的ID */
    gameId = 1001
    /**是否已登录 */
    isLogined = false
    /**已经授权访问用户信息，只在登录之前有用，登录之后该值不再起作用 */
    isAuthed = false
    loadNetworkRes = false
    navigator: Navigator
    launchOption: LaunchOption
    /**是否是第一次启动 */
    isFirstLaunch = true

    constructor(public params: GameConfig) {
        super()
        this.params.debug = this.params.debug || false
        this.gameId = params.gameId
        //只在限制游戏包体的runtime中才去网上下载资源
        if (this.isMiniGame) {
            this.loadNetworkRes = this.params.loadNetworkRes == undefined ? true : this.params.loadNetworkRes
        }

        this.initLaya()
        //初始化导航控制器
        DataCenter.RESURL = `https://xgamejuedixiaomie.goxiaochengxu.cn/${this.gameId}/`
        DataCenter.adUnitId = params.adUnitId
        DataCenter.bannerUnitId = params.bannerUnitId
        DataCenter.interstitialUnitId=params.interstitialUnitId
        DataCenter.adUnitIdLong=params.adUnitIdLong
        DataCenter.qqViewId = params.qqViewId || 1003
        DataCenter.appSid=params.appSid
        this.configNavigator()
        this.setupConfig()
        this.initLaunchOption()
        this.checkUpdate()
        Laya.timer.callLater(this, this.initPlatform)
    }
    get isMiniGame(): boolean {
        return py.isMiniGame() && !Laya.Render.isConchApp
    }
    /**初始化Laya引擎，子类可重写此方法，实现自己的界面展示 */
    initLaya() {
        let width=0,height=0;
        if (this.params.portrait == undefined || this.params.portrait) {
             width = this.params.width || 750
             height = this.params.height || 1334
        } else {
             width = this.params.width || 1334
             height = this.params.height || 750
        }
        
        let config = this.params
        if (window['Laya3D']) {
            Laya3D.init(width, height)
        } else {
            Laya.init(width, height, config.webGL || Laya.WebGL)
        }

        Laya["Physics"] && Laya["Physics"].enable()
        //显示当前调试状态
        if (this.params.debug) {
            config.showStat && Laya.Stat.show();
            (config.showDebugTool || Laya.Utils.getQueryString('debug') == 'true') && Laya["DebugPanel"] && Laya["DebugPanel"].enable()
            Laya["PhysicsDebugDraw"] && Laya["PhysicsDebugDraw"].enable()
            // Laya.alertGlobalError = true
        }

        //屏幕适配相关
        let stage = Laya.stage
        let Stage = Laya.Stage
        stage.alignH = config.alignH || Stage.ALIGN_CENTER
        stage.alignV = config.alignV || Stage.ALIGN_MIDDLE
        if (config.portrait == undefined || config.portrait) {
            stage.screenMode = Stage.SCREEN_VERTICAL
            stage.scaleMode = config.scaleMode || Stage.SCALE_FIXED_WIDTH
        } else {
            stage.screenMode = Stage.SCREEN_HORIZONTAL
            stage.scaleMode = config.scaleMode || Stage.SCALE_FIXED_HEIGHT;
        }
        // stage.frameRate = Stage.FRAME_MOUSE;

        let sprite = new Laya.Sprite()
        let Browser = Laya.Browser
        sprite.graphics.drawRect(0, 0, Browser.width, Browser.height, "#000000")
        stage.addChild(sprite)
        this._setupResLoadConfig()
        //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, function () {
            LaunchScreenView.show(this.params.portrait)
            Laya.AtlasInfoManager.enable('fileconfig.json', Laya.Handler.create(this, this.loadRes))
        }), Laya.ResourceVersion.FILENAME_VERSION); 
    }
    initLaunchOption() {
        let launchOption = py.getLaunchOptionsSync()
        launchOption.referrerInfo = launchOption.referrerInfo || { extraData: {} } as LaunchReferrerInfo
        launchOption.referrerInfo.extraData = launchOption.referrerInfo.extraData || {} as LaunchExtraData
        console.warn(`LAUNCH | ${JSON.stringify(launchOption)}`)
        this.launchOption = launchOption
    }
    configNavigator() {
        PaoYa.navigator = this.navigator = new Navigator()
        let view = Laya.Scene.root,portrait=true;
        if(this.params.portrait==undefined||this.params.portrait){
            portrait=true;
        }else{
            portrait=false;
        }
        if (view) {     
            let resize = function () {
                Navigator.adjustViewPosition(this,portrait)
            }
            view.on(Laya.Event.RESIZE, view, resize)
            resize.call(view)
        }
    }
    _setupResLoadConfig() {
        Laya.loader.retryNum = 3
        Laya.loader.retryDelay = 2000
        Laya.loader.maxLoader = 5
        if (Laya["MiniAdpter"]) {
            let files = Laya.MiniAdpter.nativefiles || []
            files.push('local')
            Laya.MiniAdpter.nativefiles = files
        }
        if (Laya.URL.formatURL) { Laya.URL['formatURLCopy'] = Laya.URL.formatURL }
        Laya.URL.formatURL = (url: string) => {
            if (Laya.URL['formatURLCopy']) {
                url = Laya.URL['formatURLCopy'](url)
            }
            if (this.loadNetworkRes && (url.indexOf('remote/') >= 0||url.indexOf('font/') >= 0) && url.indexOf('http') < 0){
                url = DataCenter.RESURL + url
            }
            return url
            // if (!url) return 'null path'
            // if (url.indexOf('http') >= 0) return url
            // if (!this.loadNetworkRes) {
            //     if (Laya.URL['formatURLCopy']) {
            //         return Laya.URL['formatURLCopy'](url)
            //     } else {
            //         return url
            //     }
            // }
            // if (url.indexOf('remote/') >= 0) {
            //     if (Laya.URL['formatURLCopy']) {
            //         url = Laya.URL['formatURLCopy'](url)
            //     }
            //     return DataCenter.RESURL + url
            // }
            // if (Laya.URL['formatURLCopy']) {
            //     return Laya.URL['formatURLCopy'](url)
            // }
            // return url
        }
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true
    }
    initPlatform() {
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

    checkUpdate() {
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
    /**初始化首屏界面 */
    initRootScene(launchOption: LaunchOption, isFirstLaunch: boolean) {

    }
    /**必要的初始化操作放在该方法中 */
    setupConfig() {

    }
}
