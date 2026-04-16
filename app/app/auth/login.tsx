import React, { useContext, useState, useEffect } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Page from '@/components/templates/Page'
import ButtonIcon from '@/components/atoms/buttons/ButtonIcon'

import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Input from '@/components/atoms/inputs/Input'
import Header from '@/components/templates/Header'
import InputHidden from "@/components/atoms/inputs/InputHidden";
import { loginProps } from "@/types/auth";
import Toast from "react-native-toast-message";
import { AuthContext } from "@/context/AuthContext";
import { logScreenView, logEvent, AnalyticsEvents, setUserId } from '@/services/analytics';



const Login = () => {
    const { sessionLogin, userData } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [formData, setFormData] = useState<loginProps>({
        email: '',
        password: ''
    })

    useEffect(() => {
        logScreenView('Login');
    }, []);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Inserire email e password'
            })
            return
        }

        if (isLoading) return
        setIsLoading(true)

        const call = await sessionLogin(
            formData.email,
            formData.password,
        )

        setIsLoading(false)
        if (call) {
            // Log login event
            logEvent(AnalyticsEvents.LOGIN, {
                method: 'email',
            });
            router.push('/(tabs)')
        }
    }



    const handleGoBack = () => {
        router.replace('/(tabs)');
    };

    return (
        <Page noPaddingTop alignItems='center' justifyContent='space-between' >

            <Header buttonBack onBackPress={handleGoBack} />
            <View style={{
                flex: 1,
                height: '100%',
                width: '100%',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                {/* Top Part */}
                <View style={{ 
                    width: '100%', 
                    height: '50%', 
                    position: 'relative' }}>

                    <Image

                        source={require('@/assets/pictures/landing.jpeg')}
                        style={styles.landingImage}
                    />
                    <LinearGradient
                        colors={["#ffffff", "#ffffff00"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={{ width: '100%', height: 300, position: 'absolute', bottom: 0, left: 0 }}
                    />

                   {false && <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%', position: 'absolute', left: 0, bottom: -40 }}>
                        {/* <Text style={{ fontSize: 40, color: '#00000070', fontWeight: 600, transform: [{translateY: -6}], fontFamily: 'Montserrat' }}>Family Trip</Text>*/}
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={{
                                width: 120,
                                height: 120,
                            }}
                        />
                    </View>}
                </View>

                {/* Bottom Part */}
                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 30, height: '50%' }}>


                    <View style={{ width: '100%', alignItems: 'center', paddingTop: 50, gap: 10 }}>

                        <Input
                            value={formData.email}
                            onChangeText={(value: string) => {
                                setFormData({
                                    ...formData,
                                    email: value.toLowerCase(),
                                })
                            }}
                            placeholder='Email'
                            style={{ width: '90%', backgroundColor: 'white' }}
                        />
                        <InputHidden
                            value={formData.password}
                            onChangeText={(value: string) => {
                                setFormData({
                                    ...formData,
                                    password: value
                                })
                            }}
                            placeholder='Password'
                            style={{ width: '90%', backgroundColor: 'white', marginBottom: 40 }}
                        />

                        <ButtonIcon
                            text='Accedi'
                            onPress={handleLogin}
                            isLoading={isLoading}
                            style={{ width: '90%', backgroundColor: 'white' }}
                            styleText={{ fontSize: 15, color: 'black', fontWeight: '600' }}
                        />

                        <TouchableOpacity
                            style={{ marginTop: 10, width: '90%', alignItems: 'center' }}
                            onPress={() => {
                                router.push('/auth/register')
                            }}
                        >
                            <Text style={{ fontFamily: 'Montserrat' }}>Crea un account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 10, width: '90%', alignItems: 'center' }}
                            onPress={() => {
                                router.push('/auth/forgot-password')
                            }}
                        >
                            <Text style={{ fontFamily: 'Montserrat', color: '#666', fontSize: 14 }}>Recupera password</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 15, width: '90%', alignItems: 'center', paddingVertical: 10 }}
                            onPress={handleGoBack}
                        >
                            <Text style={{ fontFamily: 'Montserrat', color: '#666', fontSize: 14 }}>Continua senza login</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>




        </Page>
    )
}

export default Login

const styles = StyleSheet.create({
    landingImage: {

        height: '100%',
        width: '100%',
        objectFit: 'contain'
    }
})