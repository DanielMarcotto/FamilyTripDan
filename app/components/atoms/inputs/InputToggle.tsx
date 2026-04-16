import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableWithoutFeedback, Animated } from 'react-native'

interface InputToggleProps {
    title: string
    desc?: string
    value: boolean
    onClick: () => void
}

const InputToggle = ({ title, desc, value, onClick }: InputToggleProps) => {
    // Animated value for the dot position
    const animatedDotPosition = useRef(new Animated.Value(value ? 20 : 0)).current

    // Animated value for the background color
    const animatedBackgroundColor = useRef(new Animated.Value(value ? 1 : 0)).current

    // Update the dot position animation whenever the `value` changes
    useEffect(() => {
        Animated.timing(animatedDotPosition, {
            toValue: value ? 20 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start()

        // Update the background color animation whenever the `value` changes
        Animated.timing(animatedBackgroundColor, {
            toValue: value ? 1 : 0, // Animate between 0 (inactive) and 1 (active)
            duration: 300,
            useNativeDriver: false, // Color transitions require non-native driver
        }).start()
    }, [value])

    // Interpolate the background color based on the animated value
    const backgroundColor = animatedBackgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF20', 'rgb(101,193,250)'], // Inactive color to active color
    })

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.textTitle}>{title}</Text>
                {desc && <Text style={styles.textDesc}>{desc}</Text>}
            </View>

            <TouchableWithoutFeedback onPress={() => onClick()}>
                <Animated.View
                    style={[
                        styles.dotContainer,
                        { backgroundColor }, // Apply animated background color
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                transform: [{ translateX: animatedDotPosition }],
                            },
                        ]}
                    />
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    )
}

export default InputToggle

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#00000050',
        borderRadius: 10,
        width: '100%'
    },
    textContainer: {
        width: '70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 5,
    },
    textTitle: {

        fontSize: 14,
        fontFamily: 'Bold',
        color: 'white',
    },
    textDesc: {

        fontSize: 11,
        color: '#ffffff90',
        fontFamily: 'Regular',
    },
    dotContainer: {
        width: 45,
        height: 26,
        borderRadius: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 3,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
    },
})
