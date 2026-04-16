import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native'
import SushiIcon from '../icons/Sushi'
import AvocadoIcon from '../icons/Avocado'
import BurgerIcon from '../icons/Burger'
import NoodleIcon from '../icons/Noodles'
import EdamameIcon from '../icons/Edamame'


const { width, height } = Dimensions.get('window')

const iconSet = [SushiIcon, AvocadoIcon, BurgerIcon, NoodleIcon, EdamameIcon]

const COLS = 8
const ROWS = 6
const TOTAL_ICONS = COLS * ROWS
const ICON_SPACING_X = 800 / COLS
const ICON_SPACING_Y = height / ROWS
const SCROLL_DISTANCE = height 
const SCROLL_DURATION = 15000

const generateIconGrid = (count: number) =>
  Array.from({ length: count }, () => {
    const Icon = iconSet[Math.floor(Math.random() * iconSet.length)]
    const size = 40 + Math.floor(Math.random() * 10)
    const jitterX = (Math.random() - 0.5) * 5
    return { Icon, size, jitterX }
  })

const ScreenLoader = () => {
  const animatedY = useRef(new Animated.Value(0)).current
  const iconsA = useRef(generateIconGrid(TOTAL_ICONS)).current
  const iconsB = useRef(generateIconGrid(TOTAL_ICONS)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedY, {
        toValue: -SCROLL_DISTANCE,
        duration: SCROLL_DURATION,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start()
  }, [])

  const renderIcons = (icons: typeof iconsA, offset: number) =>
    icons.map(({ Icon, size, jitterX }, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)

      const x = col * ICON_SPACING_X + ICON_SPACING_X / 2 + jitterX - size / 2
      const y = row * ICON_SPACING_Y + ICON_SPACING_Y / 2 - size / 2 + offset

      return (
        <Animated.View
          key={`${offset}-${i}`}
          style={{
            opacity: 0.08,
            position: 'absolute',
            left: x,
            transform: [
              {
                translateY: Animated.add(animatedY, new Animated.Value(y)),
              },
              {
                rotate: '-50deg',
              },
              {
                scale: size / 45,
              }
            ],
            
          }}
        >
          <Icon/>
        </Animated.View>
      )
    })

  return (
    <View style={styles.viewport}>
      {renderIcons(iconsA, 0)}
      {renderIcons(iconsB, SCROLL_DISTANCE)}
    </View>
  )
}

export default ScreenLoader

const styles = StyleSheet.create({
  
  viewport: {
    position: 'absolute',
    top: 0,
    left: -260,

    width: '220%',
    height: '110%',
    backgroundColor: 'white',
    overflow: 'hidden',
    
    transform: [{ rotate: '45deg' }, {translateY: -40}],
  },
})
