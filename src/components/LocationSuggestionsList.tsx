import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text, ActivityIndicator, Card } from 'react-native-paper';
import type { LocationSuggestion } from '../types/weather';

type Props = {
  suggestions: LocationSuggestion[];
  loading: boolean;
  onLocationSelect: (location: LocationSuggestion) => void;
  visible: boolean;
};

export function LocationSuggestionsList({ suggestions, loading, onLocationSelect, visible }: Props) {
  if (!visible) return null;

  const formatLocationDisplay = (location: LocationSuggestion): string => {
    const parts = [location.name];
    
    if (location.state) {
      parts.push(location.state);
    }
    
    parts.push(location.country);
    
    return parts.join(', ');
  };

  const renderSuggestionItem = ({ item }: { item: LocationSuggestion }) => (
    <List.Item
      title={item.name}
      description={formatLocationDisplay(item)}
      left={(props) => <List.Icon {...props} icon="map-marker" />}
      onPress={() => onLocationSelect(item)}
      style={styles.suggestionItem}
    />
  );

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Searching locations...</Text>
        </View>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No locations found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    maxHeight: 300,
    elevation: 4,
  },
  list: {
    flexGrow: 0,
  },
  suggestionItem: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});
