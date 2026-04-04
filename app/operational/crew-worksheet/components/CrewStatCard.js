import React from 'react';
import { VStack, HStack, Text, Box } from 'native-base';
import { View, Dimensions } from 'react-native';

const CrewStatCard = ({ 
    title, 
    value, 
    icon, 
    iconColor = '#3b82f6',
    cardBg = '#ffffff',
    textColor = '#1f2937',
    mode = 'light',
    width
}) => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = width || screenWidth * 0.28;
    const isSmall = screenWidth < 375;
    
    return (
        <View
            style={[
                {
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    padding: isSmall ? 10 : 12,
                    width: cardWidth,
                    height: isSmall ? 65 : 75,
                    elevation: 2,
                    shadowColor: mode === 'dark' ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: mode === 'dark' ? 0.2 : 0.08,
                    shadowRadius: 3,
                    borderWidth: 0,
                }
            ]}>
            <VStack space={isSmall ? 0.5 : 1} justifyContent="space-between" flex={1}>
                {/* Icon and Title */}
                <HStack space={isSmall ? 1.5 : 2} alignItems="center">
                    {icon && (
                        <View
                            style={{
                                width: isSmall ? 24 : 28,
                                height: isSmall ? 24 : 28,
                                borderRadius: isSmall ? 12 : 14,
                                backgroundColor: iconColor + '20',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: iconColor + '10'
                            }}>
                            <Text
                                style={{
                                    color: iconColor,
                                    fontSize: isSmall ? 12 : 14,
                                    fontFamily: 'Quicksand-Bold'
                                }}>
                                {icon}
                            </Text>
                        </View>
                    )}
                    <VStack flex={1}>
                        <Text
                            style={{
                                color: textColor + '80', // Add opacity
                                fontSize: isSmall ? 9 : 10,
                                fontFamily: 'Quicksand-Medium',
                                lineHeight: isSmall ? 12 : 14
                            }}>
                            {title}
                        </Text>
                    </VStack>
                </HStack>
                
                {/* Value */}
                <View style={{ marginLeft: icon ? (isSmall ? 28 : 34) : 0 }}>
                    <Text
                        style={{
                            color: textColor,
                            fontSize: isSmall ? 16 : 18,
                            fontFamily: 'Quicksand-Bold',
                            lineHeight: isSmall ? 20 : 22,
                            textShadowColor: iconColor + '10',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2
                        }}>
                        {value}
                    </Text>
                </View>
                
                {/* Decorative Accent */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: isSmall ? 16 : 18,
                        height: isSmall ? 16 : 18,
                        borderRadius: isSmall ? 8 : 9,
                        backgroundColor: iconColor + '10',
                        borderTopLeftRadius: 0,
                        borderBottomRightRadius: 16
                    }}
                />
            </VStack>
        </View>
    );
};

export default CrewStatCard;