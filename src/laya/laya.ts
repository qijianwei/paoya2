import Utils from "../utils/utils";

Laya.View.prototype.createViewFromJSON = function (url: string, complete: Laya.Handler) {
    if (!url) return
    let type = Laya.Utils.getFileExtension(url)
    type || (url += '.json');
    Laya.loader.resetProgress()
    let loader = new Laya.SceneLoader()
    loader.on(Laya.Event.COMPLETE, null, () => {
        let obj = Laya.Loader.getRes(url)
        if (!obj) throw "Can not find scene:" + url;
        if (!this._getBit(/*laya.Const.NOT_READY*/0x08)) {
            console.warn('Scene has been Ready!!!');
            this.event(Laya.Event.READY, this)
            complete && complete.runWith(null)
        } else {
            this.on('onViewCreated', null, () => {
                this.event(Laya.Event.READY, this)
                complete && complete.runWith(null)
            })
            this.createView(obj);
        }
    })
    loader.load(url)
}

const LAST_CLICK_TIME = '_last_click_time'
Laya.Node.prototype.addClickListener = function (caller: any, method: Function, throttle: boolean = false, fail?: Function) {
    caller || (caller = {})
    return this.on(Laya.Event.CLICK, this, function (args) {
        if (!throttle) { method.call(caller, args); return }
        let now = Date.now(), time = caller[LAST_CLICK_TIME] || 0, delta = now - time
        if (delta > 500) {
            method.call(caller, args)
        } else {
            fail && fail.call(caller, '操作速度过快')
            console.warn('操作点击过快')
        }
        caller[LAST_CLICK_TIME] = now
    })
}
Laya.Node.prototype.dispatchLifeCycleEvent = function (method, p1, p2, p3, p4, p5) {
    this.dispatchComponentEvent(method, p1, p2, p3, p4, p5)
    if (!this.destroyed){
        for (let i = 0, length = this.numChildren; i < length; i++) {
            let child = this.getChildAt(i)
            child.dispatchComponentEvent(method, p1, p2, p3, p4, p5)
        }
    }
    if (this[method]) { this[method](p1, p2, p3, p4, p5) }
}
Laya.Node.prototype.dispatchComponentEvent = function (method, p1, p2, p3, p4, p5) {
    let components: Array<any> = this['_components'] || []
    components.forEach((item) => {
        if (item[method]&&item.enabled) { item[method](p1, p2, p3, p4, p5) }
    })
}
Laya.Sprite.prototype.drawBackground = function () {
    this.graphics.clear()
    this.graphics.drawPath(0, 0, Utils.makeRoundRectPath(this.width, this.height, this._cornerRadius || 0, PaoYa.RectCorner.RectCornerAllCorners), {
        fillStyle: this._backgroundColor
    })
}
Laya.Scene.load = function (url, complete, progress) {
    Laya.loader.resetProgress();
    var loader = new Laya.SceneLoader();
    loader.on(/*laya.events.Event.PROGRESS*/"progress", null, onProgress);
    loader.once(/*laya.events.Event.COMPLETE*/"complete", null, done);
    loader.load(url);
    function onProgress(value) {
        if (Laya.Scene['_loadPage']) Laya.Scene['_loadPage'].event("progress", value);
        progress && progress.runWith(value);
    }
    function done(){
        if (Laya.Scene['_prepareHandler']){
            let prepare = Laya.Scene['_prepareHandler']
            if (typeof prepare == 'function'){
                prepare()
                create()
            } else if (typeof prepare == 'object'){
                if (prepare['async']){
                    prepare['async'](function(){
                        create()
                    })
                } else {
                    prepare['sync']()
                    create()
                }
            }
        }else{
            create()
        }
    }
    function create() {
        Laya.Scene['_prepareHandler'] = null
        loader.off(/*laya.events.Event.PROGRESS*/"progress", null, onProgress);
        let p = url as any
        if (p instanceof Array) { url = p[p.length - 1]}
        var obj = Laya.Loader.getRes(url);
        if (!obj) throw "Can not find scene:" + url;
        if (!obj.props) throw "Scene data is error:" + url;
        var runtime = obj.props.runtime ? obj.props.runtime : obj.type;
        var clas = Laya.ClassUtils.getClass(runtime);
        if (obj.props.renderType == "instance") {
            var scene = clas.instance || (clas.instance = new clas());
        } else {
            scene = new clas();
        }
        if (scene && (scene instanceof laya.display.Node)) {
            scene.url = url;
            if (!scene._getBit(/*laya.Const.NOT_READY*/0x08)) {
                complete && complete.runWith(scene)
                Laya.Scene.hideLoadingPage()
            } else {
                scene.on("onViewCreated", null, function () {
                    Laya.Scene.hideLoadingPage()
                    complete && complete.runWith(scene)
                })
                scene.createView(obj);
            }
        } else {
            throw "Can not find scene:" + runtime;
        }
    }
}
/**为指定的Sprite添加背景色，使用时需要先确定该Sprite的宽高 */
Object.defineProperty(Laya.Sprite.prototype, "backgroundColor", {
    configurable: false,
    enumerable: false,
    get: function () {
        return this._backgroundColor || null
    },
    set: function (color) {
        if (!color || (color == this._backgroundColor)) return
        this._backgroundColor = color
        // this._bgSprite = this._bgSprite || this.addChildAt(new Laya.Sprite(),0)
        Laya.timer.callLater(this, this.drawBackground)
    }
})
/**为指定的Sprite添加圆角，使用时需要先确定该Sprite的宽高，一般配合backgroundColor一起使用 */
Object.defineProperty(Laya.Sprite.prototype, "cornerRadius", {
    configurable: false,
    enumerable: false,
    get: function () {
        return this._cornerRadius || 0
    },
    set: function (radius) {
        if (!radius || (this._cornerRadius == radius)) return
        this._cornerRadius = radius
        // this._bgSprite = this._bgSprite || this.addChildAt(new Laya.Sprite(),0)
        Laya.timer.callLater(this, this.drawBackground)
    }
})