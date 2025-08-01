import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Filter } from 'lucide-react-native';

interface WorkoutSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
}

export default function WorkoutSearchBar({ 
  searchQuery, 
  onSearchChange, 
  onFilterPress 
}: WorkoutSearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts or exercises..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Filter size={20} color="#FF6B35" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
});