// src/routes/family.ts
import { Router, Request, Response } from "express";
import { AuthenticateToken } from "../middleware/authentication";
import { Account } from "../database/schemas";
import mongoose from "mongoose";

const router = Router();

// Get user's email from authenticated request
const getUserEmail = (req: Request): string => {
    const user = req.user as any;
    if (!user || !user.email) {
        throw new Error("User email not found in request");
    }
    return user.email;
};

/* GET /family - Get all children for the authenticated user */
router.get("/", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        
        const account = await Account.findOne({ email: userEmail })
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
    } catch (error: any) {
        console.error("Error in GET /family route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

/* POST /family - Add a child to the authenticated user's account */
router.post("/", AuthenticateToken, async (req: Request, res: Response) => {
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
        const account = await Account.findOne({ email: userEmail });

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
        account.children.push(newChild as any);

        await account.save();

        // Get the newly created child (last in array)
        const savedChild = account.children[account.children.length - 1];

        res.status(201).json({
            success: true,
            message: "Child added successfully",
            item: savedChild,
        });
    } catch (error: any) {
        console.error("Error in POST /family route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

/* PUT /family/:childId - Update a child */
router.put("/:childId", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        const { childId } = req.params;
        const { name, age } = req.body;

        // Validate childId
        if (!mongoose.Types.ObjectId.isValid(childId)) {
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
        const account = await Account.findOne({ email: userEmail });

        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }

        account.children = account.children || [];
        const childIndex = account.children.findIndex(
            (child: any) => child._id?.toString() === childId
        );

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

        await account.save();

        res.status(200).json({
            success: true,
            message: "Child updated successfully",
            item: account.children[childIndex],
        });
    } catch (error: any) {
        console.error("Error in PUT /family/:childId route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

/* DELETE /family/:childId - Remove a child from the authenticated user's account */
router.delete("/:childId", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        const { childId } = req.params;

        // Validate childId
        if (!mongoose.Types.ObjectId.isValid(childId)) {
            res.status(400).json({
                success: false,
                message: "Invalid child ID",
            });
            return;
        }

        // Find account and remove child
        const account = await Account.findOne({ email: userEmail });

        if (!account) {
            res.status(404).json({
                success: false,
                message: "Account not found",
            });
            return;
        }

        account.children = account.children || [];
        const initialLength = account.children.length;
        
        account.children = account.children.filter(
            (child: any) => child._id?.toString() !== childId
        );

        if (account.children.length === initialLength) {
            res.status(404).json({
                success: false,
                message: "Child not found",
            });
            return;
        }

        await account.save();

        res.status(200).json({
            success: true,
            message: "Child removed successfully",
        });
    } catch (error: any) {
        console.error("Error in DELETE /family/:childId route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

export default router;
