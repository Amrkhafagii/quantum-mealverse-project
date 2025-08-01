import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Chrome as Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <View style={styles.linkButton}>
            <Home size={20} color="#fff" />
            <Text style={styles.linkText}>Go to home screen!</Text>
          </View>
        </Link>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 72,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});