import { FlatList } from 'react-native'
import React from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { useSelector } from 'react-redux'
import { BitcoinConvert, BrifecaseTimer, EmptyWalletTime, Hospital, NoteFavorite, Personalcard, ShieldTick, ShoppingCart, TimerStart, TruckTime } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import BtnListApproval from './btnListApproval'

const ApprovalPage = () => {
    const mode = useSelector(state => state.themes.value)
    const state = [
        {
            id: 1,
            title: 'Approval Timesheet',
            subtitle: 'Form persetujuan timesheet operator dan driver',
            icon: <BrifecaseTimer size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-timesheet-pengawas',
            authorized: 'segment'
        },
        {
            id: 2,
            title: 'Approval Checklog Kehadiran',
            subtitle: 'Form persetujuan insentif kehadiran dari checklog',
            icon: <TimerStart size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-checklog-harian',
            authorized: 'all'
        },
        {
            id: 3,
            title: 'Approval Absensi Tulis',
            subtitle: 'Form persetujuan aktual kerja dari absen tulis',
            icon: <Personalcard size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-absen-tulis',
            authorized: 'all'
        },
        {
            id: 4,
            title: 'Approval Lembur',
            subtitle: 'Form persetujuan surat perintah lembur karyawan',
            icon: <EmptyWalletTime size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-lembur-karyawan',
            authorized: 'segment'
        },
        {
            id: 5,
            title: 'Approval Izin Sakit',
            subtitle: 'Form persetujuan surat izin sakit karyawan',
            icon: <Hospital size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-izin-sakit',
            authorized: 'segment'
        },
        {
            id: 6,
            title: 'Approval Izin Cuti',
            subtitle: 'Form persetujuan surat izin cuti karyawan',
            icon: <NoteFavorite size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: '',
            authorized: 'segment'
        },
        {
            id: 7,
            title: 'Approval Izin Alpha',
            subtitle: 'Form persetujuan surat izin alpha karyawan',
            icon: <ShieldTick size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: '',
            authorized: 'segment'
        },
        {
            id: 8,
            title: 'Approval Purchase Request',
            subtitle: 'Form approval purchasing request',
            icon: <ShoppingCart size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-purchase-request',
            authorized: 'segment'
        },
        {
            id: 9,
            title: 'Approval Pengajuan Dana',
            subtitle: 'Form approval pengajuan dana',
            icon: <BitcoinConvert size="32" color={appcolor.ico[mode][5]} variant="Bulk"/>,
            uri: 'approval-pengajuan-dana',
            authorized: 'user'
        },
    ]

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Approval Data"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack px={3} mt={2} flex={1}>
                    <FlatList 
                        data={state} 
                        showsVerticalScrollIndicator={false}
                        renderItem={({item}) => <BtnListApproval mode={mode} item={item}/>} 
                        keyExtractor={item => item.id}/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ApprovalPage

