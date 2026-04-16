import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonGlobalProps {
    text: string;
    onPress?: () => void;
    style?: object;
    textStyle?: object;

    icon?: any;
    gap?: number
}

const ButtonGlobal = ({ text, onPress, style, textStyle, icon, gap }: ButtonGlobalProps) => {
    return (
        <Pressable
            onPress={
                onPress &&
                onPress

            }
            style={[
                styles.container,
                style,
                { gap: gap ? gap : 5},
            ]}
        >
            {
                icon &&
                icon
            }
            <Text style={[{ fontSize: 16, color: 'white',  textAlign: 'center' }, textStyle]}>{text}</Text>
        </Pressable>

    )
}

export default ButtonGlobal

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00000020',
        width: '100%',
        height: 60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
    }


})        