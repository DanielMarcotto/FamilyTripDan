import React, { createContext, useState, useContext, ReactNode, useRef } from 'react';
import BottomSheetCustom from '@/components/templates/BottomSheetCustom';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Define the shape of the context
interface BottomSheetContextProps {
    handleToggleBottomSheet: (content?: ReactNode, sheetHeight?: number) => void;
    bottomSheetModalRef?: React.RefObject<BottomSheetModal | null>;
}

export const BottomSheetContext = createContext<BottomSheetContextProps>({
    handleToggleBottomSheet: () => { },
});

export const useBottomSheet = () => {
    return useContext(BottomSheetContext) as BottomSheetContextProps;
};

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
    const [sheetContent, setSheetContent] = useState<ReactNode | null>(null);


    const handleToggleBottomSheet = (content?: ReactNode, sheetHeight?: number) => {
        if (!content) {
            bottomSheetModalRef.current?.dismiss();
            setSheetContent(null)
            return
        }

        setSheetContent(content);
        bottomSheetModalRef.current?.present();
    };





    /* NEW */
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);


    return (
        <BottomSheetContext.Provider value={{ handleToggleBottomSheet, bottomSheetModalRef }}>
            <BottomSheetModalProvider>
                {children}
                <BottomSheetCustom ref={bottomSheetModalRef}>
                    {sheetContent}
                </BottomSheetCustom>
            </BottomSheetModalProvider>
        </BottomSheetContext.Provider>
    );
};