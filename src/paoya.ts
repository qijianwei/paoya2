import Navigator from "./core/navigator/Navigator";
import NetworkMonitor from "./wx/monitor/NetworkMonitor";
import LifeCircleMonitor from "./wx/monitor/LifeCircleMonitor";
import Main from "./game/main/main";
import Client from "./core/network/Client";

class PaoYa {
    navigator: Navigator
    networkMonitor: NetworkMonitor
    lifeCircleMonitor: LifeCircleMonitor
    socket: Client
    game: Main
}
const paoya = new PaoYa()
export default paoya as PaoYa