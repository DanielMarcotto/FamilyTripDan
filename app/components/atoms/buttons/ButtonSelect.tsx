import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Chevron from '../icons/Chevron';
import { Ionicons } from '@expo/vector-icons';

interface ButtonMenuProps {
    text: string;
    isSelected: boolean
    icon?: React.ReactNode;
    onPress?: () => void;

    iconStyle?: {
        backgroundColor?: string,
        borderColor?: string
    },
    borderBottomStyle?:{
        borderBottomWidth?: number,
        borderColor?: string
    }
}

const ButtonSelect = ({ text, icon, onPress, iconStyle, borderBottomStyle, isSelected }: ButtonMenuProps) => {
    return (
        <TouchableOpacity style={[styles.container, {borderBottomWidth: borderBottomStyle?.borderBottomWidth ?? 0, borderColor: borderBottomStyle?.borderColor ?? "transparent" }]} onPress={onPress}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                {
                    icon &&
                    <View style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: iconStyle?.backgroundColor ?? "#00000020", borderColor: iconStyle?.borderColor ?? "#00000015", borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                        {
                            icon
                        }
                    </View>
                }
                <Text style={[styles.text]}>{text}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
                {
                    isSelected &&
                    
                        <Ionicons name="checkmark-outline" size={18} />
                    
                }
            </View>
        </TouchableOpacity>
    )
}

export default ButtonSelect

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 60,


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