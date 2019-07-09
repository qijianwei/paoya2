import { DataCenter } from "../../export";

export default class Loader {
    constructor() { }
    static load(url, caller, completion, p = null) {
        let completeHandler = Laya.Handler.create(this, function () {
            completion && completion.call(caller)
        })
        let progressHandler = Laya.Handler.create(this, function (progress) {
            console.log("loading progress" + progress)
            p && p.call(caller, progress);
        }, null, false)
        Laya.loader.load(url, completeHandler, progressHandler)
    }
    /**
     * 预加载资源
     */
    static preload(complete,progress){
        Laya.loader.load(DataCenter.GAMERES,complete,progress)
    }
}