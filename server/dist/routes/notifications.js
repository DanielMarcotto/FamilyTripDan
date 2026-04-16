"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const router = express_1.default.Router();
const middleware_1 = require("../middleware");
const schemas_1 = require("../database/schemas");
const middleware_2 = require("../middleware");
const notifications_1 = require("../controllers/notifications");
router.route("/save-token").post(middleware_2.AuthenticateTokenOAuth, (0, middleware_1.tryCatch)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { token } = req.body;
    if (!token) {
        return res
            .status(400)
            .json({ success: false, message: "Token is required" });
    }
    const account = yield schemas_1.Account.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    if (!account) {
        return res
            .status(404)
            .json({ success: false, message: "Account not found" });
    }
    // Check if this is the first time saving the token (new user or first login)
    const isFirstTime = !account.notifications.expo_push_token || account.notifications.expo_push_token === "";
    account.notifications.expo_push_token = token;
    yield account.save();
    // Send welcome notification if this is the first time
    if (isFirstTime) {
        const userName = ((_b = account.user) === null || _b === void 0 ? void 0 : _b.name) || "Utente";
        yield (0, notifications_1.sendCustomNotification)(token, {
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
})));
exports.default = router;
