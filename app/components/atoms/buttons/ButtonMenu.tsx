import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

interface ButtonMenuProps {
    text: string;
    icon: any;
    onPress: () => void;
    style?: any
    styleText?: any

    index?: number
    lenthGroup: number
}

const ButtonMenu = ({text, icon, onPress, style, styleText, index, lenthGroup}: ButtonMenuProps) => {
  return (
    <TouchableOpacity style={[styles.container, style,
      { borderTopRightRadius: index === 0 ? 10 : 0} ,
      {  borderTopLeftRadius: index === 0 ? 10 : 0},
      {  borderBottomRightRadius: index === lenthGroup ? 10 : 0},
      {  borderBottomLeftRadius: index === lenthGroup ? 10 : 0},
      { borderBottomWidth: index === lenthGroup ? 1 : 0}
      
    ]} onPress={onPress}>
      <Text style={[styles.text, styleText]}>{text}</Text>

      {
        icon
      }
    </TouchableOpacity>
  )
}

export default ButtonMenu

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: '#00000030',

        paddingHorizontal: 15,
        

        backgroundColor: 'white',
        height: 60,
        width: '100%'
    },
    text: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'Medium'
    }
})