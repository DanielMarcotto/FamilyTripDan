import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";

interface AddChildSheetProps {
    onSave: (child: { name: string; age: number }) => void;
    onCancel: () => void;
}

const AddChildSheet: React.FC<AddChildSheetProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");

    const handleSave = () => {
        if (!name || !age) return;
        onSave({ name, age: parseInt(age) });
    };

    return (
        <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Aggiungi Bambino</Text>

            <TextInput
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Età"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input}
            />

            <View style={styles.sheetButtons}>
                <TouchableOpacity style={styles.sheetButton} onPress={onCancel}>
                    <Text style={styles.cancelText}>Annulla</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.sheetButton, styles.saveButton]} onPress={handleSave}>
                    <Text style={styles.saveText}>Salva</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sheetContent: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 20,
        color: "#222",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e9ecef",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    sheetButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    sheetButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    cancelText: {
        color: "#888",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "#22c55e",
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AddChildSheet;
