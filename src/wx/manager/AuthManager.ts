import AuthUserInfoDialog from "./AuthUserInfoDialog";
import { DataCenter } from "../../export";
import NotificationCenter from "../../core/NotificationCenter";

export default class AuthManager {
    static scope = {
        userInfo: "scope.userInfo",
        userLocation: "scope.userLocation",
        address: "scope.address",
        invoiceTitle: "scope.invoiceTitle",
        werun: "scope.werun",
        record: "scope.record",
        writePhotosAlbum: "scope.writePhotosAlbum",
        camera: "scope.camera"
    }
    /**
     * 
     * @param scope 想要获取授权的标识，可以使用上面已经列举出来的权限
     * @param suc   授权成功回调
     * @param fail  授权失败回调
     * @param alert 当需要打开用户设置界面时，用于可以修改弹窗内容，方便用户确认操作
     */
    static auth(params: AuthObject) {
        let _this=this;
        if(!window['wx']){params.next&&params.next();return;}
        params.alert = (alertCb) => {
            this.showModal('提示', '需要您的授权才能正常使用', '去设置', () => {
                alertCb();
            })
        }
        params.fail = () => {
            Laya.Dialog.manager = null
            UIConfig.closeDialogOnSide = false
            let alert = new AuthUserInfoDialog(params.isNecessary);
            alert.onReceiveUserInfo = function (res) {
                if(res.userInfo){
                    DataCenter.userInfoAuth=true;
                    DataCenter.user.avstar=res.userInfo.avatarUrl;
                    DataCenter.user.nickname=res.userInfo.nickName;
                    NotificationCenter.postNotification(`AuthOK`);
                    PaoYa.Request.POST('update_profile', { icon_big: res.userInfo.avatarUrl, name: res.userInfo.nickName }, () => {
                        params.next&&params.next();
                     })
                }
                if(!params.isNecessary&&!res.userInfo){
                    params.next&&params.next();
                }
            }
            alert.popup(true, false)
        }
        let okHandler = function () {
            wx.openSetting({
                success(res) {
                    let result = res.authSetting[params.scope];
                    //params.next && params.next();
                    if(!params.isNecessary&&!result){params.next && params.next();return;}
                    if (result) {
                        _this.getUserInfo((res)=>{
                            DataCenter.userInfoAuth=true;
                            DataCenter.user.avstar=res.userInfo.avatarUrl;
                            DataCenter.user.nickname=res.userInfo.nickName;
                            NotificationCenter.postNotification(`AuthOK`);
                            PaoYa.Request.POST('update_profile', { icon_big: res.userInfo.avatarUrl, name: res.userInfo.nickName }, () => {
                                params.next&&params.next();
                             })
                        })
                    } else {
                        params.alert && params.alert(okHandler)
                    }
                },
                fail() {
                    params.fail && params.fail()
                }
            })
        }
        wx.getSetting({
            success(res) {
                let result = res.authSetting[params.scope];
                if (result == undefined) { //没有获取过权限
                    /**如果请求用户权限失败，则直接return */
                    if (params.scope == AuthManager.scope.userInfo) {
                        params.fail && params.fail()
                        return
                    }
                    wx.authorize({
                        scope: params.scope,
                        success(res) {
                            params.next && params.next();
                        },
                        fail() {
                            params.alert && params.alert(okHandler)
                        },
                        complete() { }
                    })
                } else if (!result) { //当前权限为否
                    params.alert && params.alert(okHandler)
                } else {
                    params.next && params.next();
                }
            }
        })
    }
    /**调用微信获取用户信息接口 */
    static getUserInfo(cb) {
        wx.getUserInfo({
            withCredentials: true,
            lang: "zh_CN",
            success(res) {
                cb && cb(res);
            },
            fail() { }
        })
    }

    static getUserInfoWithoutCredentials(cb) {
        wx.getUserInfo({
            lang: "zh_CN",
            withCredentials: false,
            success(res) {
                cb && cb(res);
            },
            fail() { }
        })
    }

    static showModal(title = '提示', content = '', confirmText = '知道了', confirmCallback = null, cancelText = "", cancelCallback = null) {
        var params: _showModalObject = {
            title: title,
            content: content,
            showCancel: cancelText ? true : false,
            cancelColor: '#000000',
            confirmColor: '#3cc51f',
            cancelText: cancelText,
            confirmText: confirmText,
            success: function (res) {
                if (res.confirm) { confirmCallback && confirmCallback() }
                if (res.cancel) { cancelCallback && cancelCallback() }
            },
            fail() { }
        }
        wx.showModal(params)
    }
}
