import React, { useEffect, useRef } from 'react';
import { VStack, Text, Center, useColorMode, Box, HStack } from 'native-base';
import { Animated, Easing } from 'react-native';

const LoadingHauler = ({
  message = 'Memuat data...',
  subMessage = null,
  size = 'lg',
  showProgress = false,
  progress = 0,
  type = 'default' // 'default' | 'pulse' | 'dots' | 'skeleton'
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Animated values
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation
  useEffect(() => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(pulseAnimation);
    };

    pulseAnimation();
    return () => pulseAnim.stopAnimation();
  }, [pulseAnim]);

  // Dots animation
  useEffect(() => {
    const dotsAnimation = () => {
      Animated.stagger(200, [
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(dotsAnimation);
      });
    };

    dotsAnimation();
    return () => {
      dot1Anim.stopAnimation();
      dot2Anim.stopAnimation();
      dot3Anim.stopAnimation();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  // Rotate animation for spinner
  useEffect(() => {
    const rotateAnimation = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        rotateAnimation();
      });
    };

    rotateAnimation();
    return () => rotateAnim.stopAnimation();
  }, [rotateAnim]);

  // Progress bar animation
  useEffect(() => {
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress, progressAnim]);

  // Color scheme
  const primaryColor = isDark ? '#60a5fa' : '#3b82f6';
  const secondaryColor = isDark ? '#3b82f6' : '#2563eb';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const subTextColor = isDark ? '#9ca3af' : '#6b7280';

  // Render Default Loading (Pulse + Spinner)
  if (type === 'default') {
    return (
      <Center
        flex={1}
        bg="transparent"
      >
        <VStack space={6} alignItems="center">
          {/* Animated Spinner Container */}
          <Box style={{ position: 'relative', width: 80, height: 80 }}>
            {/* Pulse circles */}
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={`pulse-${index}`}
                style={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: primaryColor,
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3 - index * 0.1, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5 + index * 0.3],
                      }),
                    },
                  ],
                }}
              />
            ))}

            {/* Rotating spinner */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 80,
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Box
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 3,
                  borderColor: primaryColor,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                }}
              />
            </Animated.View>

            {/* Center icon */}
            <Box
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: primaryColor,
              }}
            />
          </Box>

          {/* Message */}
          <VStack space={2} alignItems="center">
            <Text
              fontSize="lg"
              fontFamily="Poppins-SemiBold"
              color={textColor}
              textAlign="center"
            >
              {message}
            </Text>
            {subMessage && (
              <Text
                fontSize="sm"
                fontFamily="Poppins-Light"
                color={subTextColor}
                textAlign="center"
              >
                {subMessage}
              </Text>
            )}
          </VStack>

          {/* Progress Bar */}
          {showProgress && (
            <VStack space={2} alignItems="center" style={{ width: 200 }}>
              <HStack space={2} alignItems="center" style={{ width: '100%' }}>
                <Text
                  fontSize="xs"
                  fontFamily="Poppins-Medium"
                  color={subTextColor}
                >
                  {Math.round(progress)}%
                </Text>
                <Box
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      height: '100%',
                      borderRadius: 3,
                      backgroundColor: primaryColor,
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    }}
                  />
                </Box>
              </HStack>
            </VStack>
          )}
        </VStack>
      </Center>
    );
  }

  // Render Pulse Type
  if (type === 'pulse') {
    return (
      <Center flex={1} bg="transparent">
        <VStack space={6} alignItems="center">
          {/* Pulse animation */}
          <Box style={{ position: 'relative', width: 100, height: 100 }}>
            {[0, 1, 2, 3].map((index) => (
              <Animated.View
                key={index}
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: primaryColor,
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4 - index * 0.1, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.8 + index * 0.2],
                      }),
                    },
                  ],
                }}
              />
            ))
            }

            {/* Center circle */}
            <Box
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: primaryColor,
                alignSelf: 'center',
                top: 30,
              }}
            />
          </Box>

          {/* Messages */}
          <VStack space={2} alignItems="center">
            <Text
              fontSize="lg"
              fontFamily="Poppins-SemiBold"
              color={textColor}
            >
              {message}
            </Text>
            {subMessage && (
              <Text
                fontSize="sm"
                fontFamily="Poppins-Light"
                color={subTextColor}
              >
                {subMessage}
              </Text>
            )}
          </VStack>

          {/* Progress */}
          {showProgress && (
            <Text
              fontSize="2xl"
              fontFamily="Poppins-Bold"
              color={primaryColor}
            >
              {Math.round(progress)}%
            </Text>
          )}
        </VStack>
      </Center>
    );
  }

  // Render Dots Type
  if (type === 'dots') {
    return (
      <Center flex={1} bg="transparent">
        <VStack space={6} alignItems="center">
          {/* Animated dots */}
          <HStack space={4}>
            {[dot1Anim, dot2Anim, dot3Anim].map((anim, index) => (
              <Animated.View
                key={index}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [secondaryColor, primaryColor],
                  }),
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                }}
              />
            ))}
          </HStack>

          {/* Messages */}
          <VStack space={2} alignItems="center">
            <Text
              fontSize="lg"
              fontFamily="Poppins-SemiBold"
              color={textColor}
            >
              {message}
            </Text>
            {subMessage && (
              <Text
                fontSize="sm"
                fontFamily="Poppins-Light"
                color={subTextColor}
              >
                {subMessage}
              </Text>
            )}
          </VStack>

          {/* Progress bar */}
          {showProgress && (
            <VStack space={2} alignItems="center" style={{ width: 200 }}>
              <Box
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: primaryColor,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </Box>
              <Text
                fontSize="sm"
                fontFamily="Poppins-Medium"
                color={subTextColor}
              >
                {Math.round(progress)}% selesai
              </Text>
            </VStack>
          )}
        </VStack>
      </Center>
    );
  }

  // Render Minimal/Compact Type (inline)
  return (
    <Center
      bg="transparent"
      p={6}
    >
      <VStack space={3} alignItems="center">
        <HStack space={3} alignItems="center">
          {/* Small spinner */}
          <Box style={{ position: 'relative', width: 24, height: 24 }}>
            <Animated.View
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: primaryColor,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                }}
              />
            </Animated.View>
          </Box>

          {/* Message */}
          <Text
            fontSize="sm"
            fontFamily="Poppins-Medium"
            color={textColor}
          >
            {message}
          </Text>
        </HStack>

        {/* Progress bar */}
        {showProgress && (
          <Box
            style={{
              width: 150,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: primaryColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </Box>
        )}
      </VStack>
    </Center>
  );
};

export default LoadingHauler;
