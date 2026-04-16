import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View } from 'react-native'


const ScreenSpinnerLoader = () => {

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <LottieView
          source={require('@/assets/animations/food.json')}
          style={{ height: 80, aspectRatio: 3 }}
          speed={3.5}
          autoPlay
          loop
        />
      </View>
    </View>

  )
}

export default ScreenSpinnerLoader


const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100000,
    backgroundColor: "#00000080"
  },
  viewport: {
    zIndex: 100,
    width: 150,
    height: 150,
    borderRadius: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white"
  },

})