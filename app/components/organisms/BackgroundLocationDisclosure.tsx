import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackgroundLocationDisclosureProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Prominent Disclosure component for BACKGROUND_LOCATION permission
 * Required by Google Play Store policy before requesting background location access.
 * 
 * This disclosure must be shown BEFORE requesting the system permission dialog.
 */
const BackgroundLocationDisclosure: React.FC<BackgroundLocationDisclosureProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={48} color="#FF7A00" />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Accesso alla posizione in background
          </Text>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              FamilyTrip ha bisogno dell'accesso continuo alla tua posizione per:
            </Text>

            <View style={styles.benefitItem}>
              <Ionicons name="notifications" size={20} color="#FF7A00" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Inviarti notifiche quando sei vicino a punti di interesse durante i tuoi viaggi
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="map" size={20} color="#FF7A00" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Aggiornare automaticamente le distanze e la lista dei luoghi vicini mentre ti muovi
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="time" size={20} color="#FF7A00" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Funzionare anche quando l'app è in background, così non perderai nessuna opportunità
              </Text>
            </View>

            <Text style={styles.privacyNote}>
              La tua posizione viene utilizzata solo per queste funzionalità e non viene condivisa con terze parti.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Non ora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>Consenti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 22,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  privacyNote: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 16,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  acceptButton: {
    backgroundColor: '#FF7A00',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BackgroundLocationDisclosure;
