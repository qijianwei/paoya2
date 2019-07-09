export default class PayManager {
    static offerId: string
    static env = 0 // 0 正式版，1 沙箱环境
    static platform = 'android'
    static pay(buyQuantity, success, fail) {
        py.requestPayment({
            env: this.env,
            offerId: this.offerId,
            currencyType: "CNY",
            buyQuantity: buyQuantity,
            success (res) {
                console.log(`PAY | suc | ${JSON.stringify(res)}`)
                success && success();
            },
            fail (res) {
                console.log(`PAY | fail | ${JSON.stringify(res)}`)
                var msg = res.errMsg;
                var code = res.errCode;
                fail && fail(code)
            }
        })
    }
}