import { View, Text, StyleSheet, Keyboard } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler';


interface InputProps {
    value: string;
    onChangeText: any;
    
    placeholder?: string;
    label?: string;
    numeric?: boolean;
    icon?: any;
    secret?: boolean;
    height?: number;
    style?: any;
    styleInput?: any;
    autocomp?: string;
}

const Input = ({label, placeholder, onChangeText, value, numeric, icon, secret,height, styleInput, style, autocomp}: InputProps) => {

    const [isFocused, setIsFocused] = React.useState(false);
    

    return ( 
        <View style={[styles.inputEmail, style]}>
            {
                label &&
                <Text style={styles.inputLabel}>{label}</Text>
            }
            <View style={[styles.inputContainer, styleInput,  {borderWidth: isFocused ? 1 : 0}, {height: height ? height : 50}, {borderColor: isFocused ? '#00000030' : ''}]}>
                {
                    icon &&
                    icon
                }
                <TextInput
                    style={[styles.input, {paddingLeft: isFocused ? 9.5 : 10}, {width: icon ? '90%' : '100%'}]}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    value={value}
                    onFocus={() => {setIsFocused(true)}}
                    onBlur={() => {
                        setIsFocused(false)
                        //Keyboard.dismiss()
                    }}
                    keyboardType={numeric ? 'numeric' : 'default'}
                    placeholderTextColor={'#00000030'}
                    focusable={true}
                    secureTextEntry={secret}
                    autoComplete='email'
                    autoCorrect={true}
                />
            </View>
        </View>
    );

}

export default Input



const styles = StyleSheet.create({
    inputLabel: {
        height: 25,
        color: '#ffffff',
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
        height: 60,
        width: "100%",


        color: '#ffffff80',
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
        color: '#000000',

        borderColor: '#000000',
        borderRadius: 30,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        fontFamily: 'Poppins',
    },
})