import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect } from 'react'
import apiFetch from '../helpers/ApiFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Setting2, CalendarSearch, Ankr } from 'iconsax-react-native';

import HomeScreen from '../pages/HomeScreen'
import LoginPage from '../pages/auth/LoginPage'

import SettingPage from '../pages/setting'
import RiwayatAbsensiPage from '../pages/riwayat-kehadiran'
import ApprovalAbsensiPage from '../pages/approval-checklog'
import ShowAbsensiDetails from '../pages/approval-checklog/showAbsensi'
import ChecklogPage from '../pages/checklog'
import RiwayatAbsensiToday from '../pages/checklog/riwayatToday'
import PermintaanPage from '../pages/permintaan'
import CreateFormSakit from '../pages/permintaan/informasi-sakit/create'
import ShowFormSakit from '../pages/permintaan/informasi-sakit/show'
import PerintahLemburPage from '../pages/perintah-lembur';
import CreatePerintahLembur from '../pages/perintah-lembur/createPerintahLembur';
import ShowPerintahLembur from '../pages/perintah-lembur/showPerintahLembur';
import CreateAktualKerja from '../pages/approval-checklog/createAktualKerja';
import ShowAktualKerja from '../pages/approval-checklog/showAktualKerja';
import UserProfile from '../pages/setting/userProfile';
import { applyAlert } from '../redux/alertSlice';


const Stack = createStackNavigator();

export default function AppStack() {
    const dispatch = useDispatch()

    useEffect(() => {
        getDataKaryawan()
        getDataLokasiAbsensi()
    }, [])

    const getDataKaryawan = async () => {
        try {
            const resp = await apiFetch.get("karyawan")
            await AsyncStorage.setItem('@karyawan', JSON.stringify(resp?.data?.data || []))
        } catch (error) {
            console.log(error);
        }
    }

    const getDataLokasiAbsensi = async () => {
        try {
            const resp = await apiFetch.get("mobile/lokasi-checklog")
            await AsyncStorage.setItem('@lokasi-absensi', JSON.stringify(resp?.data?.data || []))
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "ERR_CONNECTION",
                subtitle: "Anda tidak terkoneksi ke internet..."
            }))
        }
    }

    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Login" component={LoginPage} options={{headerShown: false}}/>
            <Stack.Screen name="Home" component={HomeInitialTab} options={{headerShown: false}}/>
            <Stack.Screen name="Profile" component={UserProfile} options={{headerShown: false}}/>
            <Stack.Screen name="Riwayat-Absensi" component={RiwayatAbsensiPage} options={{headerShown: false}}/>
            <Stack.Screen name="Checklog-Absensi" component={ChecklogPage} options={{headerShown: false}}/>
            <Stack.Screen name="Checklog-Absensi-Riwayat" component={RiwayatAbsensiToday} options={{headerShown: false}}/>
            <Stack.Screen name="Permintaan" component={PermintaanPage} options={{headerShown: false}}/>
            <Stack.Screen name="Perintah-Lembur" component={PerintahLemburPage} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Perintah-Lembur" component={CreatePerintahLembur} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Perintah-Lembur" component={ShowPerintahLembur} options={{headerShown: false}}/>
            <Stack.Screen name="Permintaan-Create-Sakit" component={CreateFormSakit} options={{headerShown: false}}/>
            <Stack.Screen name="Permintaan-Show-Sakit" component={ShowFormSakit} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Kehadiran-Details" component={ShowAbsensiDetails} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Aktual-Kerja" component={CreateAktualKerja} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Aktual-Kerja" component={ShowAktualKerja} options={{headerShown: false}}/>
        </Stack.Navigator>
    );
}

const HomeTab = createBottomTabNavigator();
function HomeInitialTab () {
    const theme = useSelector(state => state.themes)
    return (
        <HomeTab.Navigator initialRouteName="home-tab">
            <HomeTab.Screen 
                name="spl-tab" 
                component={ApprovalAbsensiPage} 
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: 'blue',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<CalendarSearch size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
            <HomeTab.Screen 
                name="home-tab" 
                component={HomeScreen} 
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: 'blue',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<Ankr size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
            <HomeTab.Screen 
                name="setting-tab" 
                component={SettingPage} 
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: 'blue',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<Setting2 size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
        </HomeTab.Navigator>
    )
}