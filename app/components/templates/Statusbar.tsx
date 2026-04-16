import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import type { StatusBarProps as ExpoStatusBarProps } from 'expo-status-bar';

// Define custom props to align with your needs
interface StatusBarProps extends Omit<ExpoStatusBarProps, 'style'> {
  style?: 'light' | 'dark' | 'auto'; // Custom style prop
  backgroundColor?: string; // Background color for Android
}

/**
 * A component that configures the status bar using expo-status-bar, forcing a dark theme with light content.
 */
export function StatusBarExpo({
  style = 'light', // Default to light-content for dark status bar
  backgroundColor = '#000000', // Default to black
  ...props
}: StatusBarProps) {
  // Map custom style to Expo's status bar style
  const barStyle = style === 'auto' ? 'auto' : style === 'light' ? 'light' : 'dark';

  return <ExpoStatusBar style={barStyle} backgroundColor={backgroundColor} {...props} />;
}