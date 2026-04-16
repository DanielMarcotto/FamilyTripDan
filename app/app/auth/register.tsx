import React, { useState, useEffect } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native'

import Page from '@/components/templates/Page'
import ButtonIcon from '@/components/atoms/buttons/ButtonIcon'

import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Input from '@/components/atoms/inputs/Input'
import Header from '@/components/templates/Header'
import { register } from "@/services/api";
import { registerProps } from "@/types/auth";
import InputHidden from "@/components/atoms/inputs/InputHidden";
import Toast from "react-native-toast-message";
import { logScreenView, logEvent, AnalyticsEvents } from '@/services/analytics';


const Login = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<registerProps>({
        email: '',
        password: '',
        name: '',
        surname: ''
    })
    const [confirmPassword, setConfirmPassword] = useState('')
    const [acceptPrivacy, setAcceptPrivacy] = useState(false)
    
    // Controllo password in tempo reale
    const passwordsMatch = formData.password === confirmPassword && confirmPassword.length > 0
    const showPasswordError = confirmPassword.length > 0 && formData.password !== confirmPassword

    useEffect(() => {
        logScreenView('Register');
    }, []);

    const handleRegister = async () => {

        if (isLoading) return

        if (!formData.email || !formData.password || !formData.name || !formData.surname || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Completare tutti i campi'
            })
            return
        }

        if (formData.password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Le password non corrispondono'
            })
            return
        }

        if (!acceptPrivacy) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'È necessario accettare l\'informativa sulla privacy'
            })
            return
        }

        const trimmedName = formData.name.trim();
        const trimmedSurname = formData.surname.trim();

        const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
        
        if (!NAME_REGEX.test(trimmedName)) {
            Toast.show({
                type: 'error',
                text1: 'Nome non valido',
                text2: 'Il nome può contenere solo lettere, spazi, apostrofi e trattini.',
            });
            return;
        }

        if (!NAME_REGEX.test(trimmedSurname)) {
            Toast.show({
                type: 'error',
                text1: 'Cognome non valido',
                text2: 'Il cognome può contenere solo lettere, spazi, apostrofi e trattini.',
            });
            return;
        }




        const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        if (emailLike.test(trimmedName) || emailLike.test(trimmedSurname)) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Non inserire un indirizzo email nel nome o cognome.',
            });
            return;
        }

        setIsLoading(true)

        const call = await register(
            formData.email,
            formData.password,
            formData.name,
            formData.surname,
        )

        setIsLoading(false)


        if (!call.success) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Registrazione fallita'
            })
            return
        }


        // Log signup event
        logEvent(AnalyticsEvents.SIGNUP, {
            method: 'email',
        });

        Toast.show({
            type: 'success',
            text1: 'Benvenuto!',
            text2: 'Account creato con successo'
        })
        router.push('/auth/login')
    }


    const screenHeight = Dimensions.get('window').height;
    const isSmallScreen = screenHeight < 700;

    return (
        <Page noPaddingTop alignItems='center' justifyContent='flex-start' >

            <Header buttonBack />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Top Part - Image Section */}
                <View style={[styles.imageContainer, isSmallScreen && styles.imageContainerSmall]}>
                    <Image
                        source={require('@/assets/pictures/landing.jpeg')}
                        style={styles.landingImage}
                    />
                    <LinearGradient
                        colors={["#ffffff", "#ffffff00"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientOverlay}
                    />
                </View>

                {/* Bottom Part - Form Section */}
                <View style={styles.formContainer}>
                    <View style={styles.formContent}>
                        <Input
                            value={formData.email}
                            onChangeText={(value: string) => {
                                setFormData({
                                    ...formData,
                                    email: value.toLowerCase()
                                })
                            }}
                            placeholder='Email'
                            style={styles.input}
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
                            style={styles.input}
                        />
                        <View style={styles.passwordContainer}>
                            <InputHidden
                                value={confirmPassword}
                                onChangeText={(value: string) => {
                                    setConfirmPassword(value)
                                }}
                                placeholder='Conferma Password'
                                style={[
                                    styles.input,
                                    showPasswordError && styles.inputError,
                                    passwordsMatch && !showPasswordError && styles.inputSuccess
                                ]}
                            />
                            {showPasswordError && (
                                <View style={styles.passwordMessage}>
                                    <Ionicons name="close-circle" size={16} color="#ff4444" />
                                    <Text style={styles.passwordErrorText}>
                                        Le password non corrispondono
                                    </Text>
                                </View>
                            )}
                            {passwordsMatch && !showPasswordError && (
                                <View style={styles.passwordMessage}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                    <Text style={styles.passwordSuccessText}>
                                        Le password corrispondono
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Input
                            value={formData.name}
                            onChangeText={(value: string) => {
                                setFormData({
                                    ...formData,
                                    name: value
                                })
                            }}
                            placeholder='Nome'
                            style={styles.input}
                        />
                        <Input
                            value={formData.surname}
                            onChangeText={(value: string) => {
                                setFormData({
                                    ...formData,
                                    surname: value
                                })
                            }}
                            placeholder='Cognome'
                            style={styles.input}
                        />

                        <View style={styles.privacyContainer}>
                            <TouchableOpacity
                                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                                style={styles.privacyCheckbox}
                            >
                                <Ionicons
                                    name={acceptPrivacy ? "checkbox" : "checkbox-outline"}
                                    size={24}
                                    color={acceptPrivacy ? "#FF7A00" : "#666"}
                                />
                                <Text style={styles.privacyText}>
                                    Accetto l&apos;informativa sulla privacy
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/settings/policy')}
                                style={styles.privacyLink}
                            >
                                <Text style={styles.privacyLinkText}>
                                    (Leggi)
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ButtonIcon
                            icon={<Ionicons name="person-outline" size={20} />}
                            text='Crea Account'
                            isLoading={isLoading}
                            onPress={acceptPrivacy && passwordsMatch ? handleRegister : undefined}
                            style={[
                                styles.submitButton,
                                { opacity: (acceptPrivacy && passwordsMatch) ? 1 : 0.5 }
                            ]}
                            styleText={{ fontSize: 15, color: 'black', fontWeight: '600' }}
                        />
                    </View>
                </View>
            </ScrollView>

        </Page>
    )
}

export default Login

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        width: '100%',
    },
    imageContainer: {
        width: '100%',
        height: 350,
        position: 'relative',
        marginBottom: 20,
    },
    imageContainerSmall: {
        height: 200,
        marginBottom: 10,
    },
    landingImage: {
        height: '100%',
        width: '100%',
        objectFit: 'contain'
    },
    gradientOverlay: {
        width: '100%',
        height: 280,
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    formContainer: {
        width: '100%',
        flex: 1,
        paddingBottom: 30,
    },
    formContent: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
        gap: 12,
        paddingHorizontal: '5%',
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
    },
    passwordContainer: {
        width: '100%',
    },
    inputError: {
        borderColor: '#ff4444',
        borderWidth: 2,
    },
    inputSuccess: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    passwordMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginLeft: 5,
    },
    passwordErrorText: {
        marginLeft: 5,
        color: '#ff4444',
        fontSize: 12,
        fontFamily: 'Montserrat',
    },
    passwordSuccessText: {
        marginLeft: 5,
        color: '#4CAF50',
        fontSize: 12,
        fontFamily: 'Montserrat',
    },
    privacyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    privacyCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: '70%',
    },
    privacyText: {
        marginLeft: 10,
        fontFamily: 'Montserrat',
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    privacyLink: {
        marginLeft: 5,
    },
    privacyLinkText: {
        fontFamily: 'Montserrat',
        fontSize: 14,
        color: '#FF7A00',
        textDecorationLine: 'underline',
    },
    submitButton: {
        width: '100%',
        backgroundColor: 'white',
        marginTop: 10,
        marginBottom: 20,
    },
})