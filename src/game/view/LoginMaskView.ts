import NotificationCenter,{ NotificationName } from '../../core/NotificationCenter'
import LoginService from '../service/LoginService';

export default class LoginMaskView extends Laya.View {
    static view: LoginMaskView
    constructor() {
        super()
        this.size(750, 1334)
        NotificationCenter.defaultCenter.on(NotificationName.LoginSuccess, this, this.destroy)

        this.on(Laya.Event.CLICK, this, function () {
            if (!PaoYa.game.isAuthed) {
                console.warn('此时用户还没有完成授权')
                return
            }
            if (!LoginService.isLogined) {
                console.warn('此时用户还没有登录成功')
                return
            }
            this.destroy()
        })
    }

    static showInView(view: Laya.View) {
        if (LoginService.isLogined) { return }
        let maskView = new LoginMaskView()
        this.view = maskView
        view.addChild(maskView)
    }

    static hide() {
        this.view.destroy()
    }

    destroy() {
        NotificationCenter.defaultCenter.off(NotificationName.LoginSuccess, this, this.destroy)
        this.removeSelf()
        super.destroy(true)
    }
}