import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function DestinationSearchInput({
  value,
  onChange,
  placeholder = 'Cerca destinazione...',
}: Props) {
  return (
    <View style={styles.container}>
      {/* Magnifying glass */}
      <Ionicons
        name="search"
        size={18}
        color="#7C7C7C"
        style={styles.iconLeft}
      />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7C7C7C"
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
      />

      {/* Clear button */}
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons
            name="close-circle"
            size={18}
            color="#9B9B9B"
            style={styles.iconRight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,

    // iOS glossy / Android material
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(255,255,255,0.55)'
        : 'rgba(240,240,240,1)',

    // subtle iOS shadow
    ...(Platform.OS === 'ios'
      ? {
          backdropFilter: 'blur(18px)', // works with expo/labs
          shadowColor: '#FF7A00',
          shadowOpacity: 0.7,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }
      : {
          elevation: 3,
        }),
  },

  iconLeft: {
    marginRight: 8,
  },

  iconRight: {
    marginLeft: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});
