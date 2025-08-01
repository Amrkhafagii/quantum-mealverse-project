import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PersonalRecord {
  exercise: string;
  weight: string;
}

interface ProfilePersonalRecordsSectionProps {
  personalRecords: PersonalRecord[];
}

export default function ProfilePersonalRecordsSection({ personalRecords }: ProfilePersonalRecordsSectionProps) {
  return (
    <View style={styles.personalRecordsContainer}>
      <Text style={styles.sectionTitle}>Personal Records</Text>
      <View style={styles.recordsGrid}>
        {personalRecords.map((record, index) => (
          <View key={index} style={styles.recordCard}>
            <Text style={styles.recordValue}>{record.weight}</Text>
            <Text style={styles.recordLabel}>{record.exercise}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  personalRecordsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  recordValue: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
});