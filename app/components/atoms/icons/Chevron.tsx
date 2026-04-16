import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface ChevronRightProps {
    style?: object
}

const Chevron = ({style}: ChevronRightProps) => {
    return (
        <Svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke={'black'} width={20} height={20} style={style}>
            <Path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </Svg>

    )
}

export default Chevron

const styles = StyleSheet.create({})