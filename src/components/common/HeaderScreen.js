import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Notification, Sun1, Filter } from 'iconsax-react-native';
import { HStack, IconButton, StatusBar, Text } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';

const HeaderScreen = ({ 
  title, 
  onBack, 
  onThemes = false, 
  onNotification = false,
  onFilter,
  showBack = false 
}) => {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = mode === 'dark';
  const router = useRouter();
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

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
        py={2}
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
            fontFamily="Teko-Bold"
            color={isDark ? '#F5F5F5' : '#2f313e'}
          >
            {title}
          </Text>
        </HStack>

        <HStack space={1}>
          {onThemes && (
            <IconButton
              icon={
                isDark ? (
                  <Sun1 size={24} color="#f09d27" variant="Bold" />
                ) : (
                  <Moon size={24} color="#b31e02" variant="Bulk" />
                )
              }
              onPress={handleToggleTheme}
            />
          )}
          {onFilter && (
            <IconButton
              icon={
                <Filter
                  size={24}
                  variant="Bold"
                  color={isDark ? '#F5F5F5' : '#2f313e'}
                />
              }
              onPress={onFilter}
            />
          )}
          {onNotification && (
            <IconButton
              icon={
                <Notification
                  size={24}
                  variant="Bulk"
                  color={isDark ? '#F5F5F5' : '#2f313e'}
                />
              }
              onPress={() => router.push('/notifications')}
            />
          )}
        </HStack>
      </HStack>
    </>
  );
};

export default HeaderScreen;
