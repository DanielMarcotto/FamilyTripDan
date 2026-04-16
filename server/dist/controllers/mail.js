"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const tslib_1 = require("tslib");
const nodemailer_1 = tslib_1.__importDefault(require("nodemailer"));
const senderName = "FamilyTrip";
const senderEmail = process.env.NODEMAILER_SENDER_EMAIL;
const linkPlatform = "https://dashboard.tobefixed.co";
const logoPlatform = 'https://familytrip.s3.us-east-1.amazonaws.com/';
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_SENDER_EMAIL,
        pass: process.env.NODEMAILER_SENDER_PASSWORD,
    },
});
function sendVerificationEmail(token, email) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // send mail with defined transport object
        const info = yield transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: `${email}`,
            subject: `${senderName} - ${token} - Codice di attivazione`, // Subject line
            html: `
            <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email di Invito</title>
        <style>
            body {
                background-color: white;
                font-family: Arial, sans-serif;
                color: #333333;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .button {
                display: inline-block;
                margin: 20px auto;
                padding: 15px 25px;
                background-color: #007BFF;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999999;
                text-align: center;
            }
            .containerLogo {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .logo {
                width: 200px;
                height: 200px;
                border-radius: 10px;
                background-color: #ffffff;
                object-fit: contain;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="containerLogo">
                <img src="${logoPlatform}" class='logo'>
            </div>
            <p>Ciao,</p>

            <p>Hai richiesto un codice di verifica per accedere al tuo account <strong>${senderName}</strong>.</p>
            <p>Il tuo codice di verifica è</p>

            <div style="text-align: center;">
                <div class='button'>${token}</div>
            </div>

            <p>Per favore, inserisci questo codice nella pagina di verifica per procedere.</p>
            <p>Se non conosci questa organizzazione, ignora questa email.</p>

            <p>Cordiali saluti,</p>
            <p><strong>${senderName}</strong></p>

            <div class="footer">
                <p>Questo è un messaggio automatico, per favore non rispondere.</p>
            </div>
        </div>
    </body>
</html>
            `,
        });
        return info.messageId ? true : false;
    });
}
function sendPasswordResetEmail(newPassword, email) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // send mail with defined transport object
        const info = yield transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: `${email}`,
            subject: `${senderName} - Recupero Password`, // Subject line
            html: `
            <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recupero Password</title>
        <style>
            body {
                background-color: white;
                font-family: Arial, sans-serif;
                color: #333333;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .password-box {
                display: inline-block;
                margin: 20px auto;
                padding: 15px 25px;
                background-color: #f8f9fa;
                color: #333333;
                border: 2px solid #007BFF;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
                font-size: 18px;
                font-family: monospace;
                letter-spacing: 2px;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999999;
                text-align: center;
            }
            .containerLogo {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .logo {
                width: 200px;
                height: 200px;
                border-radius: 10px;
                background-color: #ffffff;
                object-fit: contain;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="containerLogo">
                <img src="${logoPlatform}" class='logo'>
            </div>
            <p>Ciao,</p>

            <p>Hai richiesto il recupero della password per il tuo account <strong>${senderName}</strong>.</p>
            <p>La tua nuova password è:</p>

            <div style="text-align: center;">
                <div class='password-box'>${newPassword}</div>
            </div>

            <div class="warning">
                <p><strong>Importante:</strong> Per motivi di sicurezza, ti consigliamo di cambiare questa password dopo aver effettuato l'accesso.</p>
            </div>

            <p>Puoi utilizzare questa password per accedere al tuo account.</p>
            <p>Se non hai richiesto il recupero password, ignora questa email e contatta il supporto.</p>

            <p>Cordiali saluti,</p>
            <p><strong>${senderName}</strong></p>

            <div class="footer">
                <p>Questo è un messaggio automatico, per favore non rispondere.</p>
            </div>
        </div>
    </body>
</html>
            `,
        });
        return info.messageId ? true : false;
    });
}
function dectectPlusInEmail(email) {
    // Replace all occurrences of '+' with '%2B'
    const encodedEmail = email.replace(/\+/g, "%2B");
    return encodedEmail;
}
