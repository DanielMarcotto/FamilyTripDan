import React from 'react'
import { StyleSheet } from 'react-native'
import Svg, { G, Path } from 'react-native-svg'

interface iconProps{
    color?: string,
    size?: number
}

const FridgeIcon = ({color, size}: iconProps) => {
    return (
        <Svg width={size ?? 30} height={size ?? 30} viewBox="0 0 24 24" fill="none" stroke={color ?? '#000000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
            <Path d="M5 10h14" />
            <Path d="M15 7v6" />
        </Svg>

    )
}

export default FridgeIcon

const styles = StyleSheet.create({})
