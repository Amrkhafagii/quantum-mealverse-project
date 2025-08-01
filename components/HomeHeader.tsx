import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeHeader() {
  return (
    <LinearGradient
      colors={['#1a1a1a', '#2a2a2a']}
      style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.userName}>Alex</Text>
        <Text style={styles.motivationalText}>Ready to crush today's workout?</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  motivationalText: {
    fontSize: 16,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
});