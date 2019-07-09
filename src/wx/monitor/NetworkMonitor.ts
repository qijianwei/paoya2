import NotificationCenter, { NotificationName } from '../../core/NotificationCenter'

export default class NetworkMonitor implements Monitorable {
    /**当前网络是否连接 */
    isConnected = true
    isWIFI = true
    type = ''

    constructor() {
        this.getCurrentType((type) => {
            this.isConnected = (type != 'unknown' || type != 'none')
            this.isWIFI = type === 'wifi'
            this.type = type
        })
        this.startMonitor()
    }

    /**启用网络监听 */
    startMonitor() {
        py.onNetworkStatusChange((res)=>{
            this.handleNetworkChange(res)
        })
    }
    handleNetworkChange(res){
        this.isWIFI = res.networkType === 'wifi';
        this.type = res.networkType
        this.isConnected = res.isConnected;
        console.log(`NETWORK | change :\n`)
        console.log(JSON.stringify(res))
        NotificationCenter.defaultCenter.event(NotificationName.NetworkChanged, res)
    }
    /**停止网络监听 */
    stopMonitor() {
        py.offNetworkStatusChange(this.handleNetworkChange)
    }
    /**获取当前网络状态 */
    getCurrentType(cb) {
        py.getNetworkType({
            success: function (res) {
                console.log(`NETWORK | type :\n`)
                console.log(JSON.stringify(res))
                cb && cb(res.networkType);
            },
            fail() { }
        })
    }

    static NETWORK_CHANGE = 'NetworkMonitor.network.change';
}