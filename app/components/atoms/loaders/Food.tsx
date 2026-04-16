import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const FoodLoader = () => {

  return (
    <View style={styles.viewport}>
      <LottieView 
        source={require('@/assets/animations/food.json')}
        style={{ height: 150, aspectRatio: 1}}
        speed={4}
        autoPlay
        loop
        />
    </View>
  )
}

export default FoodLoader


const styles = StyleSheet.create({
  viewport: {

    zIndex: 100,
    width: 100,
    height: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    },

})