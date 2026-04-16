import { NextFunction, Request, Response } from "express";
import { Account } from "../database/schemas";
import jwt from 'jsonwebtoken'


export const AuthenticateToken = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    if (!req.headers.authorization) {
        res.status(401).json({ success: false, error: "No authorization header provided" });
        return;
    }

    const [scheme, token] = req.headers.authorization.split(" ");

    if (scheme !== "Bearer") {
        res.status(401).json({ success: false, error: "Invalid token format" });
        return;
    }

    if (!token || token === "null") {
        res.status(401).json({ success: false, error: "Null token provided" });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        next(new Error("JWT_SECRET is not defined"));
        return;
    }

    try {
        const decoded: any = jwt.verify(token, jwtSecret);

        const account = await Account.findOne({
            email: decoded.email,
            password: decoded.password, // consider replacing with _id
        }).select("-password -settings -contacts").lean();

        if (!account) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }

        req.user = account;
        next();
    } catch (error) {
        res.status(500).json({ success: false, error: "Authentication Error" });
    }
};
export const AuthenticateTokenOAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).json({success: false, error: 'No authorization header provided' });
    return;
  }

  if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
    res.status(401).json({success: false, error: 'Invalid token format' });
    return;
  }

  if (req.headers.authorization.split(' ')[1] === 'null') {
    res.status(401).json({success: false, error: 'Null token provided' });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    next(new Error('JWT_SECRET is not defined'));
    return;
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);

    const account = await Account.findOne({
      email: decoded.email,
      password: decoded.password, // Consider revising to use _id
    }).select('-password -settings -contacts').lean()

    if (!account) {
      res.status(401).json({success: false, error: 'Invalid credentials' });
      return;
    }

    req.user = account; // Attach plain object to req.user
    next();
  } catch (error) {
    res.status(500).json({success: false, error: 'Authentication Error' })
  }
};

export function signToken(email: string, password: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { email: email.toLowerCase(), password: password },
    jwtSecret,  // Ensuring jwtSecret is always a string
    /* { expiresIn: "12h" } */
  );
}
export function signTokenOAuth(email: string, id: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { email: email.toLowerCase(), password: id },
    jwtSecret,  // Ensuring jwtSecret is always a string
    /* { expiresIn: "12h" } */
  );
}


