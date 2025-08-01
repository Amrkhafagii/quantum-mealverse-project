import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, X, Calendar, Ruler, Weight, Activity, Globe, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/supabase';

interface FormData {
  fullName: string;
  bio: string;
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredUnits: 'metric' | 'imperial';
  isPublic: boolean;
}

interface FormErrors {
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
  heightCm?: string;
  weightKg?: string;
  fitnessLevel?: string;
  preferredUnits?: string;
}

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    bio: '',
    dateOfBirth: '',
    heightCm: '',
    weightKg: '',
    fitnessLevel: 'beginner',
    preferredUnits: 'metric',
    isPublic: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      const initialData: FormData = {
        fullName: profile.full_name || '',
        bio: profile.bio || '',
        dateOfBirth: profile.date_of_birth || '',
        heightCm: profile.height_cm?.toString() || '',
        weightKg: profile.weight_kg?.toString() || '',
        fitnessLevel: (profile.fitness_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        preferredUnits: (profile.preferred_units as 'metric' | 'imperial') || 'metric',
        isPublic: profile.is_public ?? true,
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const changed = Object.keys(formData).some(
        key => formData[key as keyof FormData] !== originalData[key as keyof FormData]
      );
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full name must be less than 100 characters';
    }

    // Validate bio
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // Validate date of birth
    if (formData.dateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Date must be in YYYY-MM-DD format';
      } else {
        const date = new Date(formData.dateOfBirth);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        
        if (date < minDate || date > maxDate) {
          newErrors.dateOfBirth = 'Please enter a valid birth date (13-120 years old)';
        }
      }
    }

    // Validate height
    if (formData.heightCm) {
      const height = parseFloat(formData.heightCm);
      if (isNaN(height) || height < 50 || height > 300) {
        newErrors.heightCm = 'Height must be between 50-300 cm';
      }
    }

    // Validate weight
    if (formData.weightKg) {
      const weight = parseFloat(formData.weightKg);
      if (isNaN(weight) || weight < 20 || weight > 500) {
        newErrors.weightKg = 'Weight must be between 20-500 kg';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedData: any = {
        full_name: formData.fullName.trim() || null,
        bio: formData.bio.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        fitness_level: formData.fitnessLevel,
        preferred_units: formData.preferredUnits,
        is_public: formData.isPublic,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await updateProfile(user.id, updatedData);

      if (updateError) {
        throw updateError;
      }

      // Refresh the profile in the auth context
      await refreshProfile();
      setOriginalData(formData);
      setHasChanges(false);

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const convertHeight = (cm: string) => {
    if (!cm || formData.preferredUnits === 'metric') return cm;
    const inches = parseFloat(cm) / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  };

  const convertWeight = (kg: string) => {
    if (!kg || formData.preferredUnits === 'metric') return kg;
    const lbs = Math.round(parseFloat(kg) * 2.20462);
    return lbs.toString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[
              styles.headerButton,
              (!hasChanges || loading) && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={!hasChanges || loading}
          >
            <Save size={24} color={hasChanges && !loading ? "#FF6B35" : "#666"} />
          </TouchableOpacity>
        </View>
        {hasChanges && (
          <Text style={styles.changesIndicator}>You have unsaved changes</Text>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <X size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              maxLength={100}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
              value={formData.bio}
              onChangeText={(text) => updateFormData('bio', text)}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{formData.bio.length}/500</Text>
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelWithIcon}>
              <Calendar size={16} color="#FF6B35" />
              <Text style={styles.inputLabel}>Date of Birth</Text>
            </View>
            <TextInput
              style={[styles.input, errors.dateOfBirth && styles.inputError]}
              value={formData.dateOfBirth}
              onChangeText={(text) => updateFormData('dateOfBirth', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
            {formData.dateOfBirth && (
              <Text style={styles.helperText}>
                {formatDateForDisplay(formData.dateOfBirth)}
              </Text>
            )}
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
          </View>
        </View>

        {/* Physical Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Ruler size={16} color="#4A90E2" />
                <Text style={styles.inputLabel}>
                  Height ({formData.preferredUnits === 'metric' ? 'cm' : 'ft/in'})
                </Text>
              </View>
              <TextInput
                style={[styles.input, errors.heightCm && styles.inputError]}
                value={formData.preferredUnits === 'metric' ? formData.heightCm : convertHeight(formData.heightCm)}
                onChangeText={(text) => {
                  if (formData.preferredUnits === 'metric') {
                    updateFormData('heightCm', text);
                  } else {
                    // Convert feet/inches back to cm for storage
                    const match = text.match(/(\d+)'(\d+)"/);
                    if (match) {
                      const feet = parseInt(match[1]);
                      const inches = parseInt(match[2]);
                      const totalInches = feet * 12 + inches;
                      const cm = (totalInches * 2.54).toFixed(0);
                      updateFormData('heightCm', cm);
                    }
                  }
                }}
                placeholder={formData.preferredUnits === 'metric' ? "170" : "5'8\""}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {errors.heightCm && <Text style={styles.errorText}>{errors.heightCm}</Text>}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Weight size={16} color="#27AE60" />
                <Text style={styles.inputLabel}>
                  Weight ({formData.preferredUnits === 'metric' ? 'kg' : 'lbs'})
                </Text>
              </View>
              <TextInput
                style={[styles.input, errors.weightKg && styles.inputError]}
                value={formData.preferredUnits === 'metric' ? formData.weightKg : convertWeight(formData.weightKg)}
                onChangeText={(text) => {
                  if (formData.preferredUnits === 'metric') {
                    updateFormData('weightKg', text);
                  } else {
                    // Convert lbs to kg for storage
                    const lbs = parseFloat(text);
                    if (!isNaN(lbs)) {
                      const kg = (lbs / 2.20462).toFixed(1);
                      updateFormData('weightKg', kg);
                    }
                  }
                }}
                placeholder={formData.preferredUnits === 'metric' ? "70" : "154"}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {errors.weightKg && <Text style={styles.errorText}>{errors.weightKg}</Text>}
            </View>
          </View>
        </View>

        {/* Fitness Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Information</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.labelWithIcon}>
              <Activity size={16} color="#9B59B6" />
              <Text style={styles.inputLabel}>Fitness Level</Text>
            </View>
            <View style={styles.segmentedControl}>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.segmentButton,
                    formData.fitnessLevel === level && styles.segmentButtonActive
                  ]}
                  onPress={() => updateFormData('fitnessLevel', level)}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    formData.fitnessLevel === level && styles.segmentButtonTextActive
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Units</Text>
            <View style={styles.segmentedControl}>
              {(['metric', 'imperial'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.segmentButton,
                    formData.preferredUnits === unit && styles.segmentButtonActive
                  ]}
                  onPress={() => updateFormData('preferredUnits', unit)}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    formData.preferredUnits === unit && styles.segmentButtonTextActive
                  ]}>
                    {unit === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft/in)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <View style={styles.labelWithIcon}>
                {formData.isPublic ? (
                  <Globe size={16} color="#27AE60" />
                ) : (
                  <Lock size={16} color="#E74C3C" />
                )}
                <Text style={styles.switchLabel}>Public Profile</Text>
              </View>
              <Text style={styles.switchDescription}>
                {formData.isPublic 
                  ? 'Your profile is visible to other users. They can see your achievements and progress.'
                  : 'Your profile is private. Only you can see your data and achievements.'
                }
              </Text>
            </View>
            <Switch
              value={formData.isPublic}
              onValueChange={(value) => updateFormData('isPublic', value)}
              trackColor={{ false: '#333', true: '#FF6B35' }}
              thumbColor={formData.isPublic ? '#fff' : '#999'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || loading) && styles.disabledButton
          ]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
        >
          <LinearGradient
            colors={hasChanges && !loading ? ['#FF6B35', '#FF8C42'] : ['#333', '#333']}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  changesIndicator: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#E74C3C20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FF6B35',
  },
  segmentButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  switchDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});