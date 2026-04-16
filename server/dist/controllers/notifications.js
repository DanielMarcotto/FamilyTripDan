"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDefaultNotification = exports.sendCustomNotification = exports.getUserNotificationToken = void 0;
const tslib_1 = require("tslib");
const schemas_1 = require("../database/schemas");
const notificationsSchema = [
    {
        id: 'test',
        title: 'FamilyTrip[test]',
        message: ' Notifica Demo, Ignorare',
        data: {}
    },
];
const getUserNotificationToken = (userId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const account = yield schemas_1.Account.findById(userId).select("notifications").lean();
    if (!account) {
        return {
            success: false,
            message: "Account not found",
        };
    }
    return {
        success: true,
        notificationToken: account.notifications.expo_push_token,
    };
});
exports.getUserNotificationToken = getUserNotificationToken;
const sendCustomNotification = (expoPushToken, settings) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!expoPushToken || expoPushToken === "") {
        console.error("This user has no expo push token, no notification will be sent");
        return null;
    }
    const message = {
        to: expoPushToken,
        sound: settings.soundOn ? "default" : null,
        title: (_a = settings.title) !== null && _a !== void 0 ? _a : 'FamilyTrip[test]',
        body: settings.message,
        data: settings.data || {},
        badge: settings.badgeCount || 0,
    };
    try {
        const response = yield fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error("Error sending notification:", error);
        return null;
    }
});
exports.sendCustomNotification = sendCustomNotification;
const sendDefaultNotification = (expoPushToken, type) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!expoPushToken || expoPushToken === "") {
        console.error("This user has no expo push token, no notification will be sent");
        return null;
    }
    const find = notificationsSchema.find(n => n.id == type);
    if (!find)
        return;
    const message = {
        to: expoPushToken,
        sound: "default",
        title: (_a = find.title) !== null && _a !== void 0 ? _a : 'FamilyTrip[test]',
        body: (_b = find.message) !== null && _b !== void 0 ? _b : 'No message',
        data: (_c = find.data) !== null && _c !== void 0 ? _c : {},
        badge: 0,
    };
    try {
        const response = yield fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error("Error sending notification:", error);
        return null;
    }
});
exports.sendDefaultNotification = sendDefaultNotification;
