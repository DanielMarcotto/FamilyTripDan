import { Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import Input from './Input'
import MagnifingGlassIcon from '../icons/MagnifingGlass'
import { AuthContext } from '@/context/AuthContext'
import formatNumberWithQuote from '@/utils/currencyFormatConverter'
import { TextInput } from 'react-native-gesture-handler'
import Banknotes from '../icons/Banknotes'


interface HeaderProps {
    type?: 'default' | 'search'
    onSearch?: (text: string) => void
}


const InputSearch = ({ type, onSearch }: HeaderProps) => {
    const [searchValue, setSearchValue] = useState('')
    const [search, setSearch] = React.useState('')

    return (
        <View style={styles.container}>
            <View style={styles.bubbleXL}>
                <TextInput
                    style={styles.input}
                    onChangeText={setSearchValue}
                    value={searchValue}
                    onFocus={() => { }}
                    onBlur={() => { Keyboard.dismiss() }}
                    keyboardType={'default'}
                    placeholderTextColor={'#ffffff90'}
                    focusable={true}
                    secureTextEntry={false}
                    //autoComplete={true}
                    autoCorrect={true}
                    placeholder='Buscar direccion o nombre parqueo' 
                />
            </View>
        </View>
    )

}

export default InputSearch

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    bubble: {
        width: '49%',
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFFFFF17',
        gap: 10,
        borderRadius: 30,
        padding: 7,

    },
    bubbleXL: {
        width: '100%',
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFFFFF17',
        gap: 10,
        borderRadius: 30,
        padding: 7,

    },

    bubbleImage: {
        width: 50,
        height: 50,
        backgroundColor: '#333842',
        borderRadius: 50,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleText: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    bubbleLabel: {
        fontSize: 12,
        fontFamily: 'Regular',
        color: '#FFFFFF90'
    },
    bubbleValue: {
        fontSize: 14,
        fontFamily: 'SemiBold',
        color: '#FFFFFF'
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
})