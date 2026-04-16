import { Platform, View } from "react-native";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { BlurView } from "expo-blur";

// Versione minima iOS richiesta per liquid glass (iOS 26+)
const MIN_IOS_VERSION_FOR_LIQUID_GLASS = 26;

/**
 * Verifica se la versione iOS corrente supporta liquid glass
 */
const supportsLiquidGlass = (): boolean => {
  if (Platform.OS !== "ios") {
    return false;
  }
  
  // Platform.Version su iOS restituisce una stringa come "17.0" o un numero come 17
  const iosVersion = typeof Platform.Version === "string" 
    ? parseFloat(Platform.Version) 
    : Platform.Version;
  
  return iosVersion >= MIN_IOS_VERSION_FOR_LIQUID_GLASS;
};

export const GlassWrapper = ({ style, children }: any) => {
  // Su Android manteniamo un semplice background semitrasparente
  if (Platform.OS === "android") {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
          },
        ]}
      >
        {children}
      </View>
    );
  }

  // Su iOS: usa LiquidGlassView se supportato (iOS 26+), altrimenti usa expo-blur come fallback
  if (Platform.OS === "ios" && supportsLiquidGlass()) {
    try {
      return (
        <LiquidGlassView style={style}>
          {children}
        </LiquidGlassView>
      );
    } catch (error) {
      // Se LiquidGlassView fallisce, usa expo-blur come fallback
      console.warn("LiquidGlassView non disponibile, uso expo-blur:", error);
      return (
        <BlurView intensity={40} tint="light" style={style}>
          {children}
        </BlurView>
      );
    }
  }

  // Su iOS < 26 o web: usa expo-blur come fallback retrocompatibile
  return (
    <BlurView intensity={40} tint="light" style={style}>
      {children}
    </BlurView>
  );
};
