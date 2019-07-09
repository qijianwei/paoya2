import View from "./View"
import Component from "./Component"
import DataCenter from "../../game/DataCenter";

const commonScenes = {
    TurnTableView: "common/GameResult/TurnTableView",
    GameResultView: 'common/GameResult/GameResultView',

    IFHostView: 'common/InviteFriend/IFHostView',
    IFMemberView: 'common/InviteFriend/IFMemberView',

    IntegralMallView: "common/Mall/IntegralMallView",

    MatchView: 'common/Match/MatchView',
    MatchGradeView: 'common/Match/MatchGradeView',

    RankView: 'common/Rank/RankView',
    RankGroupView: 'common/Rank/RankGroupView',

    QTRoomView: 'common/QTRoom/QTRoomView',

    HomeView: 'HomeView',

    FBView: 'common/InviteFriend/FBView'
}

export default class Navigator extends Laya.EventDispatcher {
    static setupLoadingViewHandler: Function
    /**所有场景的map数据 */
    static scenesMap:object = {}
    scenes: Array<View> = []
    visibleScene: View
    constructor() {
        super()
    }
    popup(sceneName: string, params?: any, complete?: Laya.Handler, progress?: Laya.Handler, closeOther = true) {
        Laya.Scene.load(this.makeDialogName(sceneName), Laya.Handler.create(null, function (dialog: Laya.Dialog) {
            dialog.isModal = true
            dialog.isShowEffect = false
            dialog["params"] = params
            dialog.open(closeOther, params)
            complete && complete.runWith(dialog)
        }), progress)
    }
    push(sceneName: string, params?: any, resURL?: any, complete?: Laya.Handler, progress?: Laya.Handler, prepare?: any) {
        this._open(sceneName, params, resURL, complete, progress, prepare, true)
    }
    pop() {
        DataCenter.refreshUserInfo()
        this.scenes.pop().close('pop')

        let scene = this.scenes[this.scenes.length - 1]
        this.activeScene(scene)
    }
    popToLastScene(sceneName: string) {

    }
    findSceneByName(sceneName: string): View {
        let desScene = null
        for (let i = this.scenes.length - 1; i >= 0; i--) {
            let scene = this.scenes[i]
            if (scene.sceneName.indexOf(sceneName) != -1) {
                desScene = scene;
                break
            }
        }
        return desScene;
    }
    popToScene(sceneName: string) {
        DataCenter.refreshUserInfo()
        for (let i = this.scenes.length; i--; i >= 0) {
            let scene = this.scenes[i]
            if (scene.sceneName === sceneName) {
                this.activeScene(scene)
                break
            } else {
                this.scenes.pop().close('pop')
            }
        }
    }
    activeScene(scene) {
        !scene.visible && (scene.visible = true)
        this.visibleScene = scene
        this._onAppear()
    }
    popToRootScene() {
        DataCenter.refreshUserInfo()
        if (this.scenes.length == 1) return
        while (this.scenes.length > 1) {
            this.scenes.pop().close('pop')
        }
        let scene = this.scenes[this.scenes.length - 1]
        this.activeScene(scene)
    }
    present(sceneName: string, params?: any, resURL?: any, complete?: Laya.Handler, progress?: Laya.Handler, prepare?: any) {
        this._open(sceneName, params, resURL, complete, progress, prepare, false)
    }
    dismiss() {
        this.pop()
    }
    replace(sceneName, params) {
        var scene
        for (var i = this.scenes.length - 1; i >= 0; i--) {
            scene = this.scenes[i]
            scene.destroy()
            this.scenes.pop()
            if (scene.sceneName == sceneName) {
                this.visibleScene = null;
                this.push(sceneName, params)
                return;
            }
        }
        console.error('错误的:' + sceneName)
    }
    /**在视图栈中动态替换指定的scene，实现逻辑为
     * 1、找到指定的oldScene所在的位置，并pop到她所在的位置
     * 2、用newScene替换掉它
     *
     */
    replaceSceneWith(oldScene,newSceneName, params){
        var scene;
        var index = this.scenes.indexOf(oldScene)
        if(index < 0){
            console.error("指定的scene未包含在navigator中");
            return;
        }
        for (var i = this.scenes.length - 1; i >= index; i--) {
            scene = this.scenes[i];
            scene.destroy();
            this.scenes.pop();
        }
        this.visibleScene = null;
        this.push(newSceneName, params);
    }
    visibleSceneIs(sceneName: string): boolean {
        return this.visibleScene.sceneName.indexOf(sceneName) > -1
    }
    makeSceneName(name): string {
        if (commonScenes[name]) {
            return `scenes/${commonScenes[name]}.scene`
        }
        if(Navigator.scenesMap[name]){
            return `${Navigator.scenesMap[name]}.scene`
        }
        return `gamescenes/${name}.scene`
    }
    makeDialogName(name): string {
        if (name.indexOf('/') == 0) {
            return `gamescenes${name}.scene`
        }
        return `scenes/dialog/${name}.scene`
    }
    _open(sceneName: string, params?: any, resURL?: any, complete?: Laya.Handler, progress?: Laya.Handler, prepare?: any, hidePre = true) {
        let urls = []
        if (resURL instanceof Array) {
            urls = urls.concat(resURL)
        } else if (typeof resURL == 'string') {
            urls.push(resURL)
        } else if (resURL instanceof Laya.Handler) {
            complete = resURL
            progress = complete
            prepare = progress
        }
        urls.push(this.makeSceneName(sceneName))
        Laya.Scene['_prepareHandler'] = prepare
        Laya.Scene.open(urls, false, params, Laya.Handler.create(this, function (scene: View) {
            //handle pre scene
            if (this.scenes.length > 0) {
                let preScene = this.scenes[this.scenes.length - 1]
                preScene.visible = !hidePre
                this._onDisappear()
            }
            scene.autoDestroyAtClosed = true
            scene.sceneName = sceneName
            this.visibleScene = scene
            this.scenes.push(scene)
            this._onLoad()
            this._onAppear()
            complete && complete.runWith(scene)
        }), progress)
    }
    static setupLoadingPage(isFirstScene, cb) {
        let url = isFirstScene ? 'scenes/common/Loading/LoadingView.scene' : 'scenes/common/Loading/LoadWaitingView.scene'
        let page = Laya.Scene['_loadPage']
        if (page && page.url == url) return
        Laya.Scene.load(url, Laya.Handler.create(this, function (scene) {
            var stage = Laya.stage
            var screenWidth = Laya.Browser.width
            var screenHeight = Laya.Browser.height
            var width = stage.designWidth
            var height = stage.designHeight
            var scaleX = screenWidth / width
            var y = (screenHeight - height * scaleX >> 1) / scaleX
            scene.y = Math.floor(y)
            Laya.Scene.setLoadingPage(scene)
            cb && cb()
        }))
    }
    static adjustViewPosition(view) {
        var stage = Laya.stage
        var screenWidth = Laya.Browser.width
        var screenHeight = Laya.Browser.height
        var width = stage.designWidth
        var height = stage.designHeight
        var scaleX = screenWidth / width
        var y = (screenHeight - height * scaleX >> 1) / scaleX
        view.y = Math.floor(y)
    }

