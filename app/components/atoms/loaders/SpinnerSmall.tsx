import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const SpinnerLoaderSmall = () => {

  return (
    <View style={styles.viewport}>
      <LottieView 
        source={require('@/assets/animations/spinner.json')}
        style={{ height: 100, aspectRatio: 1}}
        speed={1.5}
        autoPlay
        loop
        />
    </View>
  )
}

export default SpinnerLoaderSmall


const styles = StyleSheet.create({
  viewport: {
    
    zIndex: 100,
    width: 50,
    height: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    },

})