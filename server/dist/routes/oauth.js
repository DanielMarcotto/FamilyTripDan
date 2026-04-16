"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const schemas_1 = require("../database/schemas");
const middleware_1 = require("../middleware");
const express_1 = tslib_1.__importDefault(require("express"));
const oauth_1 = require("../controllers/oauth");
const utils_1 = require("../utils");
const mail_1 = require("../controllers/mail");
const router = express_1.default.Router();
router.post("/login", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        let account = yield schemas_1.Account.findOne({ email: email, password: (0, utils_1.hashPassword)(password) });
        if (!account)
            return res.status(401).json({ success: false, message: "Email o password errate" });
        const token = (0, middleware_1.signToken)(email, (0, utils_1.hashPassword)(password));
        res.status(200).json({ success: true, token, account });
    }
    catch (error) {
        console.error("Apple login error:", error);
        res.status(401).json({ success: false, error: "Invalid or expired identity token" });
    }
}));
router.post("/register", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, surname } = req.body;
    let account = yield schemas_1.Account.findOne({ email: email });
    if (account)
        return res.status(401).json({ success: false, error: "la mail è già in uso" });
    account = new schemas_1.Account({
        email: email,
        password: (0, utils_1.hashPassword)(password),
        user: {
            name: name,
            surname: surname,
            username: `${name}.${surname}_${Math.ceil(Math.random() * 1000)}`,
            profile_picture: "",
            birthdate: "01/01/1970",
            type: "user",
        },
        booleans: {
            isVerified: true,
            isAdmin: false,
        },
    });
    yield account.save();
    return res.status(200).json({ success: true });
}));
router.post("/forgot-password", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: "Email richiesta" });
        }
        // Find account by email
        const account = yield schemas_1.Account.findOne({ email: email.toLowerCase() });
        // Always return success to prevent email enumeration
        // But only send email if account exists
        if (account) {
            // Generate a new random password (12 characters: alphanumeric)
            const newPassword = (0, utils_1.generateRandomAlphanumericString)(12);
            const hashedPassword = (0, utils_1.hashPassword)(newPassword);
            // Update account password
            account.password = hashedPassword;
            yield account.save();
            // Send email with new password
            const emailSent = yield (0, mail_1.sendPasswordResetEmail)(newPassword, email.toLowerCase());
            if (!emailSent) {
                console.error("Failed to send password reset email to:", email);
                // Still return success to user for security
            }
        }
        // Always return success message regardless of whether account exists
        // This prevents email enumeration attacks
        return res.status(200).json({
            success: true,
            message: "Se l'email esiste, riceverai una nuova password via email"
        });
    }
    catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({ success: false, error: "Errore interno del server" });
    }
}));
router.post("/login/apple", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identityToken } = req.body;
        if (!identityToken) {
            return res.status(400).json({ success: false, error: "Missing identityToken" });
        }
        const payload = yield (0, oauth_1.verifyAppleIdentityToken)(identityToken);
        //console.log(payload)
        const appleId = payload.sub;
        const emailApple = payload.email;
        let account = yield schemas_1.Account.findOne({ email: emailApple, password: (0, utils_1.hashPassword)(appleId) });
        if (!account) {
            console.log("Creating new account for Apple user:", emailApple);
            account = new schemas_1.Account({
                email: emailApple,
                password: (0, utils_1.hashPassword)(appleId), // no password required for Apple users or use appleId
                user: {
                    name: "",
                    surname: "",
                    username: `apple_${appleId.slice(-6)}`,
                    profile_picture: "",
                    birthdate: "",
                    type: "user",
                },
                booleans: {
                    isVerified: true,
                    isAdmin: false,
                },
                // Other fields will fall back to schema defaults
            });
            yield account.save();
        }
        const token = (0, middleware_1.signTokenOAuth)(emailApple, (0, utils_1.hashPassword)(appleId));
        res.status(200).json({ success: true, token, account });
    }
    catch (error) {
        console.error("Apple login error:", error);
        res.status(401).json({ success: false, error: "Invalid or expired identity token" });
    }
}));
router.post("/login/google", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, email, name, surname, photo } = req.body;
        let account = yield schemas_1.Account.findOne({ email: email, password: (0, utils_1.hashPassword)(id) });
        if (!account) {
            console.log("Creating new account for Google user:", email);
            account = new schemas_1.Account({
                email: email,
                password: (0, utils_1.hashPassword)(id), // no password required for Apple users or use appleId
                user: {
                    name: name !== null && name !== void 0 ? name : "",
                    surname: surname !== null && surname !== void 0 ? surname : "",
                    username: `${name}-${(0, utils_1.generateRandomNumberString)(4)}`,
                    profile_picture: photo,
                    birthdate: "",
                    type: "user",
                },
                booleans: {
                    isVerified: true,
                    isAdmin: false,
                },
                // Other fields will fall back to schema defaults
            });
            yield account.save();
        }
        const token = (0, middleware_1.signTokenOAuth)(email, (0, utils_1.hashPassword)(id));
        res.status(200).json({ success: true, token, account });
    }
    catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ success: false, error: "Invalid or expired identity token" });
    }
}));
router.route("/authenticate/oauth").get(middleware_1.AuthenticateTokenOAuth, (0, middleware_1.tryCatch)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res
            .status(400)
            .json({ success: true, message: "Auth user not found" });
    }
    res
        .status(200)
        .json({ success: true, message: "Authorized Access", data: req.user });
})));
router.route("/authenticate/sso").get(middleware_1.AuthenticateToken, (0, middleware_1.tryCatch)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res
            .status(400)
            .json({ success: true, message: "Auth user not found" });
    }
    res
        .status(200)
        .json({ success: true, message: "Authorized Access", data: req.user });
})));
/* DELETE /oauth/account - Delete the authenticated user's account */
router.delete("/account", middleware_1.AuthenticateToken, (0, middleware_1.tryCatch)((req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        });
    }
    const user = req.user;
    const userEmail = user.email;
    if (!userEmail) {
        return res.status(400).json({
            success: false,
            message: "User email not found"
        });
    }
    try {
        // Delete all favorites associated with this user
        yield schemas_1.Favorite.deleteMany({ user_id: userEmail });
        // Delete the account
        const deletedAccount = yield schemas_1.Account.findOneAndDelete({ email: userEmail });
        if (!deletedAccount) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
})));
exports.default = router;
