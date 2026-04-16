import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';

interface InputProps {
  value: string;
  onChangeText: (val: Date) => void;
  placeholder?: string;
  label?: string;
  icon?: any;
  height?: number;
  style?: any;
  styleInput?: any;
}

const InputDate = ({
  label,
  placeholder,
  onChangeText,
  value,
  icon,
  height,
  style,
  styleInput,
}: InputProps) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [displayValue, setDisplayValue] = useState(value || placeholder || 'Seleziona Data');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // For iOS, only proceed if the event type is 'set' (user confirmed the date)
    // For Android, the event is only triggered on confirmation, so no additional check is needed
    if (Platform.OS === 'ios' && event.type !== 'set') {
      setShowPicker(false);
      return;
    }

    setShowPicker(false);

    if (selectedDate) {
      onChangeText(selectedDate);
      setTempDate(selectedDate);
    }
  };

  useEffect(() => {
    if (!tempDate) return;
    setDisplayValue(
      new Date(tempDate).toLocaleDateString('it-IT', { year: '2-digit', month: '2-digit', day: '2-digit' }) ||
        'Seleziona Data'
    );
  }, [tempDate]);

  useEffect(() => {
    setTempDate(value ? new Date(value) : undefined);
  }, [value]);

  return (
    <View style={[styles.inputEmail, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.inputContainer,
          styleInput,
          { height: height ?? 50 },
          { borderRadius: showPicker ? 0 : 15 },
        ]}
      >
        <Text style={[styles.dateText, { paddingLeft: icon ? 10 : 0 }]}>
          {displayValue}
        </Text>
      </Pressable>

      {showPicker && (
        <View
          style={{
            backgroundColor: '#00000060',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
        >
          <RNDateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            textColor="#FFFFFF"
            themeVariant="dark"
          />
        </View>
      )}
    </View>
  );
};

export default InputDate;

const styles = StyleSheet.create({
  inputLabel: {
    height: 25,
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Poppins',
  },
  inputEmail: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  inputContainer: {
    height: 60,
    width: '100%',
    color: '#ffffff80',
    borderColor: '#ffffff80',
    paddingLeft: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00000060',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  input: {
    height: '100%',
    width: '100%',
    padding: 10,
    fontSize: 15,
    color: '#ffffff',
    borderColor: '#000000',
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    fontFamily: 'Poppins',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Poppins',
  },
});