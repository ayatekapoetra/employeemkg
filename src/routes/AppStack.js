import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect } from 'react'
import apiFetch from '../helpers/ApiFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Setting2, CalendarSearch, Ankr } from 'iconsax-react-native';

import HomeScreen from '../pages/HomeScreen'
import LoginPage from '../pages/_auth/LoginPage'

import SettingPage from '../pages/setting'
import RiwayatAbsensiBulananPage from '../pages/riwayat-kehadiran-bulanan'
import RiwayatChecklogHarianPage from '../pages/riwayat-checklog-harian'
import ShowAbsensiDetails from '../pages/riwayat-checklog-harian/showAbsensi'

import ChecklogPage from '../pages/checklog-kehadiran-karyawan'
import RiwayatAbsensiToday from '../pages/checklog-kehadiran-karyawan/riwayatToday'
import PermintaanPage from '../pages/permintaan-absensi-karyawan'
import CreateFormSakit from '../pages/permintaan-absensi-karyawan/informasi-sakit/create'
import ShowFormSakit from '../pages/permintaan-absensi-karyawan/informasi-sakit/show'
import CreateFormCuti from '../pages/permintaan-absensi-karyawan/request-cuti/create';
import ShowFormCuti from '../pages/permintaan-absensi-karyawan/request-cuti/show';
import CreateFormAlpha from '../pages/permintaan-absensi-karyawan/request-izin/create';
import ShowFormAlpha from '../pages/permintaan-absensi-karyawan/request-izin/show';
import AbsenTulisPage from '../pages/absen-tulis-karyawan';
import ApprovalPage from '../pages/approval-data-karyawan';

import PerintahLemburPage from '../pages/perintah-lembur-karyawan';
import CreatePerintahLembur from '../pages/perintah-lembur-karyawan/createPerintahLembur';
import ShowPerintahLembur from '../pages/perintah-lembur-karyawan/showPerintahLembur';
import CreateAktualKerja from '../pages/absen-tulis-karyawan/createAktualKerja';
import ShowAktualKerja from '../pages/absen-tulis-karyawan/showAktualKerja';
import UserProfile from '../pages/setting/userProfile';
import ResetUserDevice from '../pages/setting/resetDevice';
import UbahPassword from '../pages/setting/ubahPassword';
import NotificationApps from '../pages/setting/notificationApps';
import InternalMemo from '../pages/setting/internalMemo';
import GagalKirim from '../pages/setting/gagalKirim';
import UnderDevelopmentScreen from '../components/UnderDevelopment';
import AuthorizedBlockScreen from '../components/AuthorizedBlock';

