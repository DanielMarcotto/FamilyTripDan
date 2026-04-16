"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const poiSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    destination_id: {
        type: String,
        ref: "Destination",
        required: true,
        index: true,
    },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    pictures: { type: [String], default: [] },
    environment: { type: String, default: "" },
});
exports.default = mongoose_1.default.model("POI", poiSchema);
