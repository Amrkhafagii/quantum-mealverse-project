import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  labels?: Record<T, string>;
}

export default function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onValueChange,
  labels,
}: SegmentedControlProps<T>) {
  const getLabel = (option: T): string => {
    if (labels && labels[option]) {
      return labels[option];
    }
    return option.charAt(0).toUpperCase() + option.slice(1);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.segment,
            selectedValue === option && styles.segmentActive,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.segmentText,
              selectedValue === option && styles.segmentTextActive,
            ]}
          >
            {getLabel(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#FF6B35',
  },
  segmentText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  segmentTextActive: {
    color: '#fff',
  },
});