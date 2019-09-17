import Game from './game'
import Toast from '../../wx/Toast'
import Request, { RequestConfig } from '../../core/network/Request'
import NetworkMonitor from '../../wx/monitor/NetworkMonitor'
import LifeCircleMonitor from '../../wx/monitor/LifeCircleMonitor'
import Socket, { SocketConfig } from '../../core/network/Socket'
import Navigator from '../../core/navigator/Navigator'
import DataCenter from '../DataCenter'
import DataTrack from '../../dataTrack/dataTrack'
import PayManager from '../../wx/manager/PayManager'
import NotificationCenter, { NotificationName } from '../../core/NotificationCenter'
import Client from '../../core/network/Client'
import { ShareType, SocketURLType, RankingType } from '../enums'
import PaoYa from '../../paoya'
import LoginService, { LoginConfig } from '../service/LoginService'
import ShareManager from '../../wx/manager/ShareManager'
import SoundManager from '../../laya/sound'
import Loader from '../service/Loader';
import LaunchScreenView from '../view/LaunchScreenView';

export default class Main extends Game {
    networkMonitor: NetworkMonitor
    lifeCircleMonitor: LifeCircleMonitor
    socket: Client
    constructor(public params: GameConfig) {
        super(params)
        if (!params.gameId) {
            console.error("初始化时必须传入gameId")
        }
        if (!params.baseURL) {
            console.error("初始化时必须传入baseURL")
        }
        if (!params.zone) {
            console.error("初始化时必须传入zone")
        }
        if(params.useSocket==undefined){
            params.useSocket=false;
        }
        this.gameId = params.gameId
        this.params.rankingType = this.params.rankingType || RankingType.Score
        if (this.params.showBannerAdWhenDialogPopup != undefined) {
            DataCenter.showBannerAdWhenDialogPopup = this.params.showBannerAdWhenDialogPopup
        }
        //对全局单例进行赋值
        PaoYa.game = this
        SocketConfig.zone = params.zone
        PayManager.offerId = params.offerId

        this.init()
    }

    init() {
        PaoYa.networkMonitor = this.networkMonitor = new NetworkMonitor()
        PaoYa.lifeCircleMonitor = this.lifeCircleMonitor = new LifeCircleMonitor()
        this._addNotificationCenterListener()

        this._configHTTP()
        this._configLogin()
        this._configShareManager()
        this._configSoundManager()

        /**只有在小程序中才能启动事件统计功能 */
        if (Laya.Browser.onMiniGame) {
            DataTrack.setup(this.params.mtaID, this.params.mtaEventID, this.launchOption)
        }
        this.setupOthers()
    }

    loadRes() {
        let _this = this, connectWebsocket = null;
        if (!this.params.useSocket) {
            connectWebsocket = function () {
                LaunchScreenView.setTips('准备就绪')
                _this.setupLoadingView(() => {
                    _this.initRootScene(_this.launchOption, _this.isFirstLaunch)
                    LaunchScreenView.hide()
                })
            }
        } else {
            connectWebsocket = function () {
                LaunchScreenView.setTips('正在连接...')
                _this._initClient(function () {
                    LaunchScreenView.setTips('准备就绪')
                    _this.setupLoadingView(() => {
                        _this.initRootScene(_this.launchOption, _this.isFirstLaunch)
                        LaunchScreenView.hide()
                    })
                }, function () {
                    Toast.showModal('提示', '连接服务器失败', '重试', function () {
                        _this.socket.connect()
                    })
                })
            }
        }
        let login = function (suc) {
            LaunchScreenView.setTips('正在登录...')
            LoginService.login(suc, function () {
                Toast.showModal('提示', '登录失败', '重试', function () {
                    login(suc)
                })
            })
        }
        let complete = function () {
            login(function () {
                connectWebsocket()
            })
        }
        Loader.preload(Laya.Handler.create(this, () => {
            if (DataCenter.GAMEPREPARE) {
                let prepare = DataCenter.GAMEPREPARE
                if (typeof prepare == 'function') {
                    prepare()
                    complete()
                } else if (typeof prepare == 'object') {
                    if (prepare['async']) {
                        prepare['async'](function () {
                            complete()
                        })
                    } else {
                        prepare['sync']()
                        complete()
                    }
                }
            } else {
                complete()
            }
        }), Laya.Handler.create(this, (progress) => {
            LaunchScreenView.setProgress(progress)
        }, null, false))
    }

    _addNotificationCenterListener() {
        NotificationCenter.on(NotificationName.ApplicationShow, this, this._onShow)
        NotificationCenter.on(NotificationName.ApplicationHide, this, this._onHide)
        NotificationCenter.on(NotificationName.NetworkChanged, this, this._handleNetworkChange)
    }

    _configHTTP() {
        Client.ignoreCmds = this.params.ignoreCmds || []
        RequestConfig.baseURL = this.params.baseURL

        if (this.launchOption && this.launchOption.referrerInfo && this.launchOption.referrerInfo.extraData) {
            let referrerInfo = this.launchOption.referrerInfo, extraData = referrerInfo.extraData, token = extraData.token, baseURL = extraData.baseURL
            baseURL && (RequestConfig.baseURL = baseURL)
        }
        let _this = this
        RequestConfig.makeParamsHandler = function (params) {
            if (!params['user_token'] && RequestConfig.token) {
                params['user_token'] = RequestConfig.token
            }
            if (!params['game_id'] && _this.gameId) {
                params['game_id'] = _this.gameId
            }
            return { wxparams: JSON.stringify(params) }
        }
    }
    _configLogin() {
        let params = this.params
        LoginConfig.userId = params.userId
        LoginConfig.gameId = params.gameId
        LoginConfig.version = params.version
        LoginConfig.release = params.release
        // LoginConfig.requestConfig = 
        let _this = this
        LoginConfig.makeLoginParamsHandler = function (params) {
            if (_this.launchOption && _this.launchOption['query']) {
                params['share_id'] = _this.launchOption['query']['id'] || 0
                params['share_type'] = _this.launchOption['query']['type'] || 0
                params['launch_info'] = _this.launchOption || ''
            }
            if (_this.launchOption && _this.launchOption.referrerInfo && _this.launchOption.referrerInfo.extraData) {
                let extraData = _this.launchOption.referrerInfo.extraData
                params['from_game_id'] = extraData.fid || 0
                params['from_game_id_type'] = extraData.jType || ''
            }
            return params
        }
        if (this.launchOption && this.launchOption.referrerInfo && this.launchOption.referrerInfo.extraData) {
            let referrerInfo = this.launchOption.referrerInfo, extraData = referrerInfo.extraData, token = extraData.token
            token && (LoginService.token = token)
        }
    }

    _configShareManager() {
        ShareManager.makeQueryHandler = function (query) {
            query.id = DataCenter.user.id
            return query
        }
    }

    _configSoundManager() {
        py.onAudioInterruptionBegin(() => {
            console.log(`Audio | interrupt | begin`)
            if (window['wx']) {
                this.lifeCircleMonitor.inForeground = false
            }
            SoundManager.onAudioInterruptionBegin()
        })
        py.onAudioInterruptionEnd(() => {
            console.log(`Audio | interrupt | end`)
            if (window['wx']) {
                this.lifeCircleMonitor.inForeground = true
            }
            SoundManager.onAudioInterruptionEnd()
        })
    }

    /**初始化websocket */
    _initClient(suc, fail) {
        console.warn('初始化WebSocket')
        let url = DataCenter.loginData.game_url
        if (!url) {
            console.error("请验证game_url是否正确")
        }
        if (Laya.Render.isConchApp) {
            url = DataCenter.loginData['app_game_url']
        }
        let socket = PaoYa.socket = this.socket = new Client(url + this.params.zone);
        socket.on(Laya.Event.OPEN, this, () => {
            DataTrack.stopSocketTime()
            let userId = DataCenter.user.id
            if (!userId) {
                console.error("user_id不存在，请检查错误")
            }
            DataTrack.startSocketLogin()
            console.log('开始WebSocket登录')
            socket.sendMessage("login", { user_id: userId })
        })
        socket.once(Client.LOGIN, this, function () {
            Laya.timer.clear(this, timerHandler)
            Toast.hideLoading()
            suc && suc()
            DataTrack.stopSocketLogin()
        })
        Toast.showLoading('', false)
        socket.connect()
        let timerHandler = function () {
            socket.close()
            fail && fail()
        }
        /**20s后自动超时 */
        Laya.timer.once(15000, this, timerHandler)
    }

    _changeClientURL(type: SocketURLType = SocketURLType.GAME) {
        let baseURL = DataCenter.loginData[type]
        if (Laya.Render.isConchApp) {
            baseURL = DataCenter.loginData[`app_${type}`]
        }
        let url = baseURL + this.params.zone
        if (url != this.socket.url) {
            console.warn(`开始切换服务器地址，旧地址为${this.socket.url} | 新地址为${url}`)
            this.socket.changeUrl(url)
        }
    }

    _onShow(res) {
        SoundManager.onShow()
        if (!this.socket) return
        this.isFirstLaunch = false
        this.launchOption = res
        //当通过好友邀请进入游戏时，需要再次调用登录，以获取好友所在的服务器
        let query = res.query
        let type = query.type
        let _this = this
        let onShowHandler = function () {
            _this.initRootScene(_this.launchOption, _this.isFirstLaunch)
        }
        if (type == ShareType.InviteFriend || type == ShareType.GroupPK) {
            LoginService.login(function () {
                _this._changeClientURL()
                onShowHandler()
            }, null)
        } else {
            onShowHandler()
            this.socket._startReconnect()
        }
        this.navigator._onShow(res)
        this.onShow(res)   
    }

    _onHide(res) {
        SoundManager.onHide()
        this.navigator._onHide(res)
        if (!this.socket) return  
        this.onHide(res) 
    }

    /**当游戏进入前台时触发 */
    onShow(res) {

    }
    /**当游戏进入后台时触发 */
    onHide(res) {

    }
    /**设置界面加载时的Loading界面 */
    setupLoadingView(cb) {
        cb()
    }
    setupOthers() {

    }
    _handleNetworkChange(res) {
        this.navigator._onReceiveNetworkChange(res)
        this.handleNetworkChange(res)
    }
    /**监听网络状态变化 */
    handleNetworkChange(res) {

    }
}