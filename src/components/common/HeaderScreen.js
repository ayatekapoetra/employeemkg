import React from 'react';
import { HStack, Text, IconButton, useColorMode, StatusBar } from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Notification } from 'iconsax-react-native';

const HeaderScreen = ({ 
  title, 
  onBack, 
  onThemes = false, 
  onNotification = false,
  showBack = false 
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <HStack
        px={4}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        bg={isDark ? '#2f313e' : '#F5F5F5'}
        borderBottomWidth={1}
        borderBottomColor={isDark ? '#3a3c4a' : '#e0e0e0'}
      >
        <HStack alignItems="center" flex={1}>
          {(showBack || onBack) && (
            <IconButton
              icon={
                <ArrowLeft
                  size={24}
                  color={isDark ? '#F5F5F5' : '#2f313e'}
                />
              }
              onPress={handleBack}
              mr={2}
            />
          )}
          <Text
            fontSize="xl"
            fontFamily="Quicksand-Bold"
            color={isDark ? '#F5F5F5' : '#2f313e'}
          >
            {title}
          </Text>
        </HStack>

        <HStack space={2}>
          {onNotification && (
            <IconButton
              icon={
                <Notification
                  size={24}
                  color={isDark ? '#F5F5F5' : '#2f313e'}
                />
              }
              onPress={() => router.push('/notifications')}
            />
          )}
          {onThemes && (
            <IconButton
              icon={
                isDark ? (
                  <Sun size={24} color="#f09d27" variant="Bulk" />
                ) : (
                  <Moon size={24} color="#b31e02" variant="Bulk" />
                )
              }
              onPress={toggleColorMode}
            />
          )}
        </HStack>
      </HStack>
    </>
  );
};

export default HeaderScreen;
