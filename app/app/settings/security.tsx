import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons"

import Page from '@/components/templates/Page'
import { ScrollView } from 'react-native-gesture-handler'
import Header from '@/components/templates/Header'
import ButtonGlobal from '@/components/atoms/buttons/ButtonGlobal'
import { AuthContext } from '@/context/AuthContext'





const Index = () => {
  const { userData } = useContext(AuthContext)


  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between' >
      <Header buttonBack text=' ' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>


      </ScrollView>
    </Page>
  )
}


const styles = StyleSheet.create({

  scrollView: {
    flex: 1,
    width: '100%'
  },

})

export default Index

