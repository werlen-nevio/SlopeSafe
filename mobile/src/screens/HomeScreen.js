import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useResorts } from '../contexts/ResortsContext';
import ResortCard from '../components/ResortCard';

const HomeScreen = ({ navigation }) => {
  const { resorts, searchResults, loading, fetchResorts, searchResorts, clearSearch } = useResorts();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResorts();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim()) {
      searchResorts(text);
    } else {
      clearSearch();
    }
  };

  const displayResorts = searchQuery ? searchResults : resorts;

  const renderItem = ({ item }) => (
    <ResortCard
      resort={item}
      onPress={() => navigation.navigate('ResortDetail', { slug: item.slug })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resorts..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading && resorts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={displayResorts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resorts found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb'
  },
  listContainer: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280'
  }
});

export default HomeScreen;
