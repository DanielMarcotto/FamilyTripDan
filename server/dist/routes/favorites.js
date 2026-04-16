"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// src/routes/favorites.ts
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
const schemas_1 = require("../database/schemas");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const router = (0, express_1.Router)();
const poiCache = { data: null, loadPromise: null };
const loadPOIJSON = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (poiCache.data !== null) {
        return poiCache.data;
    }
    if (poiCache.loadPromise !== null) {
        return poiCache.loadPromise;
    }
    poiCache.loadPromise = (() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            let fullPath = (0, path_1.join)(__dirname, "../mocks/poi.json");
            if (!(0, fs_1.existsSync)(fullPath)) {
                const srcPath = (0, path_1.join)((0, path_1.dirname)(__dirname), "mocks/poi.json");
                if ((0, fs_1.existsSync)(srcPath)) {
                    fullPath = srcPath;
                }
            }
            const fileContent = yield (0, promises_1.readFile)(fullPath, "utf-8");
            const data = JSON.parse(fileContent);
            poiCache.data = data;
            return data;
        }
        catch (error) {
            console.error(`Error loading POI JSON file:`, error);
            poiCache.loadPromise = null;
            throw error;
        }
    }))();
    return poiCache.loadPromise;
});
// Get user's email from authenticated request
const getUserEmail = (req) => {
    const user = req.user;
    if (!user || !user.email) {
        throw new Error("User email not found in request");
    }
    return user.email;
};
/* GET /favorites - Get all favorites for the authenticated user */
router.get("/", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        // Get all favorites for this user
        const favorites = yield schemas_1.Favorite.find({ user_id: userEmail }).lean();
        // Get POI data for each favorite
        const poiData = yield loadPOIJSON();
        const favoritePOIs = favorites
            .map((fav) => {
            const poi = poiData.find((p) => p.id === fav.poi_id);
            return poi ? Object.assign(Object.assign({}, poi), { favorited_at: fav.createdAt }) : null;
        })
            .filter((poi) => poi !== null);
        res.status(200).json({
            success: true,
            items: favoritePOIs,
            total: favoritePOIs.length,
        });
    }
    catch (error) {
        console.error("Error in GET /favorites route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* POST /favorites - Add a POI to favorites */
router.post("/", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { poi_id } = req.body;
        if (!poi_id) {
            res.status(400).json({
                success: false,
                message: "poi_id is required",
            });
            return;
        }
        // Check if POI exists
        const poiData = yield loadPOIJSON();
        const poi = poiData.find((p) => p.id === poi_id);
        if (!poi) {
            res.status(404).json({
                success: false,
                message: "POI not found",
            });
            return;
        }
        // Check if already favorited
        const existingFavorite = yield schemas_1.Favorite.findOne({
            user_id: userEmail,
            poi_id: poi_id,
        });
        if (existingFavorite) {
            res.status(200).json({
                success: true,
                message: "POI already in favorites",
                item: existingFavorite,
            });
            return;
        }
        // Create new favorite
        const favorite = new schemas_1.Favorite({
            user_id: userEmail,
            poi_id: poi_id,
        });
        yield favorite.save();
        res.status(201).json({
            success: true,
            message: "POI added to favorites",
            item: favorite,
        });
    }
    catch (error) {
        console.error("Error in POST /favorites route:", error);
        // Handle duplicate key error (unique constraint)
        if (error.code === 11000) {
            res.status(200).json({
                success: true,
                message: "POI already in favorites",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* DELETE /favorites/:poi_id - Remove a POI from favorites */
router.delete("/:poi_id", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { poi_id } = req.params;
        const favorite = yield schemas_1.Favorite.findOneAndDelete({
            user_id: userEmail,
            poi_id: poi_id,
        });
        if (!favorite) {
            res.status(404).json({
                success: false,
                message: "Favorite not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "POI removed from favorites",
        });
    }
    catch (error) {
        console.error("Error in DELETE /favorites/:poi_id route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* GET /favorites/check/:poi_id - Check if a POI is favorited by the user */
router.get("/check/:poi_id", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { poi_id } = req.params;
        const favorite = yield schemas_1.Favorite.findOne({
            user_id: userEmail,
            poi_id: poi_id,
        }).lean();
        res.status(200).json({
            success: true,
            isFavorite: !!favorite,
        });
    }
    catch (error) {
        console.error("Error in GET /favorites/check/:poi_id route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
exports.default = router;
