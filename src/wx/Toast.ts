export default class Toast {
    /**
    * 1. icon默认是"success"
    * 2. icon 和 image 同时存在只会有一个生效，image的优先级高于icon，不管什么情况下都会有图片的，这个是取消不了的
    * 3. icon为null、undefined、""或者任何字符串，结果都为"success"
    * 4. duration是毫秒级
    * 5. 多次重复调用，只有最新调用的生效
    */
    static show(title: string, icon: string, image: string = null, duration: number = 1500) {
        var params: ToastObject = {
            title: title,
            icon: icon,
            image: image,
            duration: duration,
            mask: false,
            success() { },
            fail() { },
        }
        py.showToast(params)
    }
    static hide() {
        py.hideToast();
    }

    static showSuccess(title: string, duration: number = 1500) {
        this.show(title, null, 'https://res.xingqiu123.com/wxgame/common/success.png', duration);
    }

    static showError(title: string, duration: number = 1500) {
        this.show(title, null, 'https://res.xingqiu123.com/wxgame/common/error.png', duration)
    }

    static showWarn(title: string, duration: number = 1500) {
        this.show(title, null, 'https://res.xingqiu123.com/wxgame/common/warning.png', duration)
    }

    static showImage(image: string, duration: number = 1500) {
        this.show(null, null, image, duration);
    }


    /**
     * 显示loading提示层
     * @param  title 
     * @param  mask 是否显示透明蒙层，也就是避免用户点击 
     */
    static showLoading(title: string = '', mask: boolean = true) {
        py.showLoading({
            title: title,
            mask: mask,
            success() { },
            fail() { }
        })
    }

    static hideLoading() {
        py.hideLoading()
    }

    static showModal(title = '提示', content = '', confirmText = '知道了', confirmCallback = null, cancelText = "", cancelCallback = null) {
        var params: ModalObject = {
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
        py.showModal(params)
    }
}