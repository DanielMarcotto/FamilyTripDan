const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin per aggiungere il fix per React Native Firebase nel Podfile
 * Questo plugin aggiunge un hook post_install che applica CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES
 * solo ai target RNFB per risolvere gli errori con gli header non modulari
 */
const withRNFBPodfileFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        
        // Verifica se il fix è già presente
        if (podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
          return config;
        }
        
        // Trova il blocco post_install esistente
        const postInstallRegex = /(post_install do \|installer\|[\s\S]*?react_native_post_install\([\s\S]*?\)[\s\S]*?)(end)/;
        
        if (postInstallRegex.test(podfileContent)) {
          // Aggiungi il fix dopo react_native_post_install
          podfileContent = podfileContent.replace(
            postInstallRegex,
            `$1
    
    # Fix for React Native Firebase non-modular header errors
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end
$2`
          );
          
          fs.writeFileSync(podfilePath, podfileContent, 'utf8');
          console.log('✅ Added React Native Firebase Podfile fix');
        } else {
          console.warn('⚠️  Could not find post_install hook in Podfile');
        }
      }
      
      return config;
    },
  ]);
};

module.exports = withRNFBPodfileFix;
