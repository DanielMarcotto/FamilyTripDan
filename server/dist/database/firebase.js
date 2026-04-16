"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const tslib_1 = require("tslib");
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
const serviceAccount = require("../../../serviceAccountKey.json");
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
const db = firebase_admin_1.default.firestore();
exports.db = db;
