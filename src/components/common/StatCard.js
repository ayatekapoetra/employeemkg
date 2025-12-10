import { VStack, Text } from 'native-base';
import { View, Image } from 'react-native';

const StatCard = ({ 
  icon, 
  label, 
  value,
  iconBgColor,
  textColor,
  mode = 'light',
  useImage = false
}) => {
  return (
    <VStack alignItems="center" space={2} flex={1}>
      <View
        style={{
          backgroundColor: iconBgColor || (mode === 'dark' ? '#374151' : '#e5e7eb'),
          padding: 16,
          borderRadius: 16,
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {useImage ? (
          <Image
            source={icon}
            resizeMode="contain"
            style={{ width: 48, height: 48 }}
          />
        ) : (
          icon
        )}
      </View>
      
      <Text
        fontSize="sm"
        fontFamily="Poppins-Light"
        color={textColor || (mode === 'dark' ? '#9ca3af' : '#6b7280')}
        textAlign="center"
      >
        {label}
      </Text>
      
      <Text
        fontSize="3xl"
        fontFamily="Quicksand-Bold"
        color={mode === 'dark' ? '#ffffff' : '#2f313e'}
      >
        {value}
      </Text>
    </VStack>
  );
};

export default StatCard;
