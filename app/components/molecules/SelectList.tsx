import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ButtonSelect from '../atoms/buttons/ButtonSelect'
import { SelectListProps } from '@/types/common'




const SelectList = ({ onChange, options, value }: SelectListProps) => {

    const [selected, setSelected] = useState<string | null>( value || null)

    const handleSelect = (value: string) => {
        onChange(value)
        setSelected(value)
    }


    return (
        <View>
            {
                options &&
                options.map(o => <ButtonSelect key={o.id} text={o.label} isSelected={selected === o.id} onPress={() => handleSelect(o.id)} borderBottomStyle={{ borderBottomWidth: 1, borderColor: '#00000010'}} />)
            }
        </View>
    )
}

export default SelectList

const styles = StyleSheet.create({})