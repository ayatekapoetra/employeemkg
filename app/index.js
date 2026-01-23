import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreSession } from '../src/store/slices/authSlice';

export default function Index() {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const { user, token } = useSelector(state => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');

        // Cek token di AsyncStorage
        const storedToken = await AsyncStorage.getItem('@token');
        console.log('📦 Token in AsyncStorage:', !!storedToken);

        if (storedToken) {
          // Token ada, restore session dari Redux
          console.log('🔄 Token found, restoring session...');
          const result = await dispatch(restoreSession());

          if (restoreSession.fulfilled.match(result)) {
            console.log('✅ Session restored successfully');
            console.log('👤 User:', result.payload?.user?.username);
            setHasToken(true);
          } else {
            console.log('❌ Restore session failed:', result.payload);
            // Token invalid or corrupted, clear it
            await AsyncStorage.removeItem('@token');
            await AsyncStorage.removeItem('@user');
            await AsyncStorage.removeItem('@employee');
            setHasToken(false);
          }
        } else {
          console.log('⚠️ No token found');
          setHasToken(false);
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
        setHasToken(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Jika sudah ada user di Redux state, langsung redirect
  useEffect(() => {
    if (user && token && !isChecking) {
      console.log('✅ User already authenticated, redirecting to home...');
      // Redirect will happen via hasToken state
    }
  }, [user, token, isChecking]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasToken) {
    console.log('🔓 No token, redirecting to login...');
    return <Redirect href="/login" />;
  }

  console.log('🏠 Redirecting to home...');
  return <Redirect href="/(tabs)/home" />;
}
