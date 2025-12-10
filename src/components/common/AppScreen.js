import { VStack, useColorMode } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';

const AppScreen = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = colorMode == 'dark';
  // const backgroundColor = !isDark ? '#2f313e' : '#F5F5F5';
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: backgroundColor,
      }}
    >
      <VStack flex={1} bg={backgroundColor} {...props}>
        {children}
      </VStack>
    </SafeAreaView>
  );
};

export default AppScreen;
