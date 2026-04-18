import admin from "firebase-admin";

const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT as string;

const serviceAccount = JSON.parse(firebaseServiceAccount);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { db };