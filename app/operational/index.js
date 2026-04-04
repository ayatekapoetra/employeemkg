import moment from 'moment';
import 'moment/locale/id';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { VStack, HStack, ScrollView, Text, Center, Image } from 'native-base';
import { View, Dimensions, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../src/components/common';
import StatCard from '../../src/components/common/StatCard';
import { COLORS } from '../../src/constants/colors';

export default function OperationalFiturScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);


    const mode = useSelector(state => state.themes)?.value || 'light';

    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const iconColor = mode === 'dark' ? '#9a8f90' : '#b31e02';
    const cardBg = mode === 'dark' ? '#3a3c4a' : '#ffffff';
    const cardBorder = mode === 'dark' ? '#5e5f6cff' : '#e5e7eb';
    const cardShadow = mode === 'dark' ? '#1a1b24' : '#d1d5db';


    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 3000);
    };

    return(
        <AppScreen>
            <HeaderScreen 
                title="Fitur Operational" 
                onBack={() => router.back()}
                onThemes={true}
                onNotification={true}
            />
            <ScrollView 
                flex={1} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={mode === 'dark' ? '#60a5fa' : '#3b82f6'}
                    />
                }>
                <VStack flex={1} bg={backgroundColor}>
                    {
                        ListMenu.map( elm => {
                            return (
                                <TouchableOpacity key={elm.id} onPress={() => router.push(elm.routePath)}>
                                    <HStack 
                                        p={3}
                                        mx={3}
                                        mt={2}
                                        space={3} 
                                        rounded="xl"
                                        bg={cardBg}
                                        borderWidth={1}
                                        borderColor={cardBorder}
                                        shadow={2}
                                        flex={1}
                                        justifyContent="flex-start" 
                                        alignItems="center"
                                        style={{
                                            shadowColor: cardShadow,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }}>
                                            <VStack justifyContent={"flex-start"} alignItems={"flex-start"}>
                                                <Text
                                                    color={textColor}
                                                    textAlign="center"
                                                    fontFamily="Quicksand-SemiBold">
                                                    {elm.title}
                                                </Text>
                                                <Text
                                                    fontSize={11}
                                                    color={textColor}
                                                    textAlign="left"
                                                    fontFamily="Quicksand-Regular">
                                                    {elm.subtitle}
                                                </Text>
                                            </VStack>
                                    </HStack>
                                </TouchableOpacity>
                            )
                        })
                    }
                    
                </VStack>
            </ScrollView>
        </AppScreen>
    )
}

const ListMenu = [
    {
        id: 1,
        title: "Daily Breakdown",
        subtitle: "Pencatatan data breakdown harian setiap equipment",
        routePath: '/operational/daily-breakdown'
    },
    {
        id: 2,
        title: "Work Order",
        subtitle: "Pencatatan data work order harian setiap equipment",
        routePath: '/operational/work-order'
    },
    {
        id: 3,
        title: "Equipment Activity Plan",
        subtitle: "Pencatatan data harian rencana aktifitas kerja equipment",
        routePath: '/operational/equipment-plan'
    },
    {
        id: 4,
        title: "Crew Work Activity",
        subtitle: "Pencatatan data harian absensi dan kegiatan harian crew \n#Absen Tulis",
        routePath: '/operational/crew-worksheet'
    },
    {
        id: 5,
        title: "Daily Events",
        subtitle: "Pencatatan dan monitoring kejadian harian selama operasional\n#Hujan #Jalan Licin dll",
        routePath: '/operational/daily-events'
    },
]
