import DataCenter from '../DataCenter'
import Toast from '../../wx/Toast'
import DataTrack from '../../dataTrack/dataTrack'
import Request, { RequestConfig } from '../../core/network/Request'
import NotificationCenter, { NotificationName } from '../../core/NotificationCenter';

const LAST_GET_USERINFO_TIME_KEY = 'lastGetUserInfoTime'
const USER_TOKEN_KEY = 'userTokenKey'

export class LoginConfig {
    //用于浏览器端登录
    static userId = 123456
    static gameId = 1004
    static version = '1.0'
    static release = 1
    static requestConfig = 1
    static makeLoginParamsHandler
}

export default class LoginService {
    static isAuthed = false
    static isLogined = false
    static lastGetUserInfoTime = Number(localStorage.getItem(LAST_GET_USERINFO_TIME_KEY) || '') //上一次获取用户信息时间
    static token = localStorage.getItem(USER_TOKEN_KEY) || ''

    static login(suc: Function, fail: Function) {
        if (!this.token){this.lastGetUserInfoTime = 0}
        let beginTime = Date.now()
        let day7 = 7 * 24 * 60 * 60 * 1000
        let params = {
            requestUserInfo:((beginTime - this.lastGetUserInfoTime) > day7)
        }
        py.login(params,(res)=>{
            if (!window['wx'] && !window['BK'] &&!res['js_code']){res['js_code']=`app,${LoginConfig.userId}`}
            this.loginWith(res, suc, fail)
        })
    }
    /**
     * 
     * @param params 登录我们服务器需要传的参数
     * @param code   通过wx.login获取到的code，如果是网页登录，则格式为 app,123456
     * @param userInfo 通过wx.getUserInfo获取到的信息，如果是网页登录，则为null
     * @param deviceInfo 通过wx.getSystemInfo获取到的信息，如果是网页登录，则为null
     * @param launchInfo 通过wx.getLaunchOption获取到的信息，如果是网页登录，则为null
     */
    static loginWith(res, success, fail) {
        let params = {
            game_id: LoginConfig.gameId,
            game_app_id: LoginConfig.gameId,
            version: LoginConfig.version,
            release: LoginConfig.release,
            is_config: LoginConfig.requestConfig
        }
        for (let key in res){
            params[key] = res[key]
        }
        params['user_token'] = this.token || ''
        params = LoginConfig.makeLoginParamsHandler(params)

        DataTrack.startTrackTime('l')
        Toast.showLoading('',false)
        Request.POST('user_login', params, (res) => {
            this.isLogined = true
            DataTrack.stopTrackTime('l')
            DataTrack.uploadLoginCostTime()

            DataCenter.loginData = res
            DataCenter.user = res
            DataCenter.config = res.config_list
            DataCenter.gold.value = DataCenter.user.gold = res.member_gold
            DataCenter.rmb.value = DataCenter.user.rmb = res.member_rmb
            DataCenter.integral.value = DataCenter.user.integral = res.member_integral
            let token = res.token
            RequestConfig.token = this.token = token;
            localStorage.setItem(USER_TOKEN_KEY, token);
            localStorage.setItem(LAST_GET_USERINFO_TIME_KEY,Date.now()+'')
            Toast.hideLoading()
            DataCenter.refreshUserInfo()
            NotificationCenter.postNotification(NotificationName.LoginSuccess)

            success && success(res)
        }, (msg, code) => {
            /**
             * {"code":401,"time":1525849533,"message":"您的账号在另一个设备上登录了, 需要重新登录","errorcode":2004}
             */
            if (code == 2004) { //token不对
                RequestConfig.token = ""
                this.token = ''
                this.loginWith(res, success, fail)
            } else {
                Toast.hideLoading()
                Toast.showModal('登录失败', msg)
            }
        })
    }
}