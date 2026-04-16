"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateTokenOAuth = exports.AuthenticateToken = void 0;
exports.signToken = signToken;
exports.signTokenOAuth = signTokenOAuth;
const tslib_1 = require("tslib");
const schemas_1 = require("../database/schemas");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const AuthenticateToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        res.status(401).json({ success: false, error: "No authorization header provided" });
        return;
    }
    const [scheme, token] = req.headers.authorization.split(" ");
    if (scheme !== "Bearer") {
        res.status(401).json({ success: false, error: "Invalid token format" });
        return;
    }
    if (!token || token === "null") {
        res.status(401).json({ success: false, error: "Null token provided" });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        next(new Error("JWT_SECRET is not defined"));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const account = yield schemas_1.Account.findOne({
            email: decoded.email,
            password: decoded.password, // consider replacing with _id
        }).select("-password -settings -contacts").lean();
        if (!account) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }
        req.user = account;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Authentication Error" });
    }
});
exports.AuthenticateToken = AuthenticateToken;
const AuthenticateTokenOAuth = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        res.status(401).json({ success: false, error: 'No authorization header provided' });
        return;
    }
    if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
        res.status(401).json({ success: false, error: 'Invalid token format' });
        return;
    }
    if (req.headers.authorization.split(' ')[1] === 'null') {
        res.status(401).json({ success: false, error: 'Null token provided' });
        return;
    }
    const token = req.headers.authorization.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        next(new Error('JWT_SECRET is not defined'));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const account = yield schemas_1.Account.findOne({
            email: decoded.email,
            password: decoded.password, // Consider revising to use _id
        }).select('-password -settings -contacts').lean();
        if (!account) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        req.user = account; // Attach plain object to req.user
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Authentication Error' });
    }
});
exports.AuthenticateTokenOAuth = AuthenticateTokenOAuth;
function signToken(email, password) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ email: email.toLowerCase(), password: password }, jwtSecret);
}
function signTokenOAuth(email, id) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ email: email.toLowerCase(), password: id }, jwtSecret);
}
