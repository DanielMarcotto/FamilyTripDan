"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const stopSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    duration_minutes: { type: Number, required: true },
});
const activitySchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    destination_id: {
        type: String,
        ref: "Destination",
        required: true,
        index: true,
    },
    age_range: { type: String, default: "" },
    duration_hours: { type: Number, default: 0 },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy",
    },
    tags: { type: [String], default: [] },
    description: { type: String, default: "" },
    stops: { type: [stopSchema], default: [] },
});
exports.default = mongoose_1.default.model("Activity", activitySchema);
