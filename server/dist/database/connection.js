"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const connectDatabase = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined');
        }
        const conn = yield mongoose_1.default.connect(uri);
        mongoose_1.default.connection.on('error', console.error.bind(console, 'connection error:'));
        mongoose_1.default.connection.once('open', () => console.log(`MongoDB Connected: ${conn.connection.host}`));
    }
    catch (error) {
        console.error('[DATABASE] Connection failed:', error);
        process.exit(1);
    }
});
exports.default = connectDatabase;
