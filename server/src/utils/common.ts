import crypto from "crypto";

export function generateRandomNumberString(length: number): string {
    if (length <= 0) return '';
    let result = '';
    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        result += digit.toString();
    }
    return result;
}

export function generateRandomAlphanumericString(length: number): string {
    if (length <= 0) return '';

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    return Array.from({ length }, () =>
        characters.charAt(Math.floor(Math.random() * charactersLength))
    ).join('');
}

export const hashPassword = (password: string) => {
    const sha256 = crypto.createHash("sha256");
    const hashedPassword = sha256.update(password).digest("hex");
    return hashedPassword;
};

export default hashPassword
