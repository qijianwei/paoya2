import DataCenter from "../game/DataCenter";
import {RectCorner} from '../game/enums'
export default class Utils {
    /**
    * 便捷生成图片数组，主要用于名称连续的图片
    * @param {用来组织图片的格式,用%i占位} format 
    * @param {开始索引} start 
    * @param {结束索引} end 
    */
    static makeImagesWithFormat(format, start, end): Array<string> {
        var images = [];
        for (var i = start; i < end; i++) {
            images.push(format.replace("%i", String(i)))
        }
        return images;
    }
    static toQueryString(params): string {
        let items = [], queryStr = "";
        for (var key in params) {
            items.push(key + "=" + params[key]);
        }
        if (items.length) {
            queryStr = items.join("&");
        }
        return queryStr;
    }

    static makeGenderIcon(gender) {
        let icon = "local/common/gay-white.png"
        if (gender == "男") {
            icon = "local/common/boy-white.png"
        } else if (gender == "女") {
            icon = "local/common/girl-white.png"
        }
        // switch (gender) {
        //     case "男":
        //         icon = "wxlocal/Common/boy-white.png"
        //         break
        //     case "女":
        //         icon = "wxlocal/Common/boy-white.png"
        //         break
        //     default:
        //         icon = "wxlocal/Common/gay-white.png"
        //         break
        // }
        return icon
    }

    static findUserByID(users: Array<any>, id) {
        let result = users.filter((user, index) => {
            return user.user_id && (user.user_id == id)
        })
        if (result.length) { return result[0] }
        console.error('')
        return null
    }

    //圆角矩形
    static makeRoundRectPath(width: number, height: number, r: number, corner: RectCorner): Array<any> {
        let path = []
        if (corner & RectCorner.RectCornerTopLeft) {
            path.push(["moveTo", r, 0])
        } else {
            path.push(["moveTo", 0, 0])
        }
        if (corner & RectCorner.RectCornerTopRight) {
            path.push(["lineTo", width - r, 0])
            path.push(["arcTo", width, 0, width, r, r])
        } else {
            path.push(["lineTo", width, 0])
        }
        if (corner & RectCorner.RectCornerBottomRight) {
            path.push(["lineTo", width, height - r])
            path.push(["arcTo", width, height, width - r, height, r])
        } else {
            path.push(["lineTo", width, height])
        }
        if (corner & RectCorner.RectCornerBottomLeft) {
            path.push(["lineTo", r, height])
            path.push(["arcTo", 0, height, 0, height - r, r])
        } else {
            path.push(["lineTo", 0, height])
        }
        if (corner & RectCorner.RectCornerTopLeft) {
            path.push(["lineTo", 0, r])
            path.push(["arcTo", 0, 0, r, 0, r])
        } else {
            path.push(["lineTo", 0, 0])
        }
        path.push(["closePath"])
        return path;
    }

    static makeAllCornerRoundRectPath(w, h, r): Array<any> {
        return this.makeRoundRectPath(w, h, r, RectCorner.RectCornerAllCorners)
    }

    /**用于保留指定长度的字符串，其余用...表示 */
    static formatName(name:string,length = 10):string {
        let r = /[^\x00-\xff]/g;
        if (name.replace(r, "mm").length <= length) {
            return name + "";
        }
        let m = Math.floor(length / 2);
        for (let i = m; i < name.length; i++) {
            if (name.substring(0, i).replace(r, "mm").length >= length) {
                return name.substring(0, i) + "...";
            }
        }
        return name + "";
    }

    /**只用于显示用户头像 */
    static makeIcon(icon:string,width = 96):string {
        if (icon == "") {
            return "local/common/avstar.png";
        }
        if (icon.indexOf('Game') == 0){//GameRes 或 GameSandBox
            if(window['BK']){
                return icon
            }else{
                return ''
            }
        }
        if (icon.indexOf('http') === 0) {
            var items = icon.split("/") || [];
            if (items.length > 1) {
                var str = items[items.length - 1];
                if (str === "0") {
                    items[items.length - 1] = width > 100 ? "132" : "96";
                }
                return items.join('/');
            }
            return icon + "";
        } else {
            if (!DataCenter.CDNURL){
                console.error('you must assign value to [PaoYa.DataCenter.CDNURL]')
                return
            }
            return DataCenter.CDNURL + icon + "?imageView2/0/w/" + width;
        }
    }

    /**用于完全拼接用户的头像地址 */
    static makeResourceURL(url:string):string {
        if (url == "") {
            return "local/common/avstar.png";
        }
        if (url.indexOf('https') === 0) {
            return url + "";
        } else {
            if (!DataCenter.CDNURL){
                console.error('you must assign value to [PaoYa.DataCenter.CDNURL]')
                return
            }
            return DataCenter.CDNURL + url;
        }
    }

    /** 计算文字宽度 */
    static measureWidth(text:string):number {
        let measureResult = Laya.Utils.measureText(text, 'Arial');
        return measureResult.width;
    }
}