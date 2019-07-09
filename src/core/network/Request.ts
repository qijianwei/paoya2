import DataTrack, { DataTrackType } from '../../dataTrack/dataTrack'

export class RequestConfig {
    static baseURL = "";
    static token = "";
    static headers = ["Content-Type", "application/x-www-form-urlencoded"];
    static makeParamsHandler: Function
    static maxRetryTimes = 3
}
export default class Request extends Laya.HttpRequest {
    private _path: string
    private _retryTimes = 0
    private $url: string
    private $query: string
    private $method: string
    constructor() {
        super()
        let _this = this
        this.http.ontimeout = function (e) {
            _this.timeout(e)
        }
    }
    sendRequest(path: string, params: Object, method: string): void {
        if (!RequestConfig.baseURL) {
            console.error("请指定baseURL");
            return;
        }
        this._path = path
        if (RequestConfig.makeParamsHandler) {
            params = RequestConfig.makeParamsHandler(params)
        }
        console.log(`R >>> | ${path} | ${params['wxparams'] || JSON.stringify(params)}`)
        let items = [];
        for (var key in params) {
            items.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        }
        let result = items.join("&");
        let url = RequestConfig.baseURL + path;
        if (method == 'get') {
            url += "?" + result;
            result = null
        }
        this.$url = url
        this.$query = result
        this.$method = method
        this.send(url, result, method, null, RequestConfig.headers);
    }
    /**发送GET请求 */
    GET(path, params) {
        this.sendRequest(path, params, 'get');
    }
    /**发送POST请求 */
    POST(path, params) {
        this.sendRequest(path, params, 'post');
    }
    /**重写父类的complete方法 */
    complete() {
        console.log(`R <<< | ${this._path} | ${this.http.responseText}`)
        super.complete();
    }
    /**重写父类的complete方法 */
    error(message) {
        super.error(message)
        // let status = this.http.status
        // if (this._retryTimes < RequestConfig.maxRetryTimes) {
        //     this._retryTimes++
        //     DataTrack.track(DataTrackType.HTTPRetry,{c:this.$url,t:this._retryTimes})
        //     setTimeout(function () {
        //         this.send(this.$url, this.$query, this.$method, null, RequestConfig.headers);
        //     }.bind(this), 500)
        // } else {
        //     super.error(message)
        // }
    }
    timeout(message) {
        if (this._retryTimes < RequestConfig.maxRetryTimes) {
            this._retryTimes++
            DataTrack.track(DataTrackType.HTTPRetry, { c: this.$url, t: this._retryTimes })
            setTimeout(function () {
                this.send(this.$url, this.$query, this.$method, null, RequestConfig.headers);
            }.bind(this), 500)
        } else {
            this.error(message)
        }
    }
    /**类方法进行GET请求 */
    static GET(path:string, params:Object, suc:Function, fail:Function = null): Request {
        var xmr = new Request();
        xmr.on(Laya.Event.COMPLETE, this, (data) => {
            this.handleError(data, suc, fail)
        })
        xmr.on(Laya.Event.ERROR, this, (res) => {
            fail && fail.call(this,res || "连接服务器失败");
        })
        xmr.GET(path, params);
        return xmr;
    }
    /**类方法进行POST请求 */
    static POST(path:string, params:Object, suc:Function, fail:Function = null): Request {
        var xmr = new Request();
        xmr.on(Laya.Event.COMPLETE, this, (data) => {
            this.handleError(data, suc, fail)
        })
        xmr.on(Laya.Event.ERROR, this, (res) => {
            fail && fail.call(this, res || "连接服务器失败");
        })
        xmr.POST(path, params);
        return xmr;
    }
    static handleError(data, suc:Function, fail:Function) {
        data = JSON.parse(data);
        var code = data.code;
        if (code == 200) {
            suc && suc.call(this,data.value);
        } else {
            fail && fail.call(this,data.message || "请求出现错误", (data.errorcode ? data.errorcode : code));
        }
    }
}