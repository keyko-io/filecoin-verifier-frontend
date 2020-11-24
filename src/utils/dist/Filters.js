"use strict";
exports.__esModule = true;
exports.datacapFilter = exports.addressFilter = void 0;
var config_1 = require("../config");
function addressFilter(input) {
    return input.substr(0, 5) + "..." + input.substr(-5, 5);
}
exports.addressFilter = addressFilter;
function datacapFilter(input) {
    if (input === "") {
        return "0 B";
    }
    var pointLoc = input.indexOf(".");
    if (pointLoc >= 0) {
        input = input.substr(0, pointLoc);
    }
    var inputLength = input.length;
    if (inputLength > config_1.config.datacapExt[config_1.config.datacapExt.length - 1].value.length + 3) {
        return "999+ " + config_1.config.datacapExt[config_1.config.datacapExt.length - 1].name;
    }
    for (var i = config_1.config.datacapExt.length - 1; i >= 0; i--) {
        if (config_1.config.datacapExt[i].value.length <= inputLength) {
            return input.substring(0, inputLength - (config_1.config.datacapExt[i].value.length - 1)) + " " + config_1.config.datacapExt[i].name;
        }
    }
}
exports.datacapFilter = datacapFilter;
