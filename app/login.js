import React, { useEffect, useState } from 'react';
import { TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Center, VStack, HStack, Image, Text } from 'native-base';
import { Sun1, Moon, UserSquare, Lock, CloseCircle, Eye, EyeSlash } from 'iconsax-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../src/store/slices/authSlice';
import { saveTheme } from '../src/store/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LoadingHauler } from '../src/components/common';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { error, loading, user } = useSelector(state => state.auth);
  const mode = useSelector(state => state.themes).value;
  const [colorScheme, setColorScheme] = useState(mode);
  const [errors, setErrors] = useState(null);
  const [userAuth, setUserAuth] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      setErrors(error);
    }
  }, [error]);

  const backgroundColor = colorScheme === 'dark' ? '#2f313e' : '#F5F5F5';
  const textColor = colorScheme === 'dark' ? '#F5F5F5' : '#2f313e';
  const inputBg = colorScheme === 'dark' ? '#3a3c4a' : '#ffffff';

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  const handleChangeScheme = async () => {
    const newMode = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newMode);
    dispatch(saveTheme(newMode));
  };

  const loginUserHandle = async () => {
    console.log('Login attempt:', userAuth);

    if (!userAuth.username) {
      setErrors('Username anda belum terisi...');
      return;
    }

    if (userAuth.username.length <= 2) {
      setErrors('Username anda harus lebih dari 2 karakter...');
      return;
    }

    if (!userAuth.password) {
      setErrors('Kata kunci (password) anda belum terisi...');
      return;
    }

    if (userAuth.password.length <= 5) {
      setErrors('Kata kunci anda harus lebih dari 5 karakter...');
      return;
    }

    setErrors(null);
    const result = await dispatch(login(userAuth));
    
    if (login.rejected.match(result)) {
      console.log('Login rejected:', result.payload);
    }
  };

  if (loading) {
    return (
      <VStack h="full" bg={backgroundColor}>
        <LoadingHauler />
      </VStack>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VStack h="full" bg={backgroundColor}>
          <HStack px={2} pt={5} h="70px" justifyContent="flex-end" alignItems="flex-end">
            <TouchableOpacity onPress={handleChangeScheme}>
              <HStack space={1} alignItems="center">
                {colorScheme === 'dark' ? (
                  <Sun1 size="25" color="#efb539" variant="Bold" />
                ) : (
                  <Moon size="25" color="#2f313e" variant="Bold" />
                )}
                <Text fontFamily="Quicksand-Regular" color={textColor}>
                  {colorScheme === 'dark' ? 'Light' : 'Dark'}
                </Text>
              </HStack>
            </TouchableOpacity>
          </HStack>

          <VStack flex={1} justifyContent="center">
            <Center>
              <Image
                source={require('../assets/images/icon.png')}
                alt="Logo"
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
              <Text
                fontSize={24}
                fontFamily="Quicksand-Bold"
                color={textColor}
                mt={4}
                mb={2}
              >
                Employee MKG
              </Text>
              <Text fontSize={14} fontFamily="Poppins-Light" color={textColor} mb={8}>
                Mobile Attendances Application
              </Text>

              <VStack w="80%" maxW="400px" space={4}>
                {errors && (
                  <HStack
                    p={3}
                    bg="error.100"
                    rounded="md"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text flex={1} fontSize={12} fontFamily="Poppins-Regular" color="error.600">
                      {errors}
                    </Text>
                    <TouchableOpacity onPress={() => setErrors(null)}>
                      <CloseCircle size="20" color="#dc2626" variant="Bold" />
                    </TouchableOpacity>
                  </HStack>
                )}

                <VStack space={2}>
                  <Text fontSize={14} fontFamily="Poppins-Regular" color={textColor}>
                    Username
                  </Text>
                  <HStack
                    p={3}
                    bg={inputBg}
                    rounded="md"
                    alignItems="center"
                    space={2}
                    borderWidth={1}
                    borderColor={colorScheme === 'dark' ? '#4a4c5a' : '#e5e7eb'}
                  >
                    <UserSquare size="24" color={textColor} variant="Bulk" />
                    <TextInput
                      placeholder="Masukkan username"
                      placeholderTextColor={colorScheme === 'dark' ? '#9a8f90' : '#6b7280'}
                      value={userAuth.username}
                      onChangeText={text => setUserAuth({ ...userAuth, username: text })}
                      style={{
                        flex: 1,
                        color: textColor,
                        fontFamily: 'Poppins-Regular',
                        fontSize: 14,
                      }}
                      autoCapitalize="none"
                    />
                  </HStack>
                </VStack>

                <VStack space={2}>
                  <Text fontSize={14} fontFamily="Poppins-Regular" color={textColor}>
                    Password
                  </Text>
                  <HStack
                    p={3}
                    bg={inputBg}
                    rounded="md"
                    alignItems="center"
                    space={2}
                    borderWidth={1}
                    borderColor={colorScheme === 'dark' ? '#4a4c5a' : '#e5e7eb'}
                  >
                    <Lock size="24" color={textColor} variant="Bulk" />
                    <TextInput
                      placeholder="Masukkan password"
                      placeholderTextColor={colorScheme === 'dark' ? '#9a8f90' : '#6b7280'}
                      value={userAuth.password}
                      onChangeText={text => setUserAuth({ ...userAuth, password: text })}
                      secureTextEntry={!showPassword}
                      style={{
                        flex: 1,
                        color: textColor,
                        fontFamily: 'Poppins-Regular',
                        fontSize: 14,
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <Eye size="24" color={textColor} variant="Bulk" />
                      ) : (
                        <EyeSlash size="24" color={textColor} variant="Bulk" />
                      )}
                    </TouchableOpacity>
                  </HStack>
                </VStack>

                <TouchableOpacity
                  onPress={loginUserHandle}
                  style={{
                    backgroundColor: '#b31e02',
                    padding: 16,
                    borderRadius: 8,
                    marginTop: 16,
                  }}
                >
                  <Text
                    textAlign="center"
                    fontSize={16}
                    fontFamily="Poppins-SemiBold"
                    color="#ffffff"
                  >
                    Login
                  </Text>
                </TouchableOpacity>
              </VStack>
            </Center>
          </VStack>

          <Center pb={4}>
            <Text fontSize={12} fontFamily="Poppins-Light" color={textColor}>
              Makkuraga Group © 2024
            </Text>
            <Text fontSize={10} fontFamily="Poppins-Light" color={textColor}>
              version {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </Center>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
