import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture } from '@/services/api';
import Toast from 'react-native-toast-message';
import { AuthContext } from '@/context/AuthContext';

interface ProfilePictureProps {
  currentPictureUrl?: string
}

const ProfilePicture = ({ currentPictureUrl }: ProfilePictureProps) => {
  const { profilePicture, fetchUserData } = useContext(AuthContext)

  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Open image picker
    let result = await ImagePicker.launchImageLibraryAsync({

      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const call = await uploadProfilePicture(result.assets[0].uri);

      if (call.success) {
        Toast.show({
          text1: 'Successo',
          text2: 'Foto profilo aggiornata',
          type: 'success',

        })
        fetchUserData()

      } else {
        Toast.show({
          text1: 'Errore',
          text2: 'Caricamento foto fallito',
          type: 'error',
        })
      }
    }
  };



  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Image
              source={{ uri: currentPictureUrl ?? profilePicture ? profilePicture?.toString() : '' }}
              style={styles.image}
            />
          </View>
        )}
      </TouchableOpacity>
      <Text style={{
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        fontSize: 13,
        paddingHorizontal: 10,
        paddingVertical: 2,
        
        textAlign: 'center',
        transform: [{ translateY: -10}]
      }}>Modifica foto</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfilePicture;