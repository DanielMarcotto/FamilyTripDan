"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const preferenceSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    examples: { type: [String], default: [] },
});
exports.default = mongoose_1.default.model("Preference", preferenceSchema);
