import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, username, fullName);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Dumbbell size={48} color="#FF6B35" />
            </View>
            <Text style={styles.title}>Join FitTracker</Text>
            <Text style={styles.subtitle}>Start your fitness journey today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username *"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <User size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password *"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password *"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.buttonGradient}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  linkText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
});