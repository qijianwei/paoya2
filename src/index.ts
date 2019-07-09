import PaoYa from './paoya'
import * as paoya from './export'

function inject(){
    for (const key in paoya){
        PaoYa[key] = paoya[key]
    }
}
inject()
window['PaoYa'] = window['PaoYa'] || PaoYa