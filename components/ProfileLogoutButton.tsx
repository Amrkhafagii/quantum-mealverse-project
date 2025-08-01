import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileLogoutButtonProps {
  onLogoutPress: () => void;
}

export default function ProfileLogoutButton({ onLogoutPress }: ProfileLogoutButtonProps) {
  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 100,
  },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Inter-SemiBold',
  },
});