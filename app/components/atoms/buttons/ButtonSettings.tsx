import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Chevron from '../icons/Chevron';

interface ButtonMenuProps {
  text: string;

  icon?: React.ReactNode;
  extra?: React.ReactNode;
  onPress?: () => void;

  noChevron?: boolean;


  iconStyle?: {
    backgroundColor?: string,
    borderColor?: string
  }
}

const ButtonSettings = ({ text, icon, onPress, extra, noChevron, iconStyle }: ButtonMenuProps) => {
  return (
    <TouchableOpacity style={[styles.container]} onPress={onPress}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: iconStyle?.backgroundColor ?? "#FF7A0030", borderColor: iconStyle?.borderColor ?? "#00000015", borderWidth: 0.5, alignItems: 'center', justifyContent: 'center'}}>
          {
            icon
          }
        </View>
        <Text style={[styles.text]}>{text}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {
          extra
        }
        {
          !noChevron &&
          < Chevron />
        }
      </View>
    </TouchableOpacity>
  )
}

export default ButtonSettings

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,


    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'


  },
  text: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Medium'
  }
})