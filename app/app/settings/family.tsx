"use client";

import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import Page from "@/components/templates/Page";
import Header from "@/components/templates/Header";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheet } from "@/context/BottomSheetContext";
import AddChildSheet from "@/components/organisms/bottomsheets/add-child";
import { getFamily, addChild, removeChild } from "@/services/api";
import Toast from "react-native-toast-message";

interface Child {
    _id?: string;
    name: string;
    age: number;
}

const FamilyConfigPage = () => {
    const { handleToggleBottomSheet } = useBottomSheet();

    const [family, setFamily] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load family data on mount
    useEffect(() => {
        loadFamily();
    }, []);

    const loadFamily = async () => {
        setIsLoading(true);
        try {
            const response = await getFamily();
            if (response.success && response.items) {
                setFamily(response.items);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Errore',
                    text2: response.message || 'Errore nel caricamento della famiglia',
                });
            }
        } catch (error) {
            console.error('Error loading family:', error);
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Impossibile caricare la famiglia',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openAddChildSheet = () => {
        handleToggleBottomSheet(
            <AddChildSheet
                onCancel={() => handleToggleBottomSheet(null)}
                onSave={async (child) => {
                    setIsSaving(true);
                    try {
                        const response = await addChild(child.name, child.age);
                        if (response.success && response.item) {
                            setFamily((prev) => [...prev, response.item]);
                            handleToggleBottomSheet(null);
                            Toast.show({
                                type: 'success',
                                text1: 'Successo',
                                text2: 'Bambino aggiunto con successo',
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Errore',
                                text2: response.message || 'Errore nell\'aggiunta del bambino',
                            });
                        }
                    } catch (error) {
                        console.error('Error adding child:', error);
                        Toast.show({
                            type: 'error',
                            text1: 'Errore',
                            text2: 'Impossibile aggiungere il bambino',
                        });
                    } finally {
                        setIsSaving(false);
                    }
                }}
            />
        );
    };

    const handleRemoveChild = async (childId: string) => {
        if (!childId) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'ID bambino non valido',
            });
            return;
        }

        // Optimistic update
        const childToRemove = family.find((c) => c._id === childId);
        setFamily((prev) => prev.filter((c) => c._id !== childId));

        try {
            const response = await removeChild(childId);
            if (!response.success) {
                // Revert on error
                if (childToRemove) {
                    setFamily((prev) => [...prev, childToRemove]);
                }
                Toast.show({
                    type: 'error',
                    text1: 'Errore',
                    text2: response.message || 'Errore nella rimozione del bambino',
                });
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Successo',
                    text2: 'Bambino rimosso con successo',
                });
            }
        } catch (error) {
            console.error('Error removing child:', error);
            // Revert on error
            if (childToRemove) {
                setFamily((prev) => [...prev, childToRemove]);
            }
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Impossibile rimuovere il bambino',
            });
        }
    };

    return (
        <Page noPaddingTop alignItems="center" justifyContent="space-between">
            <Header buttonBack text=" " />

            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Configurazione Famiglia</Text>
                        <TouchableOpacity 
                            onPress={openAddChildSheet}
                            disabled={isSaving}
                        >
                            <Ionicons name="add-circle-outline" size={28} color="#22c55e" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#22c55e" />
                        </View>
                    ) : family.length === 0 ? (
                        <Text style={styles.emptyText}>Nessun bambino aggiunto.</Text>
                    ) : (
                        <FlatList
                            data={family}
                            keyExtractor={(item) => item._id || item.name}
                            renderItem={({ item }) => (
                                <View style={styles.childRow}>
                                    <Text style={styles.childText}>
                                        {item.name} ({item.age} anni)
                                    </Text>
                                    <TouchableOpacity onPress={() => item._id && handleRemoveChild(item._id)}>
                                        <Ionicons name="trash-outline" size={22} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Page>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 20,
        paddingTop: 100,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        marginTop: 10,
    },
    childRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    childText: {
        fontSize: 16,
        color: "#333",
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default FamilyConfigPage;
