import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

interface AchievementCategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function AchievementCategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: AchievementCategoryFilterProps) {
  return (
    <View style={styles.categoriesContainer}>
      <Text style={styles.filterTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <category.icon 
              size={18} 
              color={selectedCategory === category.id ? '#fff' : '#999'} 
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 30,
  },
  filterTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
});