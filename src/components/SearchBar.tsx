import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void | Promise<void>;
  showSuggestions?: boolean;
};

export function SearchBar({ 
  value, 
  onChangeText, 
  onSubmit, 
  loading, 
  onFocus, 
  onBlur, 
  onClear,
  showSuggestions = false 
}: Props) {
  const handleChangeText = (text: string) => {
    onChangeText(text);
    // If text is cleared, call onClear if provided
    if (text.trim() === '' && onClear) {
      onClear();
    }
  };

  const handleClearPress = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
  <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder="Search city (e.g., London, New York)"
        mode="outlined"
    style={{ flex: 1, borderRadius: 12 }}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        left={<TextInput.Icon icon="map-marker" />}
        right={value.trim() ? <TextInput.Icon icon="close" onPress={handleClearPress} /> : undefined}
      />
    {!showSuggestions && (
      <IconButton icon={loading ? 'progress-clock' : 'magnify'} onPress={onSubmit} disabled={loading || !value.trim()} />
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
