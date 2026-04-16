#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// npm scripts run from the package.json directory (app/), so app.json is in the current working directory
const appJsonPath = path.join(process.cwd(), 'app.json');

// Leggi app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Incrementa la versione (patch)
const versionParts = appJson.expo.version.split('.');
versionParts[2] = String(parseInt(versionParts[2]) + 1);
appJson.expo.version = versionParts.join('.');

// Incrementa iOS buildNumber
if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
  const buildParts = appJson.expo.ios.buildNumber.split('.');
  const lastPart = parseInt(buildParts[buildParts.length - 1]);
  buildParts[buildParts.length - 1] = String(lastPart + 1);
  appJson.expo.ios.buildNumber = buildParts.join('.');
} else {
  // Se non esiste, crea un buildNumber basato sulla data
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  appJson.expo.ios.buildNumber = `${year}.${month}.${day}.1`;
}

// Incrementa Android versionCode
if (appJson.expo.android && appJson.expo.android.versionCode) {
  appJson.expo.android.versionCode = appJson.expo.android.versionCode + 1;
} else {
  // Se non esiste, crea un versionCode basato sulla versione
  // Formato: MMMmmppp (Major Minor Patch)
  const [major, minor, patch] = versionParts.map(Number);
  appJson.expo.android.versionCode = major * 10000 + minor * 100 + patch;
}

// Scrivi il file aggiornato
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Versione aggiornata:`);
console.log(`   Version: ${appJson.expo.version}`);
if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
  console.log(`   iOS Build Number: ${appJson.expo.ios.buildNumber}`);
}
if (appJson.expo.android && appJson.expo.android.versionCode) {
  console.log(`   Android Version Code: ${appJson.expo.android.versionCode}`);
}
