"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
exports.generateRandomNumberString = generateRandomNumberString;
exports.generateRandomAlphanumericString = generateRandomAlphanumericString;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
function generateRandomNumberString(length) {
    if (length <= 0)
        return '';
    let result = '';
    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        result += digit.toString();
    }
    return result;
}
function generateRandomAlphanumericString(length) {
    if (length <= 0)
        return '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
}
const hashPassword = (password) => {
    const sha256 = crypto_1.default.createHash("sha256");
    const hashedPassword = sha256.update(password).digest("hex");
    return hashedPassword;
};
exports.hashPassword = hashPassword;
exports.default = exports.hashPassword;
