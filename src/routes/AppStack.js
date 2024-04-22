import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { Setting2, CalendarSearch, Ankr, Lock } from 'iconsax-react-native';

import HomeScreen from '../pages/HomeScreen'
import LoginPage from '../pages/auth/LoginPage'

import SettingPage from '../pages/setting'
import RiwayatAbsensiPage from '../pages/riwayat-kehadiran'
import PerintahLemburPage from '../pages/spl'
import ChecklogPage from '../pages/checklog'
import PermintaanPage from '../pages/permintaan'
import CreateFormSakit from '../pages/permintaan/informasi-sakit/create'
import ShowFormSakit from '../pages/permintaan/informasi-sakit/show'


const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Login" component={LoginPage} options={{headerShown: false}}/>
      <Stack.Screen name="Home" component={HomeInitialTab} options={{headerShown: false}}/>
      <Stack.Screen name="Riwayat-Absensi" component={RiwayatAbsensiPage} options={{headerShown: false}}/>
      <Stack.Screen name="Checklog-Absensi" component={ChecklogPage} options={{headerShown: false}}/>
      <Stack.Screen name="Permintaan" component={PermintaanPage} options={{headerShown: false}}/>
      <Stack.Screen name="Permintaan-Create-Sakit" component={CreateFormSakit} options={{headerShown: false}}/>
      <Stack.Screen name="Permintaan-Show-Sakit" component={ShowFormSakit} options={{headerShown: false}}/>
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
                component={PerintahLemburPage} 
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