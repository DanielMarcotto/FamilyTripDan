import React, { useState } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'

import Page from '@/components/templates/Page'
import Header from '@/components/templates/Header'

const PRIVACY_POLICY_URL = 'https://www.iubenda.com/privacy-policy/64085363'

const Index = () => {
  const [loading, setLoading] = useState(true)

  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between'>
      <Header buttonBack text=' ' />
      
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        )}
        <WebView
          source={{ uri: PRIVACY_POLICY_URL }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Page>
  )
}

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 100,
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
})

export default Index

