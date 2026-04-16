"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAppleIdentityToken = verifyAppleIdentityToken;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = tslib_1.__importDefault(require("jwks-rsa"));
const client = (0, jwks_rsa_1.default)({
    jwksUri: "https://appleid.apple.com/auth/keys",
});
function verifyAppleIdentityToken(token) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const decodedHeader = jsonwebtoken_1.default.decode(token, { complete: true });
        if (!decodedHeader)
            throw new Error("Invalid token");
        const kid = decodedHeader.header.kid;
        const alg = decodedHeader.header.alg;
        const key = yield getAppleSigningKey(kid);
        const payload = jsonwebtoken_1.default.verify(token, key, {
            algorithms: [alg],
        });
        return payload;
    });
}
function getAppleSigningKey(kid) {
    return new Promise((resolve, reject) => {
        client.getSigningKey(kid, (err, key) => {
            if (err)
                return reject(err);
            if (!key)
                return reject(new Error("Signing key not found"));
            const signingKey = key.getPublicKey();
            resolve(signingKey);
        });
    });
}