// APPROVAL
import ApprovalChecklogHarian from '../pages/approval-data-karyawan/approval-checklog-kehadiran';
import ShowApprovalChecklog from '../pages/approval-data-karyawan/approval-checklog-kehadiran/showItem';
import ApprovalAbsenTulis from '../pages/approval-data-karyawan/approval-absen-tulis';
import ShowApprovalAbsenTulis from '../pages/approval-data-karyawan/approval-absen-tulis/showItem';
import ApprovalTimesheetPengawas from '../pages/approval-data-karyawan/approval-timesheet-pengawas';
import ShowApprovalTimesheet from '../pages/approval-data-karyawan/approval-timesheet-pengawas/showItem';
import ApprovalIzinSakit from '../pages/approval-data-karyawan/approval-izin-sakit';
import ShowApprovalIzinSakit from '../pages/approval-data-karyawan/approval-izin-sakit/showItem';
import ApprovalLemburKaryawan from '../pages/approval-data-karyawan/approval-lembur';
import ShowApprovalLemburKaryawan from '../pages/approval-data-karyawan/approval-lembur/showItem';

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
            <Stack.Screen name="Approval" component={ApprovalPage} options={{headerShown: false}}/>
            <Stack.Screen name="Riwayat-Absensi" component={RiwayatAbsensiBulananPage} options={{headerShown: false}}/>
            <Stack.Screen name="Checklog-Absensi" component={ChecklogPage} options={{headerShown: false}}/>
            <Stack.Screen name="Absensi-Tulis" component={AbsenTulisPage} options={{headerShown: false}}/>
            <Stack.Screen name="Checklog-Absensi-Riwayat" component={RiwayatAbsensiToday} options={{headerShown: false}}/>
            <Stack.Screen name="Permintaan" component={PermintaanPage} options={{headerShown: false}}/>
            <Stack.Screen name="Perintah-Lembur" component={PerintahLemburPage} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Perintah-Lembur" component={CreatePerintahLembur} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Perintah-Lembur" component={ShowPerintahLembur} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Permintaan-Sakit" component={CreateFormSakit} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Permintaan-Sakit" component={ShowFormSakit} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Permintaan-Cuti" component={CreateFormCuti} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Permintaan-Cuti" component={ShowFormCuti} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Permintaan-Alpha" component={CreateFormAlpha} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Permintaan-Alpha" component={ShowFormAlpha} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Kehadiran-Details" component={ShowAbsensiDetails} options={{headerShown: false}}/>
            <Stack.Screen name="Create-Aktual-Kerja" component={CreateAktualKerja} options={{headerShown: false}}/>
            <Stack.Screen name="Show-Aktual-Kerja" component={ShowAktualKerja} options={{headerShown: false}}/>
            <Stack.Screen name="Reset-User-Devices" component={ResetUserDevice} options={{headerShown: false}}/>
            <Stack.Screen name="Keamanan-Akun" component={UbahPassword} options={{headerShown: false}}/>
            <Stack.Screen name="notifikasi-screen" component={NotificationApps} options={{headerShown: false}}/>
            <Stack.Screen name="internal-memo-screen" component={InternalMemo} options={{headerShown: false}}/>
            <Stack.Screen name="unsending-screen" component={GagalKirim} options={{headerShown: false}}/>
            <Stack.Screen name="unauthorized-screen" component={AuthorizedBlockScreen} options={{headerShown: false}}/>
            <Stack.Screen name="under-development-screen" component={UnderDevelopmentScreen} options={{headerShown: false}}/>
            {/* APPROVAL */}
            <Stack.Screen name="approval-checklog-harian" component={ApprovalChecklogHarian} options={{headerShown: false}}/>
            <Stack.Screen name="approval-checklog-harian-details" component={ShowApprovalChecklog} options={{headerShown: false}}/>
            <Stack.Screen name="approval-absen-tulis" component={ApprovalAbsenTulis} options={{headerShown: false}}/>
            <Stack.Screen name="approval-absen-tulis-details" component={ShowApprovalAbsenTulis} options={{headerShown: false}}/>
            <Stack.Screen name="approval-timesheet-pengawas" component={ApprovalTimesheetPengawas} options={{headerShown: false}}/>
            <Stack.Screen name="approval-timesheet-pengawas-details" component={ShowApprovalTimesheet} options={{headerShown: false}}/>
            <Stack.Screen name="approval-lembur-karyawan" component={ApprovalLemburKaryawan} options={{headerShown: false}}/>
            <Stack.Screen name="approval-lembur-karyawan-details" component={ShowApprovalLemburKaryawan} options={{headerShown: false}}/>
            <Stack.Screen name="approval-izin-sakit" component={ApprovalIzinSakit} options={{headerShown: false}}/>
            <Stack.Screen name="approval-izin-sakit-details" component={ShowApprovalIzinSakit} options={{headerShown: false}}/>
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
                component={RiwayatChecklogHarianPage} 
                options={{
                    tabBarLabel: "absensi",
                    headerShown: false,
                    // tabBarShowLabel: false,
                    tabBarActiveTintColor: '#FFF',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<CalendarSearch size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
            <HomeTab.Screen 
                name="home-tab" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: "beranda",
                    headerShown: false,
                    // tabBarShowLabel: false,
                    tabBarActiveTintColor: '#FFF',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<Ankr size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
            <HomeTab.Screen 
                name="setting-tab" 
                component={SettingPage} 
                options={{
                    tabBarLabel: "setting",
                    headerShown: false,
                    // tabBarShowLabel: false,
                    tabBarActiveTintColor: '#FFF',
                    tabBarStyle: {backgroundColor: theme.value === "dark"?"#2f313e":"#F5F5F5"},
                    tabBarIcon: ({ color }) => (<Setting2 size="32" color={theme.value === "dark"?"#C4C4C4":"#2297ff"} />)
                }}/>
        </HomeTab.Navigator>
    )
}