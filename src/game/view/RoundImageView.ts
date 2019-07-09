/**专门用于设定圆形头像，有个前提条件是必须给该图片指定width及height */
export default class RoundImageView extends Laya.Image {
    constructor(skin?: string) {
        super(skin)
        this.__init_$()
    }
    __init_$() {
        let mask = new Laya.Sprite()
        this.mask = mask
        this.on(Laya.Event.RESIZE, this, () => {
            if (!this.mask) { return }
            this.mask.graphics.clear()
            let width = this.width, height = this.height
            let r = Math.ceil(Math.min(width, height) / 2)
            this.mask.graphics.drawCircle(r, r, r, '#ff0000')
        })
    }
}
Laya.ClassUtils.regClass('PaoYa.RoundImageView',RoundImageView)