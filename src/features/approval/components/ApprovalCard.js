import { TouchableOpacity, Image } from 'react-native';
import { VStack, HStack, Text, Badge } from 'native-base';

const ApprovalCard = ({ 
  title, 
  description, 
  icon, 
  count = 0, 
  detailCount,
  onPress, 
  backgroundColor, 
  iconBgColor,
  textColor,
  mode = 'light'
}) => {
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const cardShadow = mode === 'dark' ? '#000000' : '#000000';

  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <VStack
        bg={backgroundColor || cardBg}
        p={5}
        rounded="2xl"
        borderWidth={1}
        borderColor={cardBorder}
        shadow={3}
        space={3}
        style={{
          shadowColor: cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack
            bg={iconBgColor || (mode === 'dark' ? '#5e5f6cff' : '#fef3e2')}
            p={4}
            rounded="xl"
          >
            <Image
              source={icon}
              resizeMode="contain"
              style={{ width: 48, height: 48 }}
            />
          </VStack>
          
          {count > 0 && (
            <Badge
              colorScheme="danger"
              rounded="full"
              variant="solid"
              _text={{
                fontSize: 12,
                fontFamily: 'Quicksand-Bold',
              }}
              px={2.5}
              py={0.5}
            >
              {count}
            </Badge>
          )}
        </HStack>

        <VStack space={1}>
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color={textColor}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Light"
            color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
            numberOfLines={2}
          >
            {description}
          </Text>
        </VStack>

        {count > 0 && (
          <VStack space={1}>
            <HStack alignItems="center" space={1}>
              <Text
                fontSize="xs"
                fontFamily="Quicksand-SemiBold"
                color={mode === 'dark' ? '#fbbf24' : '#f59e0b'}
              >
                {count} menunggu persetujuan
              </Text>
            </HStack>
            {detailCount && (
              <Text
                fontSize="xs"
                fontFamily="Poppins-Light"
                color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                {detailCount}
              </Text>
            )}
          </VStack>
        )}
      </VStack>
    </TouchableOpacity>
  );
};

export default ApprovalCard;
