import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, HStack, Text, Button } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import themeManager from '../../common/themeScheme'
import { applyTheme } from '../../redux/themeSlice'
import AppScreen from '../../components/AppScreen'
import ListPerintahLembur from './listAktualKerja'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { ArchiveTick, NoteFavorite } from 'iconsax-react-native'
import ListAbsensi from './listAbsensi'
import ListAktualKerja from './listAktualKerja'

const ApprovalAbsensiPage = () => {
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const [ mode, setMode ] = useState(themes.value)
    const [ sheet, setSheet ] = useState({absensi: true, lembur: false})
    const [ filterAbsensi, setFilterAbsensi ] = useState(false)
    const [ filterAktualKerja, setFilterAktualKerja ] = useState(false)

    useEffect(() => {
        initialScheme()
    }, [])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
        setMode(initMode)
    }

    const onSheetHandle = (field) => {
        setFilterAbsensi(false)
        setFilterAktualKerja(false)
        
        if(field === 'absensi'){
            setSheet({absensi: true, lembur: false})
        }else{
            setSheet({absensi: false, lembur: true})
        }
        
    }

    const onFilterHandle = () => {
        if(sheet.absensi){
            console.log('absensi');
            setFilterAbsensi(!filterAbsensi)
            setFilterAktualKerja(false)
        }

        if(sheet.lembur){
            console.log('aktual kerja');
            setFilterAktualKerja(!filterAktualKerja)
            setFilterAbsensi(false)
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Absensi & Perintah Lembur"} onThemes={true} onFilter={onFilterHandle} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack my={2} h={"50px"} space={2} justifyContent={"space-between"}>
                        <TouchableOpacity onPress={() => onSheetHandle("absensi")} style={{flex: 1}}>
                            <HStack p={2} bg={appcolor.box[mode]} alignItems={"center"} rounded={"md"} shadow={2}>
                                <ArchiveTick size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={14}>
                                    Riwayat Checklog
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onSheetHandle("lembur")} style={{flex: 1}}>
                            <HStack p={2} bg={appcolor.box[mode]} alignItems={"center"} rounded={"md"} shadow={2}>
                                <NoteFavorite size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={14}>
                                    Aktual Jam Kerja
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                    </HStack>

                    { sheet.absensi && <ListAbsensi focusSheet={sheet.absensi} openFilter={filterAbsensi} setFilter={setFilterAbsensi}/> }
                    { sheet.lembur && <ListAktualKerja  focusSheet={sheet.lembur} openFilter={filterAktualKerja} setFilter={setFilterAktualKerja}/> }
                    
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ApprovalAbsensiPage