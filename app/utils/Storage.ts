import * as SecureStore from "expo-secure-store";



export async function storage_getStoredData(key: string) {
    const data = await SecureStore.getItemAsync(key);

    if (data) {
        return JSON.parse(data)
    } else {
        return undefined
    }
}
export async function storage_saveStoredData(key: string, data: any) {
    try {
        if (!key) throw new Error("Can't save,Invalid key");
        await SecureStore.setItemAsync(key, JSON.stringify(data));
        return true
    } catch (error) {
        return false
    }
}
export async function storage_deleteStoredData(key: string) {
    //delete from secure store
    await SecureStore.deleteItemAsync(key);
}
