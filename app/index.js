import { Redirect } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { restoreSession } from '../src/store/slices/authSlice';

export default function Index() {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector(state => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await dispatch(restoreSession());
      setIsChecking(false);
    };
    
    checkAuth();
  }, [dispatch]);

  if (isChecking || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
