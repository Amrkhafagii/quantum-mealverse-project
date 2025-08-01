import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Play, Pause, Square, Plus, Minus, Clock, Target, CircleCheck as CheckCircle, X, Timer, SkipForward, RotateCcw, Trophy, Star, CirclePause as PauseCircle, CircleStop as StopCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import AchievementModal from '@/components/AchievementModal';
import PersonalRecordModal from '@/components/PersonalRecordModal';
import {
  supabase,
  createWorkoutSession,
  completeWorkoutSession,
  Exercise,
  Workout,
} from '@/lib/supabase';

interface WorkoutExercise {
  id: number;
  exercise_id: number;
  order_index: number;
  target_sets: number;
  target_reps: number[] | null;
  target_duration_seconds: number | null;
  rest_seconds: number;
  exercise: Exercise;
}

interface ExerciseSet {
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  completed: boolean;
  rpe?: number;
}

interface SessionStats {
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  estimatedCalories: number;
}

interface SetValidationErrors {
  reps?: string;
  weight?: string;
  duration?: string;
}

export default function WorkoutSessionScreen() {
  const { workoutId, workoutName } = useLocalSearchParams<{
    workoutId: string;
    workoutName: string;
  }>();
  const { user } = useAuth();
  const { checkForNewAchievements, newAchievements, clearNewAchievements } = useAchievements(user?.id || null);
  const { checkForNewRecords, newRecords, clearNewRecords } = usePersonalRecords(user?.id || null);

  // Workout data
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Session state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionExerciseId, setSessionExerciseId] = useState<number | null>(null);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Rest timer
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSets: 0,
    completedSets: 0,
    totalVolume: 0,
    estimatedCalories: 0,
  });

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);

  // Timer effect for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            setShowRestModal(false);
            // Haptic feedback when rest is complete (web-compatible)
            if (Platform.OS !== 'web') {
              try {
                // Vibration would go here for native platforms
              } catch (error) {
                console.log('Vibration not supported');
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // Achievement modal effect
  useEffect(() => {
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowAchievementModal(true);
    }
  }, [newAchievements]);

  // Personal record modal effect
  useEffect(() => {
    if (newRecords.length > 0) {
      setCurrentRecord(newRecords[0]);
      setShowRecordModal(true);
    }
  }, [newRecords]);

  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);

  // Update session stats when sets change
  useEffect(() => {
    updateSessionStats();
  }, [sets, exercises]);

  // NEW: Effect to create session exercise when session and exercise data are ready
  useEffect(() => {
    if (sessionId && exercises.length > 0 && currentExerciseIndex < exercises.length && !sessionExerciseId) {
      createSessionExercise();
    }
  }, [sessionId, exercises, currentExerciseIndex, sessionExerciseId]);

  const loadWorkoutData = async () => {
    if (!workoutId) return;

    try {
      // Load workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) throw workoutError;
      setWorkout(workoutData);

      // Load workout exercises with exercise details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData);

      // Initialize sets for first exercise
      if (exercisesData.length > 0) {
        initializeSetsForExercise(exercisesData[0]);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
      Alert.alert('Error', 'Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  const initializeSetsForExercise = (exercise: WorkoutExercise) => {
    const initialSets: ExerciseSet[] = [];
    for (let i = 0; i < exercise.target_sets; i++) {
      initialSets.push({
        set_number: i + 1,
        reps: exercise.target_reps ? exercise.target_reps[i] || null : null,
        weight_kg: null,
        duration_seconds: exercise.target_duration_seconds || null,
        completed: false,
      });
    }
    setSets(initialSets);
  };

  const updateSessionStats = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
    const completedSets = sets.filter(set => set.completed).length;
    const totalVolume = sets.reduce((sum, set) => {
      if (set.completed && set.weight_kg && set.reps) {
        return sum + (set.weight_kg * set.reps);
      }
      return sum;
    }, 0);
    
    // Simple calorie estimation: 5 calories per minute + volume factor
    const estimatedCalories = Math.round((elapsedTime / 60) * 5 + totalVolume * 0.01);

    setSessionStats({
      totalSets,
      completedSets,
      totalVolume,
      estimatedCalories,
    });
  };

  const startWorkoutSession = async () => {
    if (!user || !workout) return;

    try {
      const startTime = new Date();
      const { data, error } = await createWorkoutSession({
        user_id: user.id,
        workout_id: parseInt(workoutId),
        name: workoutName || workout.name,
        started_at: startTime.toISOString(),
      });

      if (error) throw error;

      setSessionId(data.id);
      setSessionStartTime(startTime);
      setIsSessionActive(true);

      // NOTE: Removed direct call to createSessionExercise() here
      // It will be handled by the useEffect hook above

      // Animate start
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error starting workout session:', error);
      Alert.alert('Error', 'Failed to start workout session');
    }
  };

  const createSessionExercise = async () => {
    if (!sessionId || exercises.length === 0 || currentExerciseIndex >= exercises.length) return;

    try {
      const { data, error } = await supabase
        .from('session_exercises')
        .insert({
          session_id: sessionId,
          exercise_id: exercises[currentExerciseIndex].exercise_id,
          order_index: currentExerciseIndex,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionExerciseId(data.id);
    } catch (error) {
      console.error('Error creating session exercise:', error);
    }
  };

  const logSet = async (setIndex: number, reps: number, weight: number, duration?: number, rpe?: number) => {
    if (!sessionExerciseId) {
      Alert.alert('Error', 'Session not properly initialized. Please restart the workout.');
      return;
    }

    try {
      const setData = {
        session_exercise_id: sessionExerciseId,
        set_number: setIndex + 1,
        reps: reps || null,
        weight_kg: weight || null,
        duration_seconds: duration || null,
        rpe: rpe || null,
        completed: true,
      };

      const { error } = await supabase
        .from('exercise_sets')
        .insert(setData);

      if (error) throw error;

      // Update local state
      const updatedSets = [...sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        reps,
        weight_kg: weight,
        duration_seconds: duration,
        rpe,
        completed: true,
      };
      setSets(updatedSets);

      // Animate set completion
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start rest timer if not the last set
      if (setIndex < sets.length - 1) {
        startRestTimer();
      }
    } catch (error) {
      console.error('Error logging set:', error);
      Alert.alert('Error', 'Failed to log set. Please try again.');
    }
  };

  const startRestTimer = () => {
    const currentExercise = exercises[currentExerciseIndex];
    setRestTimer(currentExercise.rest_seconds);
    setIsResting(true);
    setShowRestModal(true);
  };

  const skipRest = () => {
    setIsResting(false);
    setShowRestModal(false);
    setRestTimer(0);
  };

  const addExtraSet = () => {
    const newSet: ExerciseSet = {
      set_number: sets.length + 1,
      reps: null,
      weight_kg: null,
      duration_seconds: null,
      completed: false,
    };
    setSets([...sets, newSet]);
  };

  const nextExercise = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setSessionExerciseId(null); // Reset session exercise ID
      initializeSetsForExercise(exercises[nextIndex]);
      // The useEffect hook will handle creating the new session exercise
    } else {
      // Workout complete
      await finishWorkout();
    }
  };

  const finishWorkout = async () => {
    if (!sessionId || !sessionStartTime || !user) return;

    try {
      const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
      const estimatedCalories = sessionStats.estimatedCalories;

      await completeWorkoutSession(sessionId, duration, estimatedCalories, 5);

      // Check for new personal records first
      const newlyAchievedRecords = await checkForNewRecords(sessionId);
      
      // Then check for new achievements
      const newlyUnlocked = await checkForNewAchievements();

      let message = `Incredible work! You completed your workout in ${duration} minutes and burned approximately ${estimatedCalories} calories.`;
      
      if (newlyAchievedRecords.length > 0) {
        message += ` You set ${newlyAchievedRecords.length} new personal record${newlyAchievedRecords.length > 1 ? 's' : ''}!`;
      }
      
      if (newlyUnlocked.length > 0) {
        message += ` You unlocked ${newlyUnlocked.length} new achievement${newlyUnlocked.length > 1 ? 's' : ''}!`;
      }

      Alert.alert('Workout Complete! 🎉', message, [
        {
          text: 'View Summary',
          onPress: () => {
            if (newlyAchievedRecords.length === 0 && newlyUnlocked.length === 0) {
              router.replace('/(tabs)');
            }
            // If there are records or achievements, the modals will show automatically
          },
        },
      ]);
    } catch (error) {
      console.error('Error finishing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const handleExitWorkout = () => {
    setShowExitModal(true);
  };

  const handleResumeWorkout = () => {
    setShowExitModal(false);
  };

  const handleEndSession = async () => {
    setShowExitModal(false);
    await finishWorkout();
  };

  const handleDiscardWorkout = () => {
    setShowExitModal(false);
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive', 
          onPress: () => router.replace('/(tabs)') 
        },
      ]
    );
  };

  const handleAchievementModalClose = () => {
    setShowAchievementModal(false);
    setCurrentAchievement(null);
    
    // Show next achievement if there are more
    const remainingAchievements = newAchievements.slice(1);
    if (remainingAchievements.length > 0) {
      setTimeout(() => {
        setCurrentAchievement(remainingAchievements[0]);
        setShowAchievementModal(true);
      }, 500);
    } else {
      // All achievements shown, clear them
      clearNewAchievements();
      
      // Check if there are personal records to show
      if (newRecords.length === 0) {
        router.replace('/(tabs)');
      }
    }
  };

  const handleRecordModalClose = () => {
    setShowRecordModal(false);
    setCurrentRecord(null);
    
    // Show next record if there are more
    const remainingRecords = newRecords.slice(1);
    if (remainingRecords.length > 0) {
      setTimeout(() => {
        setCurrentRecord(remainingRecords[0]);
        setShowRecordModal(true);
      }, 500);
    } else {
      // All records shown, clear them
      clearNewRecords();
      
      // Check if there are achievements to show
      if (newAchievements.length === 0) {
        router.replace('/(tabs)');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (exercises.length === 0) return 0;
    const totalExercises = exercises.length;
    const completedExercises = currentExerciseIndex;
    const currentExerciseProgress = sets.filter(s => s.completed).length / sets.length;
    return ((completedExercises + currentExerciseProgress) / totalExercises) * 100;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!isSessionActive) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.workoutTitle}>{workoutName || workout?.name}</Text>
          <Text style={styles.workoutSubtitle}>
            {exercises.length} exercises • {workout?.estimated_duration_minutes} min
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.previewStats}>
            <View style={styles.previewStatCard}>
              <Target size={24} color="#FF6B35" />
              <Text style={styles.previewStatValue}>{exercises.length}</Text>
              <Text style={styles.previewStatLabel}>Exercises</Text>
            </View>
            <View style={styles.previewStatCard}>
              <Clock size={24} color="#4A90E2" />
              <Text style={styles.previewStatValue}>{workout?.estimated_duration_minutes}</Text>
              <Text style={styles.previewStatLabel}>Minutes</Text>
            </View>
            <View style={styles.previewStatCard}>
              <Trophy size={24} color="#27AE60" />
              <Text style={styles.previewStatValue}>
                {exercises.reduce((sum, ex) => sum + ex.target_sets, 0)}
              </Text>
              <Text style={styles.previewStatLabel}>Total Sets</Text>
            </View>
          </View>

          <View style={styles.exercisesList}>
            <Text style={styles.exercisesTitle}>Workout Overview</Text>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exercisePreviewCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exercisePreviewInfo}>
                  <Text style={styles.exercisePreviewName}>
                    {exercise.exercise?.name || 'Unknown Exercise'}
                  </Text>
                  <Text style={styles.exercisePreviewDetails}>
                    {exercise.target_sets} sets
                    {exercise.target_reps && ` • ${exercise.target_reps.join('-')} reps`}
                    {exercise.target_duration_seconds && ` • ${exercise.target_duration_seconds}s`}
                    {exercise.rest_seconds && ` • ${exercise.rest_seconds}s rest`}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.startButton} onPress={startWorkoutSession}>
              <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.startButtonGradient}>
                <Play size={24} color="#fff" />
                <Text style={styles.startButtonText}>Start Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.activeHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleExitWorkout} style={styles.exitButton}>
            <PauseCircle size={24} color="#FF6B35" />
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            <Clock size={16} color="#FF6B35" />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>
        
        <Text style={styles.exerciseTitle}>
          {currentExercise.exercise?.name || 'Unknown Exercise'}
        </Text>
        <Text style={styles.exerciseProgress}>
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(getProgressPercentage())}% Complete</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Session Stats */}
        <View style={styles.sessionStatsContainer}>
          <View style={styles.sessionStatCard}>
            <Text style={styles.sessionStatValue}>{sessionStats.completedSets}</Text>
            <Text style={styles.sessionStatLabel}>Sets Done</Text>
          </View>
          <View style={styles.sessionStatCard}>
            <Text style={styles.sessionStatValue}>{Math.round(sessionStats.totalVolume)}</Text>
            <Text style={styles.sessionStatLabel}>Volume (kg)</Text>
          </View>
          <View style={styles.sessionStatCard}>
            <Text style={styles.sessionStatValue}>{sessionStats.estimatedCalories}</Text>
            <Text style={styles.sessionStatLabel}>Calories</Text>
          </View>
        </View>

        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseDescription}>
            {currentExercise.exercise?.description}
          </Text>
          {currentExercise.exercise?.instructions && (
            <Text style={styles.exerciseInstructions}>
              {currentExercise.exercise.instructions}
            </Text>
          )}
        </View>

        <View style={styles.setsContainer}>
          <View style={styles.setsHeader}>
            <Text style={styles.setsTitle}>Sets</Text>
            <TouchableOpacity style={styles.addSetButton} onPress={addExtraSet}>
              <Plus size={16} color="#FF6B35" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
          
          {sets.map((set, index) => (
            <SetLogger
              key={index}
              set={set}
              setIndex={index}
              exercise={currentExercise}
              onLogSet={logSet}
            />
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.nextButton, { opacity: sets.every(s => s.completed) ? 1 : 0.5 }]}
            onPress={nextExercise}
            disabled={!sets.every(s => s.completed)}
          >
            <Text style={styles.nextButtonText}>
              {currentExerciseIndex === exercises.length - 1 ? 'Finish Workout' : 'Next Exercise'}
            </Text>
            {currentExerciseIndex < exercises.length - 1 && (
              <SkipForward size={20} color="#fff" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exit Workout Modal */}
      <Modal visible={showExitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.exitModal}>
            <View style={styles.exitModalHeader}>
              <AlertTriangle size={32} color="#FF6B35" />
              <Text style={styles.exitModalTitle}>Workout in Progress</Text>
              <Text style={styles.exitModalSubtitle}>
                What would you like to do with your current workout?
              </Text>
            </View>

            <View style={styles.exitModalStats}>
              <Text style={styles.exitModalStatsText}>
                {formatTime(elapsedTime)} • {sessionStats.completedSets} sets completed
              </Text>
            </View>

            <View style={styles.exitModalActions}>
              <TouchableOpacity style={styles.resumeButton} onPress={handleResumeWorkout}>
                <Play size={20} color="#27AE60" />
                <Text style={styles.resumeButtonText}>Resume Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.endSessionButton} onPress={handleEndSession}>
                <StopCircle size={20} color="#4A90E2" />
                <Text style={styles.endSessionButtonText}>End & Save Session</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.discardButton} onPress={handleDiscardWorkout}>
                <X size={20} color="#E74C3C" />
                <Text style={styles.discardButtonText}>Discard Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rest Timer Modal */}
      <Modal visible={showRestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.restModal}>
            <Timer size={48} color="#FF6B35" />
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
            <Text style={styles.restSubtitle}>Take a breather, you've earned it!</Text>
            
            <View style={styles.restActions}>
              <TouchableOpacity style={styles.skipRestButton} onPress={skipRest}>
                <SkipForward size={20} color="#fff" />
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addTimeButton} 
                onPress={() => setRestTimer(prev => prev + 30)}
              >
                <Plus size={20} color="#4A90E2" />
                <Text style={styles.addTimeText}>+30s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievement Modal */}
      <AchievementModal
        visible={showAchievementModal}
        achievement={currentAchievement}
        onClose={handleAchievementModalClose}
      />

      {/* Personal Record Modal */}
      <PersonalRecordModal
        visible={showRecordModal}
        record={currentRecord}
        onClose={handleRecordModalClose}
      />

      {/* Set Completion Animation */}
      <Animated.View 
        style={[
          styles.completionOverlay,
          { opacity: fadeAnim }
        ]}
        pointerEvents="none"
      >
        <CheckCircle size={64} color="#27AE60" />
        <Text style={styles.completionText}>Set Complete!</Text>
      </Animated.View>
    </View>
  );
}

interface SetLoggerProps {
  set: ExerciseSet;
  setIndex: number;
  exercise: WorkoutExercise;
  onLogSet: (index: number, reps: number, weight: number, duration?: number, rpe?: number) => void;
}

function SetLogger({ set, setIndex, exercise, onLogSet }: SetLoggerProps) {
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [weight, setWeight] = useState(set.weight_kg?.toString() || '');
  const [duration, setDuration] = useState(set.duration_seconds?.toString() || '');
  const [rpe, setRpe] = useState(set.rpe?.toString() || '');
  const [showRPE, setShowRPE] = useState(false);
  const [errors, setErrors] = useState<SetValidationErrors>({});

  const validateInputs = (): boolean => {
    const newErrors: SetValidationErrors = {};
    let isValid = true;

    // Validate based on exercise type
    if (exercise.exercise?.exercise_type !== 'cardio') {
      // For strength exercises, reps are required
      if (!reps.trim()) {
        newErrors.reps = 'Reps required';
        isValid = false;
      } else {
        const repsNum = parseInt(reps);
        if (isNaN(repsNum) || repsNum <= 0) {
          newErrors.reps = 'Must be a positive number';
          isValid = false;
        } else if (repsNum > 1000) {
          newErrors.reps = 'Must be less than 1000';
          isValid = false;
        }
      }

      // Weight is optional but if provided, must be valid
      if (weight.trim()) {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum < 0) {
          newErrors.weight = 'Must be a positive number';
          isValid = false;
        } else if (weightNum > 1000) {
          newErrors.weight = 'Must be less than 1000kg';
          isValid = false;
        }
      }
    } else {
      // For cardio exercises, duration is required
      if (!duration.trim()) {
        newErrors.duration = 'Duration required';
        isValid = false;
      } else {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
          newErrors.duration = 'Must be a positive number';
          isValid = false;
        } else if (durationNum > 86400) { // 24 hours in seconds
          newErrors.duration = 'Must be less than 24 hours';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogSet = () => {
    if (!validateInputs()) {
      return;
    }

    const repsNum = parseInt(reps) || 0;
    const weightNum = parseFloat(weight) || 0;
    const durationNum = parseInt(duration) || 0;
    const rpeNum = parseInt(rpe) || undefined;

    onLogSet(setIndex, repsNum, weightNum, durationNum, rpeNum);
  };

  const incrementValue = (value: string, setter: (value: string) => void, step: number = 1) => {
    const current = parseFloat(value) || 0;
    setter((current + step).toString());
    // Clear errors when user modifies input
    setErrors(prev => ({ ...prev }));
  };

  const decrementValue = (value: string, setter: (value: string) => void, step: number = 1) => {
    const current = parseFloat(value) || 0;
    setter(Math.max(0, current - step).toString());
    // Clear errors when user modifies input
    setErrors(prev => ({ ...prev }));
  };

  const handleInputChange = (value: string, setter: (value: string) => void, field: keyof SetValidationErrors) => {
    setter(value);
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={[styles.setCard, set.completed && styles.setCardCompleted]}>
      <View style={styles.setHeader}>
        <Text style={styles.setNumber}>Set {set.set_number}</Text>
        {set.completed && <CheckCircle size={20} color="#27AE60" />}
      </View>

      <View style={styles.setInputs}>
        {!exercise.target_duration_seconds && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <View style={styles.inputWithButtons}>
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => decrementValue(reps, setReps)}
              >
                <Minus size={16} color="#999" />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, errors.reps && styles.inputError]}
                value={reps}
                onChangeText={(text) => handleInputChange(text, setReps, 'reps')}
                keyboardType="numeric"
                placeholder={set.reps?.toString() || '0'}
                placeholderTextColor="#666"
                editable={!set.completed}
              />
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => incrementValue(reps, setReps)}
              >
                <Plus size={16} color="#999" />
              </TouchableOpacity>
            </View>
            {errors.reps && <Text style={styles.errorText}>{errors.reps}</Text>}
          </View>
        )}

        {!exercise.target_duration_seconds && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <View style={styles.inputWithButtons}>
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => decrementValue(weight, setWeight, 2.5)}
              >
                <Minus size={16} color="#999" />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, errors.weight && styles.inputError]}
                value={weight}
                onChangeText={(text) => handleInputChange(text, setWeight, 'weight')}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
                editable={!set.completed}
              />
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => incrementValue(weight, setWeight, 2.5)}
              >
                <Plus size={16} color="#999" />
              </TouchableOpacity>
            </View>
            {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
          </View>
        )}

        {exercise.target_duration_seconds && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (s)</Text>
            <View style={styles.inputWithButtons}>
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => decrementValue(duration, setDuration, 15)}
              >
                <Minus size={16} color="#999" />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                value={duration}
                onChangeText={(text) => handleInputChange(text, setDuration, 'duration')}
                keyboardType="numeric"
                placeholder={set.duration_seconds?.toString() || '0'}
                placeholderTextColor="#666"
                editable={!set.completed}
              />
              <TouchableOpacity 
                style={styles.inputButton} 
                onPress={() => incrementValue(duration, setDuration, 15)}
              >
                <Plus size={16} color="#999" />
              </TouchableOpacity>
            </View>
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
        )}
      </View>

      {/* RPE Section */}
      <TouchableOpacity 
        style={styles.rpeToggle} 
        onPress={() => setShowRPE(!showRPE)}
      >
        <Text style={styles.rpeToggleText}>
          {showRPE ? 'Hide' : 'Add'} RPE (Rate of Perceived Exertion)
        </Text>
      </TouchableOpacity>

      {showRPE && (
        <View style={styles.rpeContainer}>
          <Text style={styles.rpeLabel}>RPE (1-10)</Text>
          <View style={styles.rpeButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.rpeButton,
                  rpe === value.toString() && styles.rpeButtonActive
                ]}
                onPress={() => setRpe(value.toString())}
              >
                <Text style={[
                  styles.rpeButtonText,
                  rpe === value.toString() && styles.rpeButtonTextActive
                ]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!set.completed && (
        <TouchableOpacity style={styles.logSetButton} onPress={handleLogSet}>
          <CheckCircle size={20} color="#fff" />
          <Text style={styles.logSetButtonText}>Complete Set</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  activeHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  exitButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  workoutTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  exerciseTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  exerciseProgress: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  previewStatCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  previewStatValue: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  previewStatLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  sessionStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  sessionStatCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  sessionStatValue: {
    fontSize: 18,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  sessionStatLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  exercisesList: {
    marginBottom: 30,
  },
  exercisesTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  exercisePreviewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumber: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseNumberText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  exercisePreviewInfo: {
    flex: 1,
  },
  exercisePreviewName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exercisePreviewDetails: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 100,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  setsContainer: {
    marginTop: 30,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setsTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  addSetText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  setCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  setCardCompleted: {
    borderColor: '#27AE60',
    backgroundColor: '#27AE6020',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  setInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    textAlign: 'center',
  },
  inputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 2,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 10,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  rpeToggle: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rpeToggleText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
  },
  rpeContainer: {
    marginBottom: 12,
  },
  rpeLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  rpeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rpeButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  rpeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  rpeButtonText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  rpeButtonTextActive: {
    color: '#fff',
  },
  logSetButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logSetButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 100,
  },
  nextButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 320,
    maxWidth: '90%',
  },
  exitModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exitModalTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  exitModalSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  exitModalStats: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  exitModalStatsText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  exitModalActions: {
    width: '100%',
    gap: 12,
  },
  resumeButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  endSessionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endSessionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  discardButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  discardButtonText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  restModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 300,
  },
  restTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  restSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  restActions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipRestButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipRestText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  addTimeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTimeText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  completionText: {
    fontSize: 24,
    color: '#27AE60',
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
});