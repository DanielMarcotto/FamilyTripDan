import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import AiIcon from '../icons/aiIcon'

interface InputChatProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    placeholder?: string;
}

const InputChat = ({value, onChangeText, onSend, placeholder}: InputChatProps) => {
    const [isFocused, setIsFocused] = React.useState(false);


    const handleSendMessage =  () => {
        if (value.length == 0) return;
        onSend();
    }


  return (
    <LinearGradient style={[
        styles.container,
        {position: !isFocused ? 'absolute' : 'relative'}
    ]}
        colors={['#00000000', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.9 }}
    >
        <View style={styles.button}>
            <TextInput
                style={[styles.text]}
                onChangeText={onChangeText}
                placeholder={placeholder ? placeholder : 'Type a message...'}
                value={value}
                onFocus={() => {setIsFocused(true)}}
                onBlur={() => {setIsFocused(false)}}
                keyboardType={'default'}
                placeholderTextColor={'#ffffff60'}
                focusable={true}

            />
            <TouchableOpacity
                onPress={handleSendMessage}
            >
                <AiIcon/>
            </TouchableOpacity>
        </View>
    </LinearGradient>
  )
}

export default InputChat

const styles = StyleSheet.create({
    container: {
        
        bottom: 0,
        width: '100%',
        height: 100,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },

    button:{
        width: '100%',
        height: 60,
        borderRadius: 30,

        paddingLeft: 20,
        paddingRight: 20,

        backgroundColor: '#242224',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
    },
    text:{
        color: '#ffffff',
        height: '100%',
        width: '90%',
        fontSize: 18,
        fontFamily: 'MontserratMedium',
    }
})