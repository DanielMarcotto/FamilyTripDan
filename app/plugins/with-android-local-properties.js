const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin che scrive android/local.properties con sdk.dir durante il prebuild.
 * Usa ANDROID_HOME (o ANDROID_SDK_ROOT) dall'ambiente così il build EAS local
 * trova l'SDK anche quando Gradle non eredita la variabile.
 */
const withAndroidLocalProperties = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const androidRoot = config.modRequest.platformProjectRoot;
      const localPropsPath = path.join(androidRoot, 'local.properties');

      const sdkPath =
        process.env.ANDROID_HOME ||
        process.env.ANDROID_SDK_ROOT ||
        (process.platform === 'darwin' && process.env.HOME
          ? path.join(process.env.HOME, 'Library', 'Android', 'sdk')
          : null);

      if (sdkPath && fs.existsSync(sdkPath)) {
        // local.properties usa path con forward slash (o escaped backslash su Windows)
        const sdkDir = sdkPath.replace(/\\/g, '/');
        const content = `sdk.dir=${sdkDir}\n`;
        fs.writeFileSync(localPropsPath, content, 'utf8');
        console.log('✅ android/local.properties written (sdk.dir from ANDROID_HOME)');
      } else if (sdkPath) {
        console.warn('⚠️  ANDROID_HOME set but path does not exist:', sdkPath);
      } else {
        console.warn(
          '⚠️  ANDROID_HOME not set; add it to ~/.zshrc for local Android builds. See app/ANDROID_LOCAL_BUILD.md'
        );
      }

      return config;
    },
  ]);
};

module.exports = withAndroidLocalProperties;
