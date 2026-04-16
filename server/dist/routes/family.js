"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// src/routes/family.ts
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
const schemas_1 = require("../database/schemas");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Get user's email from authenticated request
const getUserEmail = (req) => {
    const user = req.user;
    if (!user || !user.email) {
        throw new Error("User email not found in request");
    }
    return user.email;
};
/* GET /family - Get all children for the authenticated user */
router.get("/", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const account = yield schemas_1.Account.findOne({ email: userEmail })
            .select("children")
            .lean();
        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }
        const children = account.children || [];
        res.status(200).json({
            success: true,
            items: children,
            total: children.length,
        });
    }
    catch (error) {
        console.error("Error in GET /family route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* POST /family - Add a child to the authenticated user's account */
router.post("/", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { name, age } = req.body;
        // Validate required fields
        if (!name || name.trim() === "") {
            res.status(400).json({
                success: false,
                message: "Name is required",
            });
            return;
        }
        if (age === undefined || age === null || isNaN(Number(age))) {
            res.status(400).json({
                success: false,
                message: "Age is required and must be a number",
            });
            return;
        }
        const ageNumber = Number(age);
        if (ageNumber < 0) {
            res.status(400).json({
                success: false,
                message: "Age must be a positive number",
            });
            return;
        }
        // Find account and add child
        const account = yield schemas_1.Account.findOne({ email: userEmail });
        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }
        // Add child to the array
        const newChild = {
            name: name.trim(),
            age: ageNumber,
        };
        account.children = account.children || [];
        account.children.push(newChild);
        yield account.save();
        // Get the newly created child (last in array)
        const savedChild = account.children[account.children.length - 1];
        res.status(201).json({
            success: true,
            message: "Child added successfully",
            item: savedChild,
        });
    }
    catch (error) {
        console.error("Error in POST /family route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* PUT /family/:childId - Update a child */
router.put("/:childId", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { childId } = req.params;
        const { name, age } = req.body;
        // Validate childId
        if (!mongoose_1.default.Types.ObjectId.isValid(childId)) {
            res.status(400).json({
                success: false,
                message: "Invalid child ID",
            });
            return;
        }
        // Validate that at least one field is provided
        if (name === undefined && age === undefined) {
            res.status(400).json({
                success: false,
                message: "At least one field (name or age) must be provided",
            });
            return;
        }
        // Validate name if provided
        if (name !== undefined && (name === null || name.trim() === "")) {
            res.status(400).json({
                success: false,
                message: "Name cannot be empty",
            });
            return;
        }
        // Validate age if provided
        if (age !== undefined) {
            if (age === null || isNaN(Number(age))) {
                res.status(400).json({
                    success: false,
                    message: "Age must be a valid number",
                });
                return;
            }
            const ageNumber = Number(age);
            if (ageNumber < 0) {
                res.status(400).json({
                    success: false,
                    message: "Age must be a positive number",
                });
                return;
            }
        }
        // Find account and update child
        const account = yield schemas_1.Account.findOne({ email: userEmail });
        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }
        account.children = account.children || [];
        const childIndex = account.children.findIndex((child) => { var _a; return ((_a = child._id) === null || _a === void 0 ? void 0 : _a.toString()) === childId; });
        if (childIndex === -1) {
            res.status(404).json({
                success: false,
                message: "Child not found",
            });
            return;
        }
        // Update fields
        if (name !== undefined) {
            account.children[childIndex].name = name.trim();
        }
        if (age !== undefined) {
            account.children[childIndex].age = Number(age);
        }
        yield account.save();
        res.status(200).json({
            success: true,
            message: "Child updated successfully",
            item: account.children[childIndex],
        });
    }
    catch (error) {
        console.error("Error in PUT /family/:childId route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
/* DELETE /family/:childId - Remove a child from the authenticated user's account */
router.delete("/:childId", authentication_1.AuthenticateToken, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = getUserEmail(req);
        const { childId } = req.params;
        // Validate childId
        if (!mongoose_1.default.Types.ObjectId.isValid(childId)) {
            res.status(400).json({
                success: false,
                message: "Invalid child ID",
            });
            return;
        }
        // Find account and remove child
        const account = yield schemas_1.Account.findOne({ email: userEmail });
        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }
        account.children = account.children || [];
        const initialLength = account.children.length;
        account.children = account.children.filter((child) => { var _a; return ((_a = child._id) === null || _a === void 0 ? void 0 : _a.toString()) !== childId; });
        if (account.children.length === initialLength) {
            res.status(404).json({
                success: false,
                message: "Child not found",
            });
            return;
        }
        yield account.save();
        res.status(200).json({
            success: true,
            message: "Child removed successfully",
        });
    }
    catch (error) {
        console.error("Error in DELETE /family/:childId route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}));
exports.default = router;
