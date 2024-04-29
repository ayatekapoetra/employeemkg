import { View } from 'react-native'
import React from 'react'
import { Button, Center, HStack, Text } from 'native-base'
import { Dislike, Like1 } from 'iconsax-react-native'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'

const ButtonVerifyApprove = ( { mode, data, verifyAction, approvalAction, rejectAction } ) => {
    const { user } = useSelector(state => state.auth)
    if(!data.verify_sts){
        return (
            <Button onPress={verifyAction} flex={1} bg={appcolor.teks[mode][3]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Verify Kehadiran</Text>
                </HStack>
            </Button>
        )
    }else if(
        ['developer', 'administrator', 'hrd'].includes(user.usertype) && 
        data.verify_sts == "A" && 
        !data.approve_sts){
        return (
            <>
            <Button onPress={rejectAction} w={"1/4"} mr={2} bg={appcolor.teks[mode][5]}>
                <HStack space={1} alignItems={"center"}>
                    <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Tolak</Text>
                </HStack>
            </Button>
            <Button onPress={approvalAction} flex={1} bg={appcolor.teks[mode][6]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Approve Kehadiran</Text>
                </HStack>
            </Button>
            </>
        )
    }else{
        return (
            <Button disabled flex={1} bg={appcolor.teks[mode][2]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Approve Kehadiran</Text>
                </HStack>
            </Button>
        )
    }
}

export default ButtonVerifyApprove