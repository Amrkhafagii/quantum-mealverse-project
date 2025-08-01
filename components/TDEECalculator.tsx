import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Calculator, 
  Target, 
  Activity, 
  Scale, 
  Ruler, 
  Calendar, 
  User, 
  Info,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react-native';

interface TDEECalculatorProps {
  visible: boolean;
  onClose: () => void;
}

interface TDEEResults {
  bmr: number;
  tdee: number;
  adjustedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  lbm: number;
}

interface FormData {
  weight: string;
  height: string;
  age: string;
  sex: 'male' | 'female';
  bodyFat: string;
  activityLevel: number;
  goal: 'cutting' | 'maintenance' | 'bulking';
  isMetric: boolean;
  isTrainingDay: boolean;
}

export default function TDEECalculator({ visible, onClose }: TDEECalculatorProps) {
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    bodyFat: '',
    activityLevel: 1.4,
    goal: 'maintenance',
    isMetric: true,
    isTrainingDay: true,
  });

  const [results, setResults] = useState<TDEEResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activityLevels = [
    { value: 1.2, label: 'Sedentary', description: 'Desk job, no exercise' },
    { value: 1.3, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 1.4, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 1.5, label: 'Very Active', description: 'Heavy exercise 6-7 days/week' },
    { value: 1.7, label: 'Extremely Active', description: 'Very heavy exercise, physical job' },
  ];

  const goals = [
    { 
      value: 'cutting', 
      label: 'Cutting', 
      description: '25% deficit for fat loss',
      multiplier: 0.75,
      icon: TrendingDown,
      color: '#E74C3C'
    },
    { 
      value: 'maintenance', 
      label: 'Maintenance', 
      description: 'Maintain current weight',
      multiplier: 1.0,
      icon: Minus,
      color: '#4A90E2'
    },
    { 
      value: 'bulking', 
      label: 'Bulking', 
      description: '10-20% surplus for muscle gain',
      multiplier: 1.15,
      icon: TrendingUp,
      color: '#27AE60'
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Valid weight required';
    }

    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = 'Valid height required';
    }

    if (!formData.age || parseInt(formData.age) < 13 || parseInt(formData.age) > 100) {
      newErrors.age = 'Age must be between 13-100';
    }

    if (!formData.bodyFat || parseFloat(formData.bodyFat) < 5 || parseFloat(formData.bodyFat) > 50) {
      newErrors.bodyFat = 'Body fat must be between 5-50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTDEE = (): TDEEResults => {
    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    const bodyFat = parseFloat(formData.bodyFat);

    // Convert to metric if needed
    if (!formData.isMetric) {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    }

    // Calculate Lean Body Mass
    const lbm = weight * (1 - bodyFat / 100);

    // Katch-McArdle BMR formula
    const bmr = 370 + (21.6 * lbm);

    // Calculate TDEE
    const tdee = bmr * formData.activityLevel;

    // Adjust for goal
    const goalMultiplier = goals.find(g => g.value === formData.goal)?.multiplier || 1.0;
    const adjustedCalories = tdee * goalMultiplier;

    // Calculate macros based on Leangains protocol with PERCENTAGE-BASED approach
    let proteinPercentage: number;
    let carbPercentage: number;
    let fatPercentage: number;

    if (formData.goal === 'cutting') {
      if (formData.isTrainingDay) {
        // Training day cutting: 30% protein, 35% carbs, 35% fat
        proteinPercentage = 0.30;
        carbPercentage = 0.35;
        fatPercentage = 0.35;
      } else {
        // Rest day cutting: 35% protein, 25% carbs, 40% fat
        proteinPercentage = 0.35;
        carbPercentage = 0.25;
        fatPercentage = 0.40;
      }
    } else if (formData.goal === 'bulking') {
      if (formData.isTrainingDay) {
        // Training day bulking: 25% protein, 45% carbs, 30% fat
        proteinPercentage = 0.25;
        carbPercentage = 0.45;
        fatPercentage = 0.30;
      } else {
        // Rest day bulking: 30% protein, 35% carbs, 35% fat
        proteinPercentage = 0.30;
        carbPercentage = 0.35;
        fatPercentage = 0.35;
      }
    } else {
      // Maintenance: 30% protein, 35% carbs, 35% fat
      proteinPercentage = 0.30;
      carbPercentage = 0.35;
      fatPercentage = 0.35;
    }

    // Calculate macros in grams based on percentages
    const proteinCalories = adjustedCalories * proteinPercentage;
    const carbCalories = adjustedCalories * carbPercentage;
    const fatCalories = adjustedCalories * fatPercentage;

    const protein = proteinCalories / 4; // 4 calories per gram of protein
    const carbs = carbCalories / 4; // 4 calories per gram of carbs
    const fat = fatCalories / 9; // 9 calories per gram of fat

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      adjustedCalories: Math.round(adjustedCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      lbm: Math.round(lbm * 10) / 10,
    };
  };

  const handleCalculate = () => {
    if (validateForm()) {
      const calculatedResults = calculateTDEE();
      setResults(calculatedResults);
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setFormData({
      weight: '',
      height: '',
      age: '',
      sex: 'male',
      bodyFat: '',
      activityLevel: 1.4,
      goal: 'maintenance',
      isMetric: true,
      isTrainingDay: true,
    });
    setResults(null);
    setShowResults(false);
    setErrors({});
  };

  const getBodyFatHint = () => {
    return "Don't know your body fat %? Add 20% to your visual estimate. Most people underestimate by 15-20%.";
  };

  const selectedGoal = goals.find(g => g.value === formData.goal);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Calculator size={32} color="#FF6B35" />
            <Text style={styles.headerTitle}>TDEE Calculator</Text>
            <Text style={styles.headerSubtitle}>Leangains Protocol</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!showResults ? (
            <>
              {/* Units Toggle */}
              <View style={styles.unitsContainer}>
                <Text style={styles.sectionTitle}>Units</Text>
                <View style={styles.unitsToggle}>
                  <Text style={[styles.unitLabel, !formData.isMetric && styles.unitLabelActive]}>
                    Imperial
                  </Text>
                  <Switch
                    value={formData.isMetric}
                    onValueChange={(value) => setFormData({ ...formData, isMetric: value })}
                    trackColor={{ false: '#333', true: '#FF6B35' }}
                    thumbColor={formData.isMetric ? '#fff' : '#999'}
                  />
                  <Text style={[styles.unitLabel, formData.isMetric && styles.unitLabelActive]}>
                    Metric
                  </Text>
                </View>
              </View>

              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.labelWithIcon}>
                      <Scale size={16} color="#4A90E2" />
                      <Text style={styles.inputLabel}>
                        Weight ({formData.isMetric ? 'kg' : 'lbs'})
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.weight && styles.inputError]}
                      value={formData.weight}
                      onChangeText={(text) => setFormData({ ...formData, weight: text })}
                      placeholder={formData.isMetric ? "70" : "154"}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.labelWithIcon}>
                      <Ruler size={16} color="#27AE60" />
                      <Text style={styles.inputLabel}>
                        Height ({formData.isMetric ? 'cm' : 'in'})
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.height && styles.inputError]}
                      value={formData.height}
                      onChangeText={(text) => setFormData({ ...formData, height: text })}
                      placeholder={formData.isMetric ? "175" : "69"}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.labelWithIcon}>
                      <Calendar size={16} color="#9B59B6" />
                      <Text style={styles.inputLabel}>Age</Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.age && styles.inputError]}
                      value={formData.age}
                      onChangeText={(text) => setFormData({ ...formData, age: text })}
                      placeholder="25"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.labelWithIcon}>
                      <User size={16} color="#E74C3C" />
                      <Text style={styles.inputLabel}>Sex</Text>
                    </View>
                    <View style={styles.sexSelector}>
                      {(['male', 'female'] as const).map((sex) => (
                        <TouchableOpacity
                          key={sex}
                          style={[
                            styles.sexButton,
                            formData.sex === sex && styles.sexButtonActive
                          ]}
                          onPress={() => setFormData({ ...formData, sex })}
                        >
                          <Text style={[
                            styles.sexButtonText,
                            formData.sex === sex && styles.sexButtonTextActive
                          ]}>
                            {sex.charAt(0).toUpperCase() + sex.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Body Fat Percentage */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelWithIcon}>
                    <Target size={16} color="#FF6B35" />
                    <Text style={styles.inputLabel}>Body Fat %</Text>
                    <TouchableOpacity 
                      style={styles.infoButton}
                      onPress={() => Alert.alert('Body Fat % Hint', getBodyFatHint())}
                    >
                      <Info size={14} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, errors.bodyFat && styles.inputError]}
                    value={formData.bodyFat}
                    onChangeText={(text) => setFormData({ ...formData, bodyFat: text })}
                    placeholder="15"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                  <Text style={styles.hintText}>{getBodyFatHint()}</Text>
                  {errors.bodyFat && <Text style={styles.errorText}>{errors.bodyFat}</Text>}
                </View>
              </View>

              {/* Activity Level */}
              <View style={styles.section}>
                <View style={styles.labelWithIcon}>
                  <Activity size={16} color="#FF6B35" />
                  <Text style={styles.sectionTitle}>Activity Level</Text>
                </View>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.activityButton,
                      formData.activityLevel === level.value && styles.activityButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, activityLevel: level.value })}
                  >
                    <View style={styles.activityContent}>
                      <Text style={[
                        styles.activityLabel,
                        formData.activityLevel === level.value && styles.activityLabelActive
                      ]}>
                        {level.label} (×{level.value})
                      </Text>
                      <Text style={styles.activityDescription}>
                        {level.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Goal Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Goal</Text>
                {goals.map((goal) => {
                  const IconComponent = goal.icon;
                  return (
                    <TouchableOpacity
                      key={goal.value}
                      style={[
                        styles.goalButton,
                        formData.goal === goal.value && styles.goalButtonActive,
                        formData.goal === goal.value && { borderColor: goal.color }
                      ]}
                      onPress={() => setFormData({ ...formData, goal: goal.value as any })}
                    >
                      <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                        <IconComponent size={20} color={goal.color} />
                      </View>
                      <View style={styles.goalContent}>
                        <Text style={[
                          styles.goalLabel,
                          formData.goal === goal.value && styles.goalLabelActive
                        ]}>
                          {goal.label}
                        </Text>
                        <Text style={styles.goalDescription}>
                          {goal.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Calculate Button */}
              <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.calculateGradient}>
                  <Calculator size={20} color="#fff" />
                  <Text style={styles.calculateButtonText}>Calculate TDEE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Results Display */}
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: `${selectedGoal?.color}20` }]}>
                    {selectedGoal && <selectedGoal.icon size={24} color={selectedGoal.color} />}
                  </View>
                  <Text style={styles.resultsTitle}>Your Results</Text>
                  <Text style={styles.resultsSubtitle}>
                    {selectedGoal?.label} • {formData.isTrainingDay ? 'Training' : 'Rest'} Day
                  </Text>
                </View>

                {/* Main Calorie Target */}
                <View style={[styles.calorieCard, { borderColor: selectedGoal?.color }]}>
                  <Text style={styles.calorieLabel}>Daily Target</Text>
                  <Text style={[styles.calorieValue, { color: selectedGoal?.color }]}>
                    {results?.adjustedCalories} kcal
                  </Text>
                  <Text style={styles.calorieGoal}>{selectedGoal?.label}</Text>
                </View>

                {/* Macro Breakdown */}
                <View style={styles.macroContainer}>
                  <Text style={styles.macroTitle}>Macro Breakdown</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroCard}>
                      <Text style={styles.macroValue}>{results?.protein}g</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((results?.protein || 0) * 4 / (results?.adjustedCalories || 1) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.macroCard}>
                      <Text style={styles.macroValue}>{results?.carbs}g</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((results?.carbs || 0) * 4 / (results?.adjustedCalories || 1) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.macroCard}>
                      <Text style={styles.macroValue}>{results?.fat}g</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((results?.fat || 0) * 9 / (results?.adjustedCalories || 1) * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Training/Rest Day Toggle */}
                <View style={styles.dayToggleContainer}>
                  <Text style={styles.dayToggleTitle}>Day Type</Text>
                  <View style={styles.dayToggle}>
                    <TouchableOpacity
                      style={[
                        styles.dayButton,
                        formData.isTrainingDay && styles.dayButtonActive
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, isTrainingDay: true });
                        const newResults = calculateTDEE();
                        setResults({ ...newResults, isTrainingDay: true } as any);
                      }}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        formData.isTrainingDay && styles.dayButtonTextActive
                      ]}>
                        Training Day
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.dayButton,
                        !formData.isTrainingDay && styles.dayButtonActive
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, isTrainingDay: false });
                        const newResults = calculateTDEE();
                        setResults({ ...newResults, isTrainingDay: false } as any);
                      }}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        !formData.isTrainingDay && styles.dayButtonTextActive
                      ]}>
                        Rest Day
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Detailed Breakdown */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Calculation Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lean Body Mass</Text>
                    <Text style={styles.detailValue}>
                      {results?.lbm} {formData.isMetric ? 'kg' : 'lbs'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>BMR (Katch-McArdle)</Text>
                    <Text style={styles.detailValue}>{results?.bmr} kcal</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>TDEE</Text>
                    <Text style={styles.detailValue}>{results?.tdee} kcal</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Goal Adjustment</Text>
                    <Text style={styles.detailValue}>
                      ×{selectedGoal?.multiplier} ({selectedGoal?.label})
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.recalculateButton} onPress={() => setShowResults(false)}>
                    <Text style={styles.recalculateButtonText}>Recalculate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  unitsContainer: {
    marginBottom: 30,
  },
  unitsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  unitLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginHorizontal: 12,
  },
  unitLabelActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
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
  infoButton: {
    marginLeft: 8,
    padding: 4,
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
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    lineHeight: 16,
  },
  sexSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  sexButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: '#FF6B35',
  },
  sexButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  sexButtonTextActive: {
    color: '#fff',
  },
  activityButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  activityButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3510',
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#fff',
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  goalButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  goalIcon: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  goalLabelActive: {
    color: '#fff',
  },
  goalDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  calculateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  calculateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  resultsContainer: {
    paddingTop: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  calorieCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  calorieGoal: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
  },
  macroContainer: {
    marginBottom: 30,
  },
  macroTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  macroValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  macroPercentage: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  dayToggleContainer: {
    marginBottom: 30,
  },
  dayToggleTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  dayToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#FF6B35',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  detailsTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recalculateButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  recalculateButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  resetButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 100,
  },
});