import Navigator from "../../core/navigator/Navigator";
/**
 * 游戏启动时的加载页面
 */
export default class LaunchScreenView extends Laya.View {
    static ins: LaunchScreenView

    private _imgProgress: Laya.Image
    private _imgProgressMask: Laya.Sprite
    private _lblProgress: Laya.Label
    private _progress: number
    private _portrait:Boolean
    private _imgProgressBg: Laya.Image
    constructor() {
        super()
        this.setup()
    }
    setup() {
        let box = new Laya.Box()
        if(this._portrait){
            this.size(750,1334)
            box.size(750,1334)
        }else{
            this.size(1334, 750);
            box.size(1334, 750);
        }       
        box.cacheAs = 'normal'
        this.addChild(box)
        let imgBg = new Laya.Image('local/loading/bg.jpg')
        imgBg.x=-150;
        box.addChild(imgBg)

        let imgLogo = new Laya.Image('local/loading/logo.png')
        imgLogo.centerX = 0
        imgLogo.top = 100
        box.addChild(imgLogo)

        let imgProgressBg = new Laya.Image('local/loading/progress-bg.png')
        imgProgressBg.centerX = 0
        imgProgressBg.bottom = 60
        box.addChild(imgProgressBg)
        this._imgProgressBg=imgProgressBg;     
      /*   let lblTips = new Laya.Label('玩游戏享乐趣,好友都在玩的小游戏乐园')
        lblTips.color = '#227fb3'
        lblTips.fontSize = 28
        lblTips.centerX = 0
        lblTips.bottom = 70
        box.addChild(lblTips) */

        let imgProgress = new Laya.Image('local/loading/progress-bar.png')
        imgProgress.centerX = 0
        imgProgress.bottom = 80
        this.addChild(imgProgress)
        this._imgProgress = imgProgress

        let mask = new Laya.Sprite()
        mask.graphics.drawRect(0, 0, 0, 77, '#ff0000')
        imgProgress.mask = mask
        this._imgProgressMask = mask

        let lblProgress = new Laya.Label('0%')
        lblProgress.color = '#ffffff'
        lblProgress.fontSize = 30
        lblProgress.centerX = 0
        lblProgress.bottom =76 
        this.addChild(lblProgress)
        this._lblProgress = lblProgress
    }
    set progress(newValue) {
        if (newValue != this._progress) {
            this._progress = newValue
            this._imgProgressMask.graphics.clear()
            this._imgProgressMask.graphics.drawRect(0, 0, newValue * this._imgProgress.width, this._imgProgress.height, '#ff0000')
        }
    }
    get progress() {
        return this._progress
    }

    static setProgress(progress) {
        if(!this.ins)return
        this.ins.progress = progress
        this.setTips(`${Math.ceil(progress * 100)}%`)
    }

    static setTips(tip) {
        this.ins._lblProgress.text = tip
    }

    static show(portrait) {
        let view = new LaunchScreenView()
        Navigator.adjustViewPosition(view,portrait)
        view.zOrder = 999
        Laya.stage.addChild(view)
        this.ins = view
        if(portrait==undefined||portrait){
            this.ins._portrait=true;
        }else{
            this.ins._portrait=false;
        }
    }
    static hide() {
        if (this.ins) {
            this.ins.destroy()
        }
    }
    static hideProgress(){
        if(this.ins){
           this.ins._imgProgressBg.visible=false;
           this.ins._imgProgress.visible=false;
           this.ins._lblProgress.visible=false;
        }
   }
}