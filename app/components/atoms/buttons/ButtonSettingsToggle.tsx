import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Platform,
  Switch,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { triggerImpactLightHaptic } from '@/utils/Haptics';

interface ButtonMenuProps {
  text: string;
  value: boolean;
  onClick: () => void;

  icon?: React.ReactNode;
  iconStyle?: {
    backgroundColor?: string;
    borderColor?: string;
  };
}

const ButtonSettingsToggle = ({ text, value, onClick, icon, iconStyle }: ButtonMenuProps) => {
  const isIOS = Platform.OS === 'ios';

  // --- ANDROID ANIMATION (your original code) ---
  const animatedDotPosition = useRef(new Animated.Value(value ? 20 : 0)).current;
  const animatedBackgroundColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (!isIOS) {
      Animated.timing(animatedDotPosition, {
        toValue: value ? 20 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(animatedBackgroundColor, {
        toValue: value ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  const backgroundColor = animatedBackgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00000020', 'rgba(34,197,94,0.7)'],
  });

  return (
    <View style={styles.container}>
      {/* Left side */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: iconStyle?.backgroundColor ?? '#FF7A0020',
              borderColor: iconStyle?.borderColor ?? '#00000015',
            },
          ]}
        >
          {icon}
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>

      {/* RIGHT SIDE — iOS LiquidGlass Toggle OR Android Custom Toggle */}
      {isIOS ? (
        <Switch
          value={value}
          onValueChange={() => {
            triggerImpactLightHaptic();
            onClick();
          }}
          trackColor={{ false: undefined, true: undefined }}
          thumbColor={undefined}
          ios_backgroundColor={undefined}
        />
      ) : (
        <TouchableWithoutFeedback
          onPress={() => {
            triggerImpactLightHaptic();
            onClick();
          }}
        >
          <Animated.View
            style={[
              styles.dotContainer,
              { backgroundColor: backgroundColor },
            ]}
          >
            <Animated.View
              style={[
                styles.dot,
                { transform: [{ translateX: animatedDotPosition }] },
              ]}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default ButtonSettingsToggle;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Medium',
  },
  iconBox: {
    height: 30,
    width: 30,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotContainer: {
    width: 45,
    height: 26,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});
