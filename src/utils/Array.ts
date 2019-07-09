/**返回数组中最后一个元素，如果数组为空，返回null */
Object.defineProperty(Array.prototype, "lastObject", {
    configurable: false,
    enumerable: false,
    get: function () {
        if (!this.length){return null}
        return this[this.length - 1];
    }
})
/**随机返回数组中一个元素，如果数组为空，返回null */
Object.defineProperty(Array.prototype, "randomItem", {
    configurable: false,
    enumerable: false,
    get: function () {
        if (!this.length){return null}
        var index = Math.floor(Math.random() * this.length);
        return this[index];
    }
})