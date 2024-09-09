import { TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Center } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { Courthouse, House2, Warning2 } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import SheetBisnisUnit from '../../components/SheetBisnisUnit'
import apiFetch from '../../helpers/ApiFetch'
import { login } from '../../redux/authSlice'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LingkupKerja = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [ open, setOpen ] = useState(false)
    const [ state, setState ] = useState({
        id: user?.bisnis_id,
        name: user?.nm_bisnis
    })

    const onOpen = () => setOpen(true)
    const onClose = () => setOpen(false)

    const onSelected = async (value) => {
        setOpen(false)
        try {
            const resp = await apiFetch.post('bisnis-unit/' + value.id + '/change')
            console.log(resp);
            if(resp.status === 201){
                dispatch(login.fulfilled({
                    data: {
                        type: "",
                        token: null
                    },
                    user: null
                }))

                const keys = (await AsyncStorage.getAllKeys()).filter( f => f != "@DEVICESID")
                await AsyncStorage.multiRemove(keys)
            }
        } catch (error) {
            console.log(error);
        }

        route.goBack()

    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Ubah Lingkup Kerja"} onBack={true} />
                <VStack px={3}>
                    <TouchableOpacity onPress={onOpen}>
                        <HStack 
                            p={3}
                            space={2}
                            rounded={'md'}
                            borderWidth={.5} 
                            alignItems={'center'}
                            borderColor={appcolor.line[mode][1]}>
                            <Courthouse size="40" color="#787b83" variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][4]}>
                                    Lingkup Kerja Saat Ini :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { state?.name }
                                </Text>
                            </VStack>
                        </HStack>
                    </TouchableOpacity>
                    {
                        open &&
                        <SheetBisnisUnit isOpen={open} onClose={onClose} onSelected={onSelected}/>
                    }
                </VStack>
                <Center p={5}>
                    <HStack mb={3} space={1} alignItems={'center'}>
                        <Warning2 size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                        <Text 
                            fontSize={20}
                            fontFamily={'Poppins-Regular'}
                            color={appcolor.teks[mode][3]}>
                            Perhatian !!!
                        </Text>
                    </HStack>
                    <Text 
                        fontSize={14}
                        textAlign={'center'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][1]}>
                        Dengan mengganti working space (lingkup kerja) anda, 
                        akan otomatis melakukan login ulang untuk penyesuaian data 
                        pada aplikasi ini sesuai dengan lingkup kerja yang anda pilih...
                    </Text>
                </Center>
            </VStack>
        </AppScreen>
    )
}

export default LingkupKerja