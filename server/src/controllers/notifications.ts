import { Account } from "../database/schemas";


const notificationsSchema = [
    {
        id: 'test',
        title: 'FamilyTrip[test]',
        message: ' Notifica Demo, Ignorare',
        data: {}
    },

] as const 

//Creates the types based on id in the array above -> Types for sendDefaultNotification.type
type NotificationType = typeof notificationsSchema[number]['id'];



const getUserNotificationToken = async (userId: string) => {
    const account = await Account.findById(userId).select("notifications").lean();
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
}
const sendCustomNotification = async (
    expoPushToken: string | null | undefined,
    settings: {
        message: string;
        title: string;
        data?: any;
        soundOn?: boolean;
        badgeCount?: number;
    }
) => {

    if (!expoPushToken || expoPushToken === "") {
        console.error("This user has no expo push token, no notification will be sent");
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: settings.soundOn ? "default" : null,
        title: settings.title ?? 'FamilyTrip[test]',
        body: settings.message,
        data: settings.data || {},
        badge: settings.badgeCount || 0,
    };

    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending notification:", error);
        return null
    }
}
const sendDefaultNotification = async (
    expoPushToken: string | null | undefined,
    type: NotificationType
) => {

    if (!expoPushToken || expoPushToken === "") {
        console.error("This user has no expo push token, no notification will be sent");
        return null;
    }

    const find = notificationsSchema.find(n => n.id == type)
    if (!find) return

    const message = {
        to: expoPushToken,
        sound: "default",
        title: find.title ?? 'FamilyTrip[test]',
        body: find.message ?? 'No message',
        data: find.data ?? {},
        badge: 0,
    };

    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending notification:", error);
        return null
    }
}


export {
    getUserNotificationToken,
    sendCustomNotification,
    sendDefaultNotification
}