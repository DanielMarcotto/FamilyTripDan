"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const connectDatabase = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_URI}`;
    /* const uri = !process.env.DOCKER_MONGODB_URI
    ? `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`
    : process.env.DOCKER_MONGODB_URI;  // Default to local MongoDB connection */
    const conn = yield mongoose_1.default.connect(uri);
    mongoose_1.default.connection.on("error", console.error.bind(console, "connection error:"));
    mongoose_1.default.connection.once("open", () => console.log(`MongoDB Connected: ${conn.connection.host}`));
    //console.log(`[DATABASE]   Connected - ${conn.connection.host}`);
});
exports.default = connectDatabase;
