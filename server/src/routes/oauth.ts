import { Request, Response } from "express";
import { Account, Favorite } from "../database/schemas";
import {AuthenticateToken, AuthenticateTokenOAuth, signToken, signTokenOAuth, tryCatch} from "../middleware";




import express from "express";
import { verifyAppleIdentityToken } from "../controllers/oauth";
import { generateRandomNumberString, hashPassword, generateRandomAlphanumericString } from "../utils";
import { sendPasswordResetEmail } from "../controllers/mail";
const router = express.Router();

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
        const {email, password} = req.body;

        let account = await Account.findOne({ email: email, password: hashPassword(password) });

        if (!account) return  res.status(401).json({ success: false, message: "Email o password errate" });

        const token = signToken(email, hashPassword(password));

        res.status(200).json({ success: true, token, account });
    } catch (error) {
        console.error("Apple login error:", error);
        res.status(401).json({ success: false, error: "Invalid or expired identity token" });
    }
});
router.post("/register", async (req: Request, res: Response): Promise<any> => {
        const { email, password, name, surname } = req.body;

        let account = await Account.findOne({ email: email });
        if (account) return res.status(401).json({ success: false, error: "la mail è già in uso" });

        account = new Account({
            email: email,
            password: hashPassword(password),
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

        await account.save();

       return res.status(200).json({ success: true });
});

router.post("/forgot-password", async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: "Email richiesta" });
        }

        // Find account by email
        const account = await Account.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        // But only send email if account exists
        if (account) {
            // Generate a new random password (12 characters: alphanumeric)
            const newPassword = generateRandomAlphanumericString(12);
            const hashedPassword = hashPassword(newPassword);

            // Update account password
            account.password = hashedPassword;
            await account.save();

            // Send email with new password
            const emailSent = await sendPasswordResetEmail(newPassword, email.toLowerCase());

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
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({ success: false, error: "Errore interno del server" });
    }
});

router.post("/login/apple", async (req: Request, res: Response): Promise<any> => {
  try {
    const { identityToken } = req.body;

    if (!identityToken) {
      return res.status(400).json({ success: false, error: "Missing identityToken" });
    }

    const payload: any = await verifyAppleIdentityToken(identityToken);
    //console.log(payload)
    const appleId = payload.sub;
    const emailApple = payload.email;

    let account = await Account.findOne({ email: emailApple, password: hashPassword(appleId) });

    if (!account) {
      console.log("Creating new account for Apple user:", emailApple);
      account = new Account({
        email: emailApple,
        password: hashPassword(appleId), // no password required for Apple users or use appleId
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

      await account.save();
    }

    const token = signTokenOAuth(emailApple, hashPassword(appleId));

    res.status(200).json({ success: true, token, account });
  } catch (error) {
    console.error("Apple login error:", error);
    res.status(401).json({ success: false, error: "Invalid or expired identity token" });
  }
});
router.post("/login/google", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id, email, name, surname, photo } = req.body;


    let account = await Account.findOne({ email: email, password: hashPassword(id) });

    if (!account) {
      console.log("Creating new account for Google user:", email);
      account = new Account({
        email: email,
        password: hashPassword(id), // no password required for Apple users or use appleId
        user: {
          name: name ?? "",
          surname: surname ?? "",
          username: `${name}-${generateRandomNumberString(4)}`,
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

      await account.save();
    }

    const token = signTokenOAuth(email, hashPassword(id));

    res.status(200).json({ success: true, token, account });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ success: false, error: "Invalid or expired identity token" });
  }
});


router.route("/authenticate/oauth").get(AuthenticateTokenOAuth, tryCatch(async (req: Request, res: Response): Promise<any> => {
  if (!req.user) {
    return res
      .status(400)
      .json({ success: true, message: "Auth user not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Authorized Access", data: req.user});
}));
router.route("/authenticate/sso").get(AuthenticateToken, tryCatch(async (req: Request, res: Response): Promise<any> => {

    if (!req.user) {
        return res
            .status(400)
            .json({ success: true, message: "Auth user not found" });
    }




    res
        .status(200)
        .json({ success: true, message: "Authorized Access", data: req.user});
}));

/* DELETE /oauth/account - Delete the authenticated user's account */
router.delete("/account", AuthenticateToken, tryCatch(async (req: Request, res: Response): Promise<any> => {
    if (!req.user) {
        return res.status(400).json({ 
            success: false, 
            message: "User not found" 
        });
    }

    const user = req.user as any;
    const userEmail = user.email;

    if (!userEmail) {
        return res.status(400).json({ 
            success: false, 
            message: "User email not found" 
        });
    }

    try {
        // Delete all favorites associated with this user
        await Favorite.deleteMany({ user_id: userEmail });

        // Delete the account
        const deletedAccount = await Account.findOneAndDelete({ email: userEmail });

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
    } catch (error: any) {
        console.error("Error deleting account:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
}));





export default router;





