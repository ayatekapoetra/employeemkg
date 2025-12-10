import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, Animated } from 'react-native';
import { VStack, HStack, Text, Center, Progress } from 'native-base';
import { AppScreen } from './common';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Setting3,
  Timer1,
  Code,
  Lovely,
  MessageQuestion
} from 'iconsax-react-native';
import { COLORS } from '../constants/colors';

export default function ComingSoonTemplate({ 
  title, 
  emoji, 
  primaryColor, 
  backgroundColor: bgColor 
}) {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  
  const [progress] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const developmentStages = [
    { label: 'Planning', progress: 100, status: 'completed' },
    { label: 'Design', progress: 85, status: 'in-progress' },
    { label: 'Development', progress: 60, status: 'in-progress' },
    { label: 'Testing', progress: 30, status: 'pending' },
    { label: 'Release', progress: 0, status: 'pending' },
  ];

  const InfoCard = ({ icon, infoTitle, description }) => (
    <VStack bg={cardBg} p={4} rounded="xl" borderWidth={1} borderColor={borderColor} space={3}>
      <HStack space={3} alignItems="flex-start">
        <Center w={12} h={12} bg={mode === 'dark' ? '#374151' : '#f3f4f6'} rounded="xl">
          {icon}
        </Center>
        <VStack flex={1}>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
            {infoTitle}
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} mt={1} lineHeight={18}>
            {description}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
            {title}
          </Text>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space={6} p={4}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <VStack bg={bgColor} p={8} rounded="3xl" alignItems="center" space={4}>
                <Center w={32} h={32} bg="rgba(255,255,255,0.3)" rounded="full" mb={2}>
                  <Text fontSize="6xl">{emoji}</Text>
                </Center>
                <VStack alignItems="center" space={2}>
                  <Text fontSize="2xl" fontFamily="Quicksand-Bold" color={primaryColor} textAlign="center">
                    Segera Hadir!
                  </Text>
                  <Text fontSize="sm" fontFamily="Poppins-Light" color={primaryColor} textAlign="center" opacity={0.9}>
                    Fitur {title} sedang dalam pengembangan
                  </Text>
                </VStack>
                <HStack space={2} mt={2}>
                  {[0, 1, 2].map((i) => (
                    <Animated.View
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: primaryColor,
                        opacity: progress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: i === 0 ? [0.3, 1, 0.3] : i === 1 ? [1, 0.3, 1] : [0.3, 1, 0.3],
                        }),
                      }}
                    />
                  ))}
                </HStack>
              </VStack>
            </Animated.View>

            <VStack bg={cardBg} p={5} rounded="2xl" borderWidth={1} borderColor={borderColor} space={4}>
              <HStack space={3} alignItems="center">
                <Center w={12} h={12} bg={mode === 'dark' ? '#374151' : '#f3f4f6'} rounded="xl">
                  <Code size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                </Center>
                <VStack flex={1}>
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                    Status Pengembangan
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Tahapan development saat ini
                  </Text>
                </VStack>
              </HStack>
              <VStack space={3}>
                {developmentStages.map((stage, index) => (
                  <VStack key={index} space={2}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space={2} alignItems="center">
                        <Center
                          w={6}
                          h={6}
                          bg={
                            stage.status === 'completed' ? '#10b981' :
                            stage.status === 'in-progress' ? '#f59e0b' :
                            mode === 'dark' ? '#374151' : '#e5e7eb'
                          }
                          rounded="full"
                        >
                          <Text fontSize="xs" fontFamily="Quicksand-Bold" color="#ffffff">
                            {stage.status === 'completed' ? '✓' : index + 1}
                          </Text>
                        </Center>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={stage.status === 'pending' ? subtitleColor : textColor}>
                          {stage.label}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="xs"
                        fontFamily="Poppins-Light"
                        color={
                          stage.status === 'completed' ? '#10b981' :
                          stage.status === 'in-progress' ? '#f59e0b' :
                          subtitleColor
                        }
                      >
                        {stage.progress}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stage.progress}
                      bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
                      _filledTrack={{
                        bg: stage.status === 'completed' ? '#10b981' :
                            stage.status === 'in-progress' ? '#f59e0b' :
                            mode === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                      rounded="full"
                      size="xs"
                    />
                  </VStack>
                ))}
              </VStack>
            </VStack>

            <VStack space={3}>
              <InfoCard
                icon={<Timer1 size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />}
                infoTitle="Estimasi Waktu"
                description="Fitur ini diperkirakan akan tersedia dalam beberapa minggu ke depan"
              />
              <InfoCard
                icon={<Setting3 size={24} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />}
                infoTitle="Dalam Pengembangan"
                description="Tim developer kami sedang bekerja keras untuk menghadirkan fitur terbaik untuk Anda"
              />
              <InfoCard
                icon={<Lovely size={24} color={mode === 'dark' ? '#ec4899' : '#db2777'} variant="Bold" />}
                infoTitle="Terima Kasih"
                description="Kami menghargai kesabaran Anda. Nantikan update selanjutnya!"
              />
            </VStack>

            <VStack bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'} p={5} rounded="2xl" borderWidth={1} borderColor={mode === 'dark' ? '#3b82f6' : '#93c5fd'} space={3}>
              <HStack space={3} alignItems="center">
                <MessageQuestion size={24} color={mode === 'dark' ? '#93c5fd' : '#1e40af'} variant="Bold" />
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#dbeafe' : '#1e3a8a'}>
                  Punya Pertanyaan?
                </Text>
              </HStack>
              <Text fontSize="sm" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'} lineHeight={22}>
                Jika Anda memiliki pertanyaan atau saran tentang fitur ini, silakan hubungi tim support kami atau kirim feedback melalui menu pengaturan.
              </Text>
            </VStack>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                Kembali ke Pengaturan
              </Text>
            </TouchableOpacity>

            <VStack h={6} />
          </VStack>
        </ScrollView>
      </VStack>
    </AppScreen>
  );
}
