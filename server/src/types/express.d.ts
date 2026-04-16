import { IAccount } from "../database/schemas/_account"; // adjust path to your Account interface

declare global {
    namespace Express {
        export interface Request {
            user?: IAccount;
        }
    }
}
