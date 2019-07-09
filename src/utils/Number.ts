interface Number {
    formatTime(): string;
}

/**
 * 格式化秒数，如 1000s = 00:16:40
 */
Number.prototype.formatTime = function (format = 'H:M:S') {
    let seconds = this;
    seconds = Math.floor(seconds);
    let hour = Math.floor(seconds / 3600);
    let hourStr = hour < 10 ? ("0" + hour) : hour + '';
    var balance = seconds % 3600;
    let minute = Math.floor(balance / 60);
    let minuteStr = minute < 10 ? ("0" + minute) : minute + '';
    let second = balance % 60;
    let secondStr = second < 10 ? ("0" + second) : second + '';
    if (format.indexOf('H') != -1) {
        format = format.replace(/H/, hourStr)
    }
    if (format.indexOf('M') != -1) {
        format = format.replace(/M/, minuteStr)
    }
    if (format.indexOf('S') != -1) {
        format = format.replace(/S/, secondStr)
    }
    return format
}