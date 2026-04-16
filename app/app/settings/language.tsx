import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons"

import Page from '@/components/templates/Page'
import { ScrollView } from 'react-native-gesture-handler'
import Header from '@/components/templates/Header'
import ButtonGlobal from '@/components/atoms/buttons/ButtonGlobal'
import { AuthContext } from '@/context/AuthContext'
import SelectList from '@/components/molecules/SelectList'
import { switchLanguage } from '@/i18n/i18n'
import { storage_getStoredData } from '@/utils/Storage'



const LANGAGUES = [
  {
    label: "Italiano",
    id: "it",
  },
/*  {
    label: "English",
    id: "en",
  },*/
/*   {
    label: "Español",
    id: "es",
  },
  {
    label: "Français",
    id: "fr",
  },
  {
    label: "ภาษาไทย",
    id: "th",
  },
  {
    label: " 简体中文",
    id: "zh-Hans",
  }, */

]



const Index = () => {
  const { userData } = useContext(AuthContext)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)


  const handleFetchSavedLanguage = async () => {
    const currentLanguage = await storage_getStoredData('family-trip-language')
    setSelectedLanguage(currentLanguage ?? 'it')
  }

  const handleSelectLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    switchLanguage(languageCode)

    //TODO also save in the backend
  }


  useEffect(() => {
    handleFetchSavedLanguage()
  }, [])

  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between' >
      <Header buttonBack text=' ' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {
          selectedLanguage &&
          <SelectList options={LANGAGUES} onChange={(value) => { handleSelectLanguage(value) }} value={selectedLanguage} />
        }
      </ScrollView>
    </Page>
  )
}


const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 100
  }
})

export default Index

