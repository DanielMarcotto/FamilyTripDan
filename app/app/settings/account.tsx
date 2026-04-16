import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons"
import { router } from 'expo-router'

import Page from '@/components/templates/Page'
import { ScrollView } from 'react-native-gesture-handler'
import Header from '@/components/templates/Header'
import ButtonGlobal from '@/components/atoms/buttons/ButtonGlobal'
import { AuthContext } from '@/context/AuthContext'
import { deleteAccount, removeToken } from '@/services/api'
import Toast from 'react-native-toast-message'
import i18n from '@/i18n/i18n'

interface UserProfile {
  name: string
  surname: string
  username: string
  timezone: string
  email: string
  joinDate: string
  profileImage?: string
}

const timezones = [
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Greenwich Mean Time (GMT)", value: "Europe/London" },
  { label: "Central European Time (CET)", value: "Europe/Paris" },
  { label: "Japan Standard Time (JST)", value: "Asia/Tokyo" },
  { label: "Australian Eastern Time (AET)", value: "Australia/Sydney" },
]




const Index = () => {
  const { userData, logout } = useContext(AuthContext)
  const [profile, setProfile] = useState<UserProfile>({
    name: userData?.user.name ?? '',
    surname: userData?.user.surname ?? '',
    username: userData?.user.username ?? '',
    timezone: 'America/New_York',
    email: userData?.email ?? '',
    joinDate: "January 2025",
  })

  const [isEditing, setIsEditing] = useState(true)
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const handlePhotoPress = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Rotation animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0)
    })

    // Here you would implement photo upload logic
    // console.log("Photo upload triggered")
  }
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }
  const handleSave = () => {

    setHasChanges(false)
    // Here you would implement save logic
    console.log("Profile saved:", profile)
  }
  const handleCancel = () => {

    setHasChanges(false)
    // Reset to original values if needed
  }
  const getTimezoneLabel = (value: string) => {
    return timezones.find((tz) => tz.value === value)?.label || value
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      i18n.t('settings.deleteAccountTitle'),
      i18n.t('settings.deleteAccountMessage'),
      [
        {
          text: i18n.t('settings.deleteAccountCancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('settings.deleteAccountConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteAccount()
              
              if (response.success) {
                // Logout and clear token
                logout()
                await removeToken()
                
                Toast.show({
                  type: 'success',
                  text1: i18n.t('settings.deleteAccountSuccess'),
                  text2: i18n.t('settings.deleteAccountSuccessMessage'),
                })
                
                // Navigate to home
                router.replace('/(tabs)')
              } else {
                Toast.show({
                  type: 'error',
                  text1: i18n.t('settings.deleteAccountError'),
                  text2: response.message || i18n.t('settings.deleteAccountErrorMessage'),
                })
              }
            } catch (error) {
              console.error('Error deleting account:', error)
              Toast.show({
                type: 'error',
                text1: i18n.t('settings.deleteAccountError'),
                text2: i18n.t('settings.deleteAccountErrorMessage'),
              })
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  useEffect(() => {
    startPulseAnimation()
  }, [])



  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between' >
      <Header buttonBack text=' ' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {/* Name */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>

              <Text style={styles.fieldLabel}>Nome</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.name}
                onChangeText={(text) => updateProfile("name", text)}
                placeholder="Inserisci il tuo nome"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.name}</Text>
            )}
          </View>

          {/* Surname */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>

              <Text style={styles.fieldLabel}>Cognome</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.surname}
                onChangeText={(text) => updateProfile("surname", text)}
                placeholder="Inserisci il cognome"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.surname}</Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Username</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.username}
                onChangeText={(text) => updateProfile("username", text.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>@{profile.username}</Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Email</Text>
            </View>
            <Text style={styles.fieldValue}>{profile.email}</Text>
            <Text style={styles.fieldHint}>La mail non puo essere cambiata</Text>
          </View>

          {/* Timezone */}
          {/* <TouchableOpacity
            style={styles.fieldCard}
            onPress={() => isEditing && setShowTimezoneSelector(!showTimezoneSelector)}
            disabled={!isEditing}
          >
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Fuso orario</Text>
              {isEditing && (
                <Ionicons name={showTimezoneSelector ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              )}
            </View>
            <Text style={styles.fieldValue}>{getTimezoneLabel(profile.timezone)}</Text>

            {showTimezoneSelector && isEditing && (
              <View style={styles.timezoneSelector}>
                {timezones.map((timezone) => (
                  <TouchableOpacity
                    key={timezone.value}
                    style={[styles.timezoneOption, profile.timezone === timezone.value && styles.selectedTimezone]}
                    onPress={() => {
                      updateProfile("timezone", timezone.value)
                      setShowTimezoneSelector(false)
                    }}
                  >
                    <Text
                      style={[styles.timezoneText, profile.timezone === timezone.value && styles.selectedTimezoneText]}
                    >
                      {timezone.label}
                    </Text>
                    {profile.timezone === timezone.value && <Ionicons name="checkmark" size={20} color="rgba(34,197,94,0.7)" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity> */}
        </View>

        {/* Save Button */}
        {isEditing && hasChanges && (
          <View style={{ paddingHorizontal: 15, marginBottom: 30, marginTop: 20 }}>
            <ButtonGlobal
              text='Salva '
              onPress={handleSave}
              style={{
                backgroundColor: "rgba(34,197,94,0.7)"
              }}
              icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
            />
          </View>
        )}

        {/* Delete Account Section */}
        <View style={styles.deleteSection}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteHeader}>
              <Ionicons name="warning-outline" size={20} color="#F44336" />
              <Text style={styles.deleteTitle}>{i18n.t('settings.deleteAccountDangerZone')}</Text>
            </View>
            <Text style={styles.deleteDescription}>
              {i18n.t('settings.deleteAccountDescription')}
            </Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteButtonText}>{i18n.t('settings.deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>
    </Page>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 16,
    color: "rgba(34,197,94,0.7)",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    width: '100%'
  },
  photoSection: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 24,

    alignItems: "center",
    marginBottom: 0,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoWrapper: {
    position: "relative",
  },
  photoPlaceholder: {
    width: 190,
    height: 190,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    borderWidth: 4,
    borderColor: "rgba(34,197,94,0.7)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(34,197,94,0.7)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34,197,94,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  photoHint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  memberSince: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberSinceText: {
    fontSize: 12,
    color: "#666",
  },
  fieldsContainer: {
    marginTop: 120,
    paddingHorizontal: 0,
    gap: 16,
  },
  fieldCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 10
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  fieldInput: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  timezoneSelector: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 16,
  },
  timezoneOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedTimezone: {
    backgroundColor: "#f0f9f0",
  },
  timezoneText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectedTimezoneText: {
    color: "rgba(34,197,94,0.7)",
    fontWeight: "500",
  },
  saveSection: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "rgba(34,197,94,0.7)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    marginTop: 20,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dangerButton: {
    marginTop: 8,
  },
  dangerText: {
    color: "#F44336",
  },
  deleteSection: {
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  deleteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ffebee",
  },
  deleteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
  deleteDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default Index

