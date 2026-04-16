import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useRouter } from 'expo-router'
import Chevron from '../atoms/icons/Chevron'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { triggerImpactMediumHaptic } from '@/utils/Haptics'


interface HeaderProps {
    burgerMenu?: boolean
    buttonWrite?: boolean
    buttonBack?: boolean
    onBackPress?: () => void
    text?: string
}


const Header = ({ buttonBack, text, burgerMenu, buttonWrite, onBackPress }: HeaderProps) => {
    const router = useRouter()
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (buttonBack) {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                style={styles.gradient}
                colors={["#FFFFFF00", "#FFF"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0.5 }}
            />

            {
                buttonBack &&
                <TouchableOpacity style={[styles.button, { transform: [{ translateY: 32 }, { translateX: -10 }, {rotate: '180deg'}] }]} onPress={handleBackPress}>
                    <Chevron />
                </TouchableOpacity>
            }
            {
                burgerMenu &&
                <TouchableOpacity style={[styles.button, { transform: [{ translateY: 32 }, { translateX: -10 }] }]} onPress={() => {
                    if (burgerMenu) {
                        navigation.openDrawer()
                    }
                }}>
                    <Ionicons name="menu" size={25} />
                </TouchableOpacity>
            }
            {
                text
                    ?
                    <Text style={styles.title}>{text}</Text>
                    :
                    <Text> </Text>
            }

        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1000,
        height: 80,
    },
    image: {
        height: 26,
        objectFit: 'contain',
        marginBottom: 10
    },
    button: {
        position: 'absolute',
        width: 50,
        paddingVertical: 10,
        left: 10,
        transform: [{ rotate: '180deg' }, { translateY: -20 }], // <-- FIXED HERE
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
    },
    button2: {
        position: 'absolute',
        width: 50,
        paddingVertical: 10,
        right: 10,
        transform: [{ rotate: '180deg' }, { translateY: -20 }], // <-- FIXED HERE
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        color: 'black',
        fontWeight: '700',
        transform: [{ translateY: 20 }], // <-- FIXED HERE
    },


    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: "100%"
    }
})