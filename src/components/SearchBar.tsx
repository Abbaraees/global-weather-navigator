import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function SearchBar({ value, onChangeText, onSubmit, loading }: Props) {
  return (
  <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search city (e.g., London)"
        mode="outlined"
    style={{ flex: 1, borderRadius: 12 }}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        left={<TextInput.Icon icon="map-marker" />}
      />
    <IconButton icon={loading ? 'progress-clock' : 'magnify'} onPress={onSubmit} disabled={loading || !value.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
