import NotificationCenter, { NotificationName } from '../../core/NotificationCenter'

export default class LifeCircleMonitor implements Monitorable {
    /**是否在前台 */
    inForeground = true
    ignoreFirstTime = window['wx']?true:false
    constructor() {
        this.startMonitor()
    }
    /**生命周期监听开始 */
    startMonitor() {
        py.onShow((res) => {
            if (this.ignoreFirstTime) {
                this.ignoreFirstTime = false
                return
            }
            console.warn('SHOW :\n')
            console.warn(JSON.stringify(res))
            this.inForeground = true
            NotificationCenter.defaultCenter.event(NotificationName.ApplicationShow, res)
        });
        py.onHide((res) => {
            //{mode:back}  {mode:close}
            console.warn("HIDE :\n")
            console.warn(JSON.stringify(res))
            this.inForeground = false;
            NotificationCenter.defaultCenter.event(NotificationName.ApplicationHide, res)
        });
    }

    /**生命周期监听结束 */
    stopMonitor() {
        py.offShow({});
        py.offHide({});
    }

    static SHOW = 'app.on.show';
    static HIDE = 'app.on.hide';
    static OFF_SHOW = 'app.off.show';
    static OFF_HIDE = 'app.off.hide';
}