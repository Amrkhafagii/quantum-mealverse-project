import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});