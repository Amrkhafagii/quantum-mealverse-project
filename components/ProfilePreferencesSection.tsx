import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface Preference {
  label: string;
  value: string;
  action?: () => void;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface ProfilePreferencesSectionProps {
  preferences: Preference[];
  onPreferencePress: (index: number) => void;
}

export default function ProfilePreferencesSection({ 
  preferences, 
  onPreferencePress 
}: ProfilePreferencesSectionProps) {
  return (
    <View style={styles.preferencesContainer}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      {preferences.map((preference, index) => {
        const IconComponent = preference.icon;
        
        return (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.preferenceItem,
              preference.action && styles.preferenceItemAction
            ]}
            onPress={() => onPreferencePress(index)}
          >
            <View style={styles.preferenceContent}>
              {IconComponent && (
                <View style={[
                  styles.preferenceIcon,
                  { backgroundColor: `${preference.color || '#666'}20` }
                ]}>
                  <IconComponent size={20} color={preference.color || '#666'} />
                </View>
              )}
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceLabel}>{preference.label}</Text>
                <Text style={styles.preferenceValue}>{preference.value}</Text>
              </View>
            </View>
            {preference.action && (
              <ChevronRight size={20} color="#666" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  preferencesContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  preferenceItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceItemAction: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3510',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});