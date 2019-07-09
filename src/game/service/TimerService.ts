export default class TimerService extends Laya.EventDispatcher {
    curTime = 0
    /**
     * 
     * @param duration 如果为倒计时，则为最大可倒计时；如果为正计时，则为最大可正计时
     * @param interval 步进时间
     * @param up 是否为正计时，默认为倒计时
     */
    constructor(public duration, public interval = 1, public up = false) {
        super()
    }
    start() {
        this.curTime = this.up?0:this.duration
        this.update()
        Laya.timer.loop(this.interval * 1000, this, this.update)
        this.event(TimerService.START, "")
    }
    stop() {
        this.curTime = 0
        Laya.timer.clear(this, this.update)
        this.event(TimerService.STOP, "")
    }
    update() {
        if (this.up) {
            this.curTime++
            if (this.curTime >= this.duration) {
                this.stop()
            } else {
                this.event(TimerService.PROGRESS, this.curTime)
            }
        } else {
            if (this.curTime > 0) {
                this.curTime--
                this.event(TimerService.PROGRESS, this.curTime)
            } else {
                this.stop()
            }
        }
    }
    static START = "start_"
    static STOP = "stop_"
    static TIMEOUT = "timeout_"
    static PROGRESS = "progress_"
}