import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  locationName?: string;
  loading?: boolean;
};

export function LocationConfirmationDialog({ 
  visible, 
  onDismiss, 
  onConfirm, 
  onDecline, 
  locationName,
  loading 
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Confirm Location</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {locationName 
              ? `Set "${locationName}" as your default location for weather updates?`
              : 'Set your current location as the default for weather updates?'
            }
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            This will be displayed on your home screen and can be changed later.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDecline} disabled={loading}>
            Not Now
          </Button>
          <Button 
            onPress={onConfirm} 
            mode="contained" 
            loading={loading}
            disabled={loading}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
});