    /**================= dispatch system event =================**/
    _onReceiveMessage(cmd: string, value: any, code?: number, message?: string) {
        this._dispatchEvent('_onReceiveMessage', cmd, value)
    }
    _onReceiveSocketError(cmd: string, code: number, message: string) {
        this._dispatchEvent('_onReceiveMessage', cmd, code, message)
    }
    _onReceiveNotification(name: string, params: any) {
        this._dispatchEvent('_onReceiveNotification', name, params)
    }
    _onReceiveSocketClose() {
        if (!this.visibleScene) return
        let components: Array<Component> = this.visibleScene['_components'] || [], shareMsg = null
        components.forEach((item) => {
            if (item.onSocketClose) { item.onSocketClose() }
        })
    }
    _onReceiveNetworkChange(res){
        this._dispatchEvent('onNetworkChange',res)
    }
    onShareAppMessage(): object {
        if (!this.visibleScene) return
        let components: Array<Component> = this.visibleScene['_components'] || [], shareMsg = null
        components.forEach((item) => {
            if (item.onShareAppMessage) { shareMsg = item.onShareAppMessage() }
        })
        return shareMsg
    }
    _onShow(res) {
        this._dispatchEvent('_onShow', res)
    }
    _onHide(res) {
        this._dispatchEvent('_onHide', res)
    }
    _onLoad(){
        this._dispatchEvent('_onLoad')
    }
    _onAppear() {
        this._dispatchEvent('_onAppear')
    }
    _onDisappear() {
        this._dispatchEvent('_onDisappear')
    }
    _dispatchEvent(method, p1?, p2?, p3?, p4?, p5?) {
        if (!this.visibleScene) return
        this.visibleScene.dispatchLifeCycleEvent(method, p1, p2, p3, p4, p5)
    }
}