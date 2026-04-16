import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import Home from '../atoms/icons/Home'
import Gear from '../atoms/icons/Gear'
import FridgeIcon from '../atoms/icons/Fridge'



interface NavbarProps {
    page?: "home" | "fridge" | "settings"
}


const Navbar = ({ page }: NavbarProps) => {
    const router = useRouter()


    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => { router.replace('/home') }}
                style={[
                    styles.circle,
                ]}
            >
                <Home
                    color='#00000080'
                />
                <Text style={{ fontSize: 12, color: "#00000080" }}>Home</Text>
                {
                    page === 'home' &&
                    < View style={{ height: 5, width: 5, borderRadius: 30, backgroundColor: '#00000080', position: 'absolute', bottom: -3 }}/>
                }
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => { router.replace('/home/fridge') }}
                style={[
                    styles.circle,
                ]}
            >
                <FridgeIcon />
                <Text style={{ fontSize: 12, color: "#00000080" }}>Fridge</Text>
                {
                    page === 'fridge' &&
                    < View style={{ height: 5, width: 5, borderRadius: 30, backgroundColor: '#00000080', position: 'absolute', bottom: -3 }}/>
                }
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => { router.replace('/home/settings') }}
                style={[
                    styles.circle,
                ]}
            >
                <Gear
                    color='#00000080'
                />
                <Text style={{ fontSize: 12, color: "#00000080" }}>Settings</Text>
                {
                    page === 'settings' &&
                    < View style={{ height: 5, width: 5, borderRadius: 30, backgroundColor: '#00000080', position: 'absolute', bottom: -3 }}/>
                }
            </TouchableOpacity>
        </View>
    )
}

export default Navbar

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: [{ translateX: '-50%' }],

        width: '100%',
        height: 85,
        paddingHorizontal: 40,
        //backgroundColor: '#333842',
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#00000020",
        borderRadius: 45,
        paddingTop: 10,

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 40,

        boxShadow: '0px 0px 10 px rgba(0, 0, 0, 0.25)',
        zIndex: 1000000

    },

    circle: {
        width: 50,
        height: 50,
        borderRadius: 50,


        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})