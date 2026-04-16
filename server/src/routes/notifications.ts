import express from "express";
const router = express.Router();

import { Request, Response } from "express";
import { tryCatch } from "../middleware";
import { Account } from "../database/schemas";
import { AuthenticateTokenOAuth } from "../middleware";
import { sendCustomNotification } from "../controllers/notifications";


router.route("/save-token").post(AuthenticateTokenOAuth, tryCatch(async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body;


    if (!token) {
        return res
            .status(400)
            .json({ success: false, message: "Token is required" });
    }

    const account = await Account.findById(req.user?._id);
    if (!account) {
        return res
            .status(404)
            .json({ success: false, message: "Account not found" });
    }

    // Check if this is the first time saving the token (new user or first login)
    const isFirstTime = !account.notifications.expo_push_token || account.notifications.expo_push_token === "";

    account.notifications.expo_push_token = token;
    await account.save();

    // Send welcome notification if this is the first time
    if (isFirstTime) {
        const userName = account.user?.name || "Utente";
        await sendCustomNotification(token, {
            title: "Benvenuto su FamilyTrip! 🎉",
            message: `Ciao ${userName}, la tua registrazione è stata completata con successo. Inizia a esplorare le destinazioni!`,
            soundOn: true,
            data: {
                type: "registration_confirmation",
            },
        });
    }

    res.status(200).json({
        success: true,
        message: "Notification token retrieved",
    });
}));





   

export default router
