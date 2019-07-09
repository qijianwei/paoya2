export default class UpdateManager extends Laya.EventDispatcher {
    constructor() {
        super()
        let updateManager = py.getUpdateManager()

        updateManager.onCheckForUpdate((res) => {
            // 请求完新版本信息的回调
            console.warn(`当前 | ${res.hasUpdate ? "有" : "无"} | 新版本`)
            if (res.hasUpdate) {
                this.event(UpdateManager.HAS_UPDATE);
            }
        })

        updateManager.onUpdateReady(() => {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            function cb() {
                updateManager.applyUpdate()
            }
            this.event(UpdateManager.UPDATE_READY, cb)
        })

        updateManager.onUpdateFailed(() => {
            // 新的版本下载失败
            this.event(UpdateManager.UPDATE_FAIL)
        })
    }
    static HAS_UPDATE = "HAS_UPDATE"
    static UPDATE_READY = "UPDATE_READY"
    static UPDATE_FAIL = "UPDATE_FAIL"
}