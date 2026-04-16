import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { forwardRef, useCallback } from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView,  BottomSheetView } from '@gorhom/bottom-sheet'




export type Ref = BottomSheetModal


const BottomSheetCustom = forwardRef<Ref, { children: React.ReactNode, scroll?: boolean }>((props, ref) => {

    const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />, [])


    const CustomHandle = () => {
        const handlePress = () => {
            if (typeof ref === 'object' && ref?.current) {
                ref.current.dismiss();
            }
        };

        return (
            <TouchableOpacity style={styles.handleContainer} onPress={handlePress}>
                <View style={styles.handleIndicator} />
            </TouchableOpacity>
        );
    };

    BottomSheetCustom.displayName = 'BottomSheetCustom';

    return (
        <BottomSheetModal
            ref={ref}
            backdropComponent={renderBackdrop}
            handleComponent={CustomHandle}
        >
            {
                !props.scroll &&
                <BottomSheetView style={styles.contentContainer}>
                    {props.children}
                    <View style={{ width: "100%", height: 30 }} />
                </BottomSheetView>
            }
            {
                props.scroll &&
                <BottomSheetScrollView>
                    {props.children}
                    <View style={{ width: "100%", height: 30 }} />
                </BottomSheetScrollView>
            }

        </BottomSheetModal>
    )
})

export default BottomSheetCustom

const styles = StyleSheet.create({

    contentContainer: {
        flex: 1,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    handleIndicator: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#ccc',
    },
})