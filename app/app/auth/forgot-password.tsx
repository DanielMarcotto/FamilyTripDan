import React, { useState, useEffect } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Page from '@/components/templates/Page'
import ButtonIcon from '@/components/atoms/buttons/ButtonIcon'

import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Input from '@/components/atoms/inputs/Input'
import Header from '@/components/templates/Header'
import { forgotPassword } from "@/services/api";
import Toast from "react-native-toast-message";
import { logScreenView } from '@/services/analytics';


const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')

    useEffect(() => {
        logScreenView('ForgotPassword');
    }, []);

    const handleForgotPassword = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Inserire l\'email'
            })
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Inserire un\'email valida'
            })
            return
        }

        if (isLoading) return
        setIsLoading(true)

        const call = await forgotPassword(email.toLowerCase())

        setIsLoading(false)
        
        if (call.success) {
            Toast.show({
                type: 'success',
                text1: 'Email inviata',
                text2: 'Se l\'email esiste, riceverai una nuova password via email'
            })
            router.back()
        } else {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: call.error || 'Errore durante il recupero password'
            })
        }
    }

    const handleGoBack = () => {
        router.back();
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
                </View>

                {/* Bottom Part */}
                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'column', paddingBottom: 30, height: '50%' }}>
                    <View style={{ width: '100%', alignItems: 'center', paddingTop: 50, gap: 10 }}>
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 20, fontWeight: '600', marginBottom: 10, textAlign: 'center', paddingHorizontal: 20 }}>
                            Recupera Password
                        </Text>
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 }}>
                            Inserisci la tua email e riceverai una nuova password
                        </Text>

                        <Input
                            value={email}
                            onChangeText={(value: string) => {
                                setEmail(value.toLowerCase())
                            }}
                            placeholder='Email'
                            style={{ width: '90%', backgroundColor: 'white' }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <ButtonIcon
                            text='Invia'
                            onPress={handleForgotPassword}
                            isLoading={isLoading}
                            style={{ width: '90%', backgroundColor: 'white', marginTop: 20 }}
                            styleText={{ fontSize: 15, color: 'black', fontWeight: '600' }}
                        />
                    </View>
                </View>
            </View>
        </Page>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    landingImage: {
        height: '100%',
        width: '100%',
        objectFit: 'contain'
    }
})

