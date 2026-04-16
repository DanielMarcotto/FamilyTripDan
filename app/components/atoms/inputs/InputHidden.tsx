import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import {Ionicons} from "@expo/vector-icons";


const InputHidden = (props: {label?: string, placeholder: string, onChangeText: any, value: string, icon?: any, style: any}) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    

    const handlePress = () => {
        setIsPasswordVisible(!isPasswordVisible);
    }
    

    return (
        <View style={[styles.inputPasswordAll, props.style]}>
            {
                props.label &&
                <Text style={styles.inputLabelPassword}>{props.label}</Text>
            }
            <View style={[styles.inputContainer, {borderWidth: isFocused ? 0.5 : 0}, {paddingHorizontal: isFocused ? 9.5 : 10}, {borderColor: isFocused ? '#00000030' : ''}]}>
                <TextInput
                style={styles.inputPassword}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
                secureTextEntry={!isPasswordVisible}
                value={props.value}
                focusable
                onFocus={() => {setIsFocused(true)}}
                onBlur={() => {setIsFocused(false)}}
                placeholderTextColor={'#00000030'}
                />
                <TouchableWithoutFeedback onPress={handlePress}>
                    {isPasswordVisible ?
                        <Ionicons name='eye-off' size={17} color='#00000050'/> :
                        <Ionicons name='eye' size={17} color='#00000050'/>
                    }
                </TouchableWithoutFeedback>
            </View>
        </View>
    );

}

export default InputHidden


const styles = StyleSheet.create({
    inputLabelPassword: {
        height: 25,
        color: '#000000',
        fontSize: 15,
        fontFamily: 'Poppins',
    },
    inputEmail:{
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    inputContainer: {
        height: 50,
        width: "100%",


        color: '#000000',
        borderColor: '#ffffff80',
        paddingLeft: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        
        backgroundColor: '#00000010',
        borderRadius: 15,
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
    inputPassword: {
        height: '100%',
        width: '80%',

        padding: 10,
        fontSize: 15,
        color: '#000000',

        borderColor: '#000000',
        borderRadius: 30,
        shadowColor: '#000000',
        fontFamily: 'Poppins',
        
    },
    inputPasswordAll: {
        
    },
})