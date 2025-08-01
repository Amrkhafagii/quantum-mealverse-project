import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SocialStatsCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function SocialStatsCard({ label, value, icon: Icon, color }: SocialStatsCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
});