import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import ListPerintahLembur from './list'
import { NoteFavorite } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import moment from 'moment'
import FilterPerintahLembur from './filterPerintahLembur'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import LoadingHauler from '../../components/LoadingHauler'

const PerintahLemburPage = () => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ data, setData ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        createdby: !["developer", "administrator"].includes(user.usertype) ? user.id : null,
        dateStart: moment().startOf('month').format("YYYY-MM-DD"),
        dateEnd: moment().endOf('month').format("YYYY-MM-DD"),
        karyawan_id: null
    })

    useEffect(() => {
        onGetDataLembur()
    }, [isFocus])

    const onGetDataLembur = async (qstring = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("hrd/perintah-lembur", {params: qstring})
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.response.data.error.message || error.message
            }))
        }
    }

    const onRefreshHandle = () => {
        onGetDataLembur(dataFilter)
    }

    const openFilterHandle = () => {
        setOpenFilter(!openFilter)
    }

    const onApplyFilterHandle = () => {
        onGetDataLembur(dataFilter)
        setOpenFilter(false)
    }

    if(loading){
        return(
            <AppScreen>
                <HeaderScreen title={"Perintah Lembur"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                <LoadingHauler/>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Perintah Lembur"} onBack={true} onThemes={true} onFilter={openFilterHandle} onNotification={true}/>
                { openFilter && <FilterPerintahLembur dataFilter={dataFilter} setDataFilter={setDataFilter} onApplyFilterHandle={onApplyFilterHandle}/> }
                <VStack px={3} flex={1}>
                    {
                        ["developer", "administrator", "headspv", "koordinator", "pengawas"].includes(user.usertype) &&
                        <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                            <TouchableOpacity onPress={() => route.navigate("Create-Perintah-Lembur")}>
                                <HStack px={3} py={2} space={2} alignItems={"center"}>
                                    <NoteFavorite size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={18} 
                                            fontWeight={"semibold"}
                                            fontFamily={"Quicksand-SemiBold"}
                                            color={appcolor.teks[mode][1]}>
                                            Buat Perintah Lembur
                                        </Text>
                                        <Text 
                                            fontSize={12} 
                                            fontWeight={300}
                                            fontFamily={"Poppins-Light"}
                                            color={appcolor.teks[mode][2]}>
                                            Membuat surat perintah lembur karyawan
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                    }
                    <ListPerintahLembur data={data} loading={loading} onRefreshHandle={onRefreshHandle}/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default PerintahLemburPage