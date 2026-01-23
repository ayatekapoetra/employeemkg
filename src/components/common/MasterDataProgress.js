import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, useColorScheme } from 'react-native';

/**
 * MasterDataProgress - Progress bar untuk download master data ke SQLite
 * Ditampilkan tepat di atas Bottom Tab Navigator
 * 
 * Flow yang ditampilkan:
 * 1. Mengunduh [NamaData]... - Fetching dari API
 * 2. [NamaData] tersimpan (X data) - Synced ke SQLite
 * 3. Selesai! X data tersimpan offline - Completion
 */
const MasterDataProgress = ({
  visible = false,
  progress = 0,
  currentStep = '',
  syncedCount = 0,
}) => {
  // Use React Native's useColorScheme instead of native-base
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animated values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fade and slide in/out animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Animate progress bar
  useEffect(() => {
    if (visible) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [progress, visible, progressAnim]);

  // Shimmer effect for progress bar
  useEffect(() => {
    if (visible && progress < 100) {
      const shimmerAnimation = () => {
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(shimmerAnimation);
      };

      shimmerAnimation();
      return () => shimmerAnim.stopAnimation();
    }
  }, [visible, progress, shimmerAnim]);

  // Debug log
  console.log('[MasterDataProgress] visible:', visible, 'progress:', progress, 'currentStep:', currentStep);

  // Colors based on progress state
  const isComplete = progress >= 100;
  const isError = currentStep.includes('❌') || currentStep.includes('gagal');
  
  const primaryColor = isError 
    ? (isDark ? '#f87171' : '#ef4444')
    : isComplete 
      ? (isDark ? '#4ade80' : '#22c55e')
      : (isDark ? '#60a5fa' : '#3b82f6');
  
  const trackColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  if (!visible) {
    console.log('[MasterDataProgress] Not visible, returning null');
    return null;
  }
  
  console.log('[MasterDataProgress] Rendering progress bar');

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: bgColor,
          borderColor: borderColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Header with SQLite indicator */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sqliteIcon}>💾</Text>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {isComplete ? 'Data Offline Siap' : 'Menyimpan ke Database Lokal'}
          </Text>
        </View>
        {syncedCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: primaryColor + '20' }]}>
            <Text style={[styles.countText, { color: primaryColor }]}>
              {syncedCount} data
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.track, { backgroundColor: trackColor }]} />
        
        {/* Animated progress fill */}
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: primaryColor,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          {/* Shimmer effect */}
          {!isComplete && (
            <Animated.View
              style={[
                styles.shimmer,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.5, 0.2],
                  }),
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Leading glow effect */}
        {!isComplete && (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                left: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        )}
      </View>

      {/* Progress Info */}
      <View style={styles.progressInfo}>
        <Text style={[styles.currentStep, { color: textColor }]} numberOfLines={1}>
          {currentStep || 'Mempersiapkan...'}
        </Text>
        <Text style={[styles.percentage, { color: primaryColor }]}>
          {Math.round(progress)}%
        </Text>
      </View>

      {/* Offline indicator */}
      {isComplete && (
        <View style={styles.offlineHint}>
          <Text style={[styles.offlineText, { color: subtitleColor }]}>
            📱 Data tersedia saat offline
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85, // Above bottom tab (70) + margin (15)
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999999,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sqliteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: 'Quicksand-Bold',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },

  // Progress Info
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  currentStep: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
    marginRight: 8,
  },
  percentage: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    lineHeight: 16,
  },

  // Offline hint
  offlineHint: {
    marginTop: 8,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },

  // Progress Bar
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  glow: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default MasterDataProgress;
