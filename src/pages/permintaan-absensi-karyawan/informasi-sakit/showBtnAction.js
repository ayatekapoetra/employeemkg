import { View } from 'react-native'
import React from 'react'
import { Button, HStack, Text } from 'native-base'
import { Like1, Trash } from 'iconsax-react-native'
import apiFetch from '../../../helpers/ApiFetch'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../../../common/colorMode'
import { applyAlert } from '../../../redux/alertSlice'
import { useNavigation } from '@react-navigation/native'

const ShowBtnAction = ( { data, user } ) => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)

    const onApprovedHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/permohonan-izin-sakit/${data.id}/approval`, data)
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "ERR_POST",
                    subtitle: resp.data.diagnostic.message || "Error post data..."
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp.data.diagnostic.message || "Success post data..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }

    const onUpdateHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/permohonan-izin-sakit/${data.id}/update`, data)
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "ERR_POST",
                    subtitle: resp.data.diagnostic.message || "Error post data..."
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp.data.diagnostic.message || "Success post data..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }

    const onDestroyHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/permohonan-izin-sakit/${data.id}/destroy`)
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "ERR_POST",
                    subtitle: resp.data.diagnostic.message || "Error post data..."
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp.data.diagnostic.message || "Success post data..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }

    if(data.karyawan_id === user.karyawan.id && !data.approved_at){
        return (
            <HStack space={1} mt={2}>
                <Button onPress={onDestroyHandle} w={"25%"} bg={appcolor.teks[mode][5]}>
                    <HStack space={1} alignItems={"center"}>
                        <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                    </HStack>
                </Button>
                <Button onPress={onUpdateHandle} flex={1} bg={appcolor.teks[mode][3]}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Update Persetujuan</Text>
                    </HStack>
                </Button>
            </HStack>
        )
    }else if(data.karyawan_id === user.karyawan.id && data.approved_at){
        return (
            <HStack space={1} mt={2}>
                <Button disabled w={"25%"} bg={"#fda4af"}>
                    <HStack space={1} alignItems={"center"}>
                        <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                    </HStack>
                </Button>
                <Button disabled flex={1} bg={"#fed7aa"}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Menunggu Persetujuan</Text>
                    </HStack>
                </Button>
            </HStack>
        )
    }else if(["developer", "administrator", "hrd", "pjo"].includes(user.usertype) && !data.approved_at){
        return (
            <HStack space={1} mt={2}>
                <Button onPress={onDestroyHandle} w={"25%"} bg={appcolor.teks[mode][5]}>
                    <HStack space={1} alignItems={"center"}>
                        <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                    </HStack>
                </Button>
                <Button onPress={onApprovedHandle} flex={1} bg={appcolor.teks[mode][3]}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Form Persetujuan</Text>
                    </HStack>
                </Button>
            </HStack>
        )
    }else if(["developer", "administrator", "hrd", "pjo"].includes(user.usertype) && data.approved_at){
        return (
            <HStack space={1} mt={2}>
                <Button disabled flex={1} bg={appcolor.teks[mode][2]}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Form Disetujui</Text>
                    </HStack>
                </Button>
            </HStack>
        )
    }
}

export default ShowBtnAction