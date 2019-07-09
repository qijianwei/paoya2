interface Date {
    formatWithStyle(format:string):string;
}
/**
 * 
 * @param {时间格式，如“yyyy-mm-dd hh:mm:ss”} format 
 */
Date.prototype.formatWithStyle = function (format) {
    let y = this.getFullYear();
    let m = this.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = this.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = this.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = this.getMinutes();
    let second = this.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    format = format.replace("yyyy", y + "");
    format = format.replace("mm", m + '');
    format = format.replace("dd", d + '');
    format = format.replace('hh', h + '');
    format = format.replace('mm', minute + '');
    format = format.replace('ss', second + '');
    return format;
}