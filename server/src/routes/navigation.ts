// src/routes/navigation.ts
import { Router, Request, Response } from "express";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { db } from "../database/firebase";

const router = Router();

// Lazy loading with caching for JSON files
type JSONCache<T> = {
  data: T[] | null;
  loadPromise: Promise<T[]> | null;
};

const poiCache: JSONCache<any> = { data: null, loadPromise: null };
const destinationsCache: JSONCache<any> = { data: null, loadPromise: null };
const activitiesCache: JSONCache<any> = { data: null, loadPromise: null };

const loadJSON = async <T>(cache: JSONCache<T>, filePath: string): Promise<T[]> => {
  if (cache.data !== null) {
    return cache.data;
  }

  if (cache.loadPromise !== null) {
    return cache.loadPromise;
  }

  cache.loadPromise = (async () => {
    try {
      let fullPath = join(__dirname, filePath);

      if (!existsSync(fullPath)) {
        const srcPath = join(dirname(__dirname), filePath.replace("../", ""));
        if (existsSync(srcPath)) {
          fullPath = srcPath;
        }
      }

      const fileContent = await readFile(fullPath, "utf-8");
      const data = JSON.parse(fileContent) as T[];
      cache.data = data;
      return data;
    } catch (error) {
      console.error(`Error loading JSON file ${filePath}:`, error);
      cache.loadPromise = null;
      throw error;
    }
  })();

  return cache.loadPromise;
};

const getPOIData = async () => {
  const snapshot = await db.collection("pois").get();
  return snapshot.docs.map((doc: any) => doc.data());
};

const getDestinationsData = async () => {
  const snapshot = await db.collection("destinations").get();
  return snapshot.docs.map((doc: any) => doc.data());
};

const getActivitiesData = async () => {
  const snapshot = await db.collection("activities").get();
  return snapshot.docs.map((doc: any) => doc.data());
};

const PAGE_SIZE = 40;

const paginate = <T>(data: T[], page: number) => {
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const items = data.slice(start, end);

  return {
    items,
    hasMore: end < data.length,
    total: data.length,
  };
};

/* POI */

router.get("/poi", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 0);
    const poiData = await getPOIData();
    const { items, hasMore, total } = paginate(poiData, page);

    console.log("poiData", items, hasMore, total);
    res.status(200).json({ success: true, items, hasMore, total });
  } catch (error) {
    console.error("Error in /poi route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/poi/:id", async (req: Request, res: Response) => {
  try {
    const poiData = await getPOIData();
    const poi = poiData.find((p: any) => p.id === req.params.id);

    if (!poi) {
      res.status(404).json({ success: false, message: "POI not found" });
      return;
    }

    res.status(200).json({ success: true, item: poi });
  } catch (error) {
    console.error("Error in /poi/:id route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* Destinations */

router.get("/destinations", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 0);
    const destinationsData = await getDestinationsData();
    const { items, hasMore, total } = paginate(destinationsData, page);

    res.status(200).json({ success: true, items, hasMore, total });
  } catch (error) {
    console.error("Error in /destinations route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/destinations/:id", async (req: Request, res: Response) => {
  try {
    const destinationsData = await getDestinationsData();
    const dest = destinationsData.find((d: any) => d.id === req.params.id);

    if (!dest) {
      res.status(404).json({ success: false, message: "Destination not found" });
      return;
    }

    res.status(200).json({ success: true, item: dest });
  } catch (error) {
    console.error("Error in /destinations/:id route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* Activities */

router.get("/activities", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 0);
    const activitiesData = await getActivitiesData();
    const { items, hasMore, total } = paginate(activitiesData, page);

    res.status(200).json({ success: true, items, hasMore, total });
  } catch (error) {
    console.error("Error in /activities route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/activities/:id", async (req: Request, res: Response) => {
  try {
    const activitiesData = await getActivitiesData();
    const act = activitiesData.find((a: any) => a.id === req.params.id);

    if (!act) {
      res.status(404).json({ success: false, message: "Activity not found" });
      return;
    }

    res.status(200).json({ success: true, item: act });
  } catch (error) {
    console.error("Error in /activities/:id route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const poiData = await getPOIData();
    const rawCategories = poiData.map((p: any) => p.category);
    const categories = Array.from(new Set(rawCategories));

    res.status(200).json({
      success: true,
      items: categories,
    });
  } catch (error) {
    console.error("Error in /categories route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
