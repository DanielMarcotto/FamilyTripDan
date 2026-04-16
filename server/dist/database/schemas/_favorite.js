"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const favoriteSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    poi_id: {
        type: String,
        required: true,
        index: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Compound index to ensure one favorite per user per POI
favoriteSchema.index({ user_id: 1, poi_id: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Favorite", favoriteSchema);
