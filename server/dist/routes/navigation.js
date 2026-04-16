"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// src/routes/navigation.ts
const express_1 = require("express");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const firebase_1 = require("../database/firebase");
const router = (0, express_1.Router)();
const poiCache = { data: null, loadPromise: null };
const destinationsCache = { data: null, loadPromise: null };
const activitiesCache = { data: null, loadPromise: null };
const loadJSON = (cache, filePath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    // Return cached data if available
    if (cache.data !== null) {
        return cache.data;
    }
    // If already loading, wait for that promise
    if (cache.loadPromise !== null) {
        return cache.loadPromise;
    }
    // Start loading
    cache.loadPromise = (() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // Try multiple paths: dist (production) and src (development)
            let fullPath = (0, path_1.join)(__dirname, filePath);
            // If file doesn't exist in dist, try src directory (for development with ts-node)
            if (!(0, fs_1.existsSync)(fullPath)) {
                const srcPath = (0, path_1.join)((0, path_1.dirname)(__dirname), filePath.replace("../", ""));
                if ((0, fs_1.existsSync)(srcPath)) {
                    fullPath = srcPath;
                }
            }
            const fileContent = yield (0, promises_1.readFile)(fullPath, "utf-8");
            const data = JSON.parse(fileContent);
            cache.data = data;
            return data;
        }
        catch (error) {
            console.error(`Error loading JSON file ${filePath}:`, error);
            cache.loadPromise = null; // Reset on error
            throw error;
        }
    }))();
    return cache.loadPromise;
});
const getPOIData = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("pois").get();
    return snapshot.docs.map(doc => doc.data());
});
const getDestinationsData = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("destinations").get();
    return snapshot.docs.map(doc => doc.data());
});
const getActivitiesData = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("activities").get();
    return snapshot.docs.map(doc => doc.data());
});
const PAGE_SIZE = 40; // Reduced from 2000 for better performance
const paginate = (data, page) => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = data.slice(start, end);
    return {
        items,
        hasMore: end < data.length,
        total: data.length
    };
};
/* POI */
router.get("/poi", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number((_a = req.query.page) !== null && _a !== void 0 ? _a : 0);
        const poiData = yield getPOIData();
        const { items, hasMore, total } = paginate(poiData, page);
        console.log('poiData', items, hasMore, total);
        res.status(200).json({ success: true, items, hasMore, total });
    }
    catch (error) {
        console.error("Error in /poi route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.get("/poi/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const poiData = yield getPOIData();
        const poi = poiData.find((p) => p.id === req.params.id);
        if (!poi) {
            res.status(404).json({ success: false, message: "POI not found" });
            return;
        }
        res.status(200).json({ success: true, item: poi });
    }
    catch (error) {
        console.error("Error in /poi/:id route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
/* Destinations */
router.get("/destinations", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number((_a = req.query.page) !== null && _a !== void 0 ? _a : 0);
        const destinationsData = yield getDestinationsData();
        const { items, hasMore, total } = paginate(destinationsData, page);
        res.status(200).json({ success: true, items, hasMore, total });
    }
    catch (error) {
        console.error("Error in /destinations route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.get("/destinations/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const destinationsData = yield getDestinationsData();
        const dest = destinationsData.find((d) => d.id === req.params.id);
        if (!dest) {
            res.status(404).json({ success: false, message: "Destination not found" });
            return;
        }
        res.status(200).json({ success: true, item: dest });
    }
    catch (error) {
        console.error("Error in /destinations/:id route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
/* Activities */
router.get("/activities", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number((_a = req.query.page) !== null && _a !== void 0 ? _a : 0);
        const activitiesData = yield getActivitiesData();
        const { items, hasMore, total } = paginate(activitiesData, page);
        res.status(200).json({ success: true, items, hasMore, total });
    }
    catch (error) {
        console.error("Error in /activities route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.get("/activities/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const activitiesData = yield getActivitiesData();
        const act = activitiesData.find((a) => a.id === req.params.id);
        if (!act) {
            res.status(404).json({ success: false, message: "Activity not found" });
            return;
        }
        res.status(200).json({ success: true, item: act });
    }
    catch (error) {
        console.error("Error in /activities/:id route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.get("/categories", (_req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const poiData = yield getPOIData();
        const rawCategories = poiData.map(p => p.category);
        const categories = Array.from(new Set(rawCategories)); // unique
        res.status(200).json({
            success: true,
            items: categories
        });
    }
    catch (error) {
        console.error("Error in /categories route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.default = router;
