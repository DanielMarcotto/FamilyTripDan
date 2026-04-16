import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SpinnerLoaderSmall from "@/components/atoms/loaders/SpinnerSmall";

interface ButtonGlobalProps {
    text: string;
    onPress?: () => void;
    style?: object;
    styleText?: object;
    icon?: any;
    isLoading?: boolean;
}

const ButtonIcon = ({ text, onPress, style,styleText, icon, isLoading }: ButtonGlobalProps) => {
    return (
        <Pressable
            onPress={()=>{
                !isLoading &&
                onPress &&
                onPress()
            }}
            style={[
                styles.container,
                style,
            ]}
        >
            {
                !isLoading &&
                <>
                    {
                        icon &&
                        <View style={{ position: 'absolute', left: 15 }}>
                            {icon}
                        </View>
                    }
                    <Text style={[styleText, {  color: 'black', textAlign: 'center', transform: [{translateX: icon ? 8 : 0}] }]}>{text}</Text>
                </>
            }

            {
                isLoading &&
                <SpinnerLoaderSmall/>
            }


        </Pressable>

    )
}

export default ButtonIcon

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#00000020',
        width: '100%',
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    }


})        