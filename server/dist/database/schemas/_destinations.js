"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const destinationSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
});
exports.default = mongoose_1.default.model("Destination", destinationSchema);
