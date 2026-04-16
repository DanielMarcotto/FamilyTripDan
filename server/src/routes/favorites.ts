// src/routes/favorites.ts
import { Router, Request, Response } from "express";
import { AuthenticateToken } from "../middleware/authentication";
import { Favorite } from "../database/schemas";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

const router = Router();

// Lazy loading POI data (same pattern as navigation.ts)
type JSONCache<T> = {
    data: T[] | null;
    loadPromise: Promise<T[]> | null;
};

const poiCache: JSONCache<any> = { data: null, loadPromise: null };

const loadPOIJSON = async (): Promise<any[]> => {
    if (poiCache.data !== null) {
        return poiCache.data;
    }

    if (poiCache.loadPromise !== null) {
        return poiCache.loadPromise;
    }

    poiCache.loadPromise = (async () => {
        try {
            let fullPath = join(__dirname, "../mocks/poi.json");
            
            if (!existsSync(fullPath)) {
                const srcPath = join(dirname(__dirname), "mocks/poi.json");
                if (existsSync(srcPath)) {
                    fullPath = srcPath;
                }
            }
            
            const fileContent = await readFile(fullPath, "utf-8");
            const data = JSON.parse(fileContent) as any[];
            poiCache.data = data;
            return data;
        } catch (error) {
            console.error(`Error loading POI JSON file:`, error);
            poiCache.loadPromise = null;
            throw error;
        }
    })();

    return poiCache.loadPromise;
};

// Get user's email from authenticated request
const getUserEmail = (req: Request): string => {
    const user = req.user as any;
    if (!user || !user.email) {
        throw new Error("User email not found in request");
    }
    return user.email;
};

/* GET /favorites - Get all favorites for the authenticated user */
router.get("/", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        
        // Get all favorites for this user
        const favorites = await Favorite.find({ user_id: userEmail }).lean();
        
        // Get POI data for each favorite
        const poiData = await loadPOIJSON();
        const favoritePOIs = favorites
            .map((fav) => {
                const poi = poiData.find((p) => p.id === fav.poi_id);
                return poi ? { ...poi, favorited_at: fav.createdAt } : null;
            })
            .filter((poi) => poi !== null);

        res.status(200).json({
            success: true,
            items: favoritePOIs,
            total: favoritePOIs.length,
        });
    } catch (error: any) {
        console.error("Error in GET /favorites route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

/* POST /favorites - Add a POI to favorites */
router.post("/", AuthenticateToken, async (req: Request, res: Response) => {
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
        const poiData = await loadPOIJSON();
        const poi = poiData.find((p) => p.id === poi_id);
        if (!poi) {
            res.status(404).json({
                success: false,
                message: "POI not found",
            });
            return;
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
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
        const favorite = new Favorite({
            user_id: userEmail,
            poi_id: poi_id,
        });

        await favorite.save();

        res.status(201).json({
            success: true,
            message: "POI added to favorites",
            item: favorite,
        });
    } catch (error: any) {
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
});

/* DELETE /favorites/:poi_id - Remove a POI from favorites */
router.delete("/:poi_id", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        const { poi_id } = req.params;

        const favorite = await Favorite.findOneAndDelete({
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
    } catch (error: any) {
        console.error("Error in DELETE /favorites/:poi_id route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

/* GET /favorites/check/:poi_id - Check if a POI is favorited by the user */
router.get("/check/:poi_id", AuthenticateToken, async (req: Request, res: Response) => {
    try {
        const userEmail = getUserEmail(req);
        const { poi_id } = req.params;

        const favorite = await Favorite.findOne({
            user_id: userEmail,
            poi_id: poi_id,
        }).lean();

        res.status(200).json({
            success: true,
            isFavorite: !!favorite,
        });
    } catch (error: any) {
        console.error("Error in GET /favorites/check/:poi_id route:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});

export default router;

