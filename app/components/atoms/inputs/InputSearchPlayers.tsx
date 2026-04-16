import { View, Text, StyleSheet, Keyboard, Alert, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { TextInput } from 'react-native-gesture-handler';
import { searchPlayers } from '@/services/api';
import VerticalGap from '../global/VerticalGap';
import Trash from '../icons/Trash';


interface InputProps {
    value: string;
    onChangeText: any;

    mailList: string[]
    onMailChange: (selectedEmails: string[])=> void;

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

const InputSearchPlayers = ({ label, placeholder, onChangeText,onMailChange,mailList, value, numeric, icon, secret, height, styleInput, style, autocomp }: InputProps) => {

    const [isFocused, setIsFocused] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState([])
    const [selectedEmails, setSelectedEmails] = React.useState<any>([])

    const handleSearchPlayer = async (value: string) => {
        const call = await searchPlayers(value)
        if (call.success){
            setSuggestions(call.data)
        } else {
            setSuggestions([])
        }
        console.log(call)
    }
    const handleAddEmail = (email: string) => {
        if (!mailList.includes(email)){
            onMailChange([...mailList, email])
        }
    }
    const handleRemoveEmail = (email: string) => {
        onMailChange(mailList.filter((e: string) => e !== email));
    };

    useEffect(() => {
        handleSearchPlayer(value)
    }, [value])


    return (
        <>
            <View style={[styles.inputEmail, style]}>
                {
                    label &&
                    <Text style={styles.inputLabel}>{label}</Text>
                }
                <View style={[styles.inputContainer, styleInput, { borderWidth: isFocused ? 1 : 0 }, { height: suggestions.length > 0 ? 200 : 50 }]}>


                    <TextInput
                        style={[styles.input, { paddingLeft: isFocused ? 9.5 : 10 }, { width: icon ? '90%' : '100%' },
                            {borderBottomLeftRadius: suggestions.length > 0 ? 0 : 15},
                            {borderBottomRightRadius: suggestions.length > 0 ? 0 : 15},
                            {borderBottomWidth: suggestions.length > 0 ?  1 : 0},
                        ]}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        value={value}
                        onFocus={() => { setIsFocused(true) }}
                        onBlur={() => {
                            setIsFocused(false)
                            Keyboard.dismiss()
                        }}
                        keyboardType={numeric ? 'numeric' : 'default'}
                        placeholderTextColor={'#ffffff90'}
                        focusable={true}
                        secureTextEntry={secret}
                        autoComplete='email'
                        autoCorrect={true}
                    />
                    {
                        suggestions &&
                        suggestions.length > 0 &&
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.suggestionContainer, { flexDirection: 'column', paddingHorizontal: 5, height: 50 }]}>
                        {
                            suggestions &&
                            suggestions
                            .filter((suggestion: any) => {
                                //remove email present in mailList
                                return !mailList.includes(suggestion.email)
                            })
                            .map((suggestion: any, index: number) => {

                                return (
                                    <TouchableOpacity 
                                        key={suggestion.email}
                                        style={styles.optionSuggestion}
                                        onPress={()=>{
                                            handleAddEmail(suggestion.email)
                                        }}
                                    >
                                        <Text style={{color: 'white'}}>{suggestion.email}</Text>
                                        <Text style={{color: '#ffffff90', fontSize: 12}}>{suggestion.user.username}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                    }
                </View>
            </View>

            <View>
                {
                    mailList.map( (email: string) => (
                        <TouchableOpacity style={styles.deleteOption} onPress={()=>{
                            handleRemoveEmail(email)
                        }}>
                            <Text style={{color: 'white'}}>{email}</Text>
                            <Trash color='tomato'/>
                        </TouchableOpacity>
                    ))
                }
            </View>
        </>
    );

}

export default InputSearchPlayers



const styles = StyleSheet.create({
    inputLabel: {
        height: 25,
        color: '#ffffff',
        fontSize: 15,
        fontFamily: 'Poppins',
    },
    inputEmail: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    inputContainer: {
        height: 'auto',
        width: "100%",


        color: '#ffffff80',
        borderColor: '#ffffff80',
        
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',


        backgroundColor: '#00000060',
        borderRadius: 15,
    },
    suggestionContainer: {
        height: 50,
        width: "100%",


        color: '#ffffff80',
        borderColor: '#ffffff80',

        display: 'flex',
        flexDirection: 'row',
        paddingTop: 6,


        
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },
    input: {
        height: 50,
        width: '100%',

        padding: 10,
        fontSize: 15,
        color: '#ffffff',

        borderColor: '#ffffff90',
        borderRadius: 30,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        fontFamily: 'Poppins',
    },

    optionSuggestion: {
        marginBottom: 5,
        backgroundColor: '#ffffff10',
        padding: 5,
        borderRadius: 10
    },

    deleteOption: {
        marginBottom: 5,
        backgroundColor: '#ffffff10',
        padding: 10,
        borderRadius: 10,

        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})