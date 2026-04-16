import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from './Navbar';

interface PageProps {
  children: React.ReactNode
  style?: any
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around'
  page?: 'home' | 'fridge' | 'settings'
  noPaddingTop?: boolean,
  noBottomBar?: boolean
}
const Page = ({ children, style, alignItems, justifyContent, noPaddingTop, noBottomBar, page }: PageProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.component}>
      {/* Wrap everything in a View to position elements properly */}
      <View style={styles.absoluteFill} pointerEvents='none'>
        <LinearGradient
          style={styles.gradient}
          colors={["#fff", "#fff"]}
          start={{ x: -0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
      {/* Use TouchableWithoutFeedback to dismiss keyboard on touch */}

      <KeyboardAvoidingView
        style={[styles.container, style, { paddingTop: noPaddingTop ? 0 : insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0} // adjust depending on your header height
      >
        <View style={[styles.children, { alignItems, justifyContent }]}>
          {children}
        </View>
      </KeyboardAvoidingView>

      {/* {
        page &&
        !noBottomBar &&
        <Navbar page={page} />
      } */}
    </View>
  );
};

const styles = StyleSheet.create({
  component: {
    flex: 1, // Ensure it takes full space,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject, // Ensures it covers the whole screen
    zIndex: -1, // Ensures it stays behind other elements
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make sure it does not override the gradient
  },
  gradient: {
    flex: 1, // Take full space
  },
  children: {
    flex: 1,
    height: 'auto',
    width: '100%',
    display: 'flex',
  }
});

export default Page;