import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AlertDialog, Button, Center, HStack, Text } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import appcolor from '../common/colorMode'
import { CopySuccess, Danger, Warning2 } from 'iconsax-react-native'
import { closeAlert } from '../redux/alertSlice'

const AlertCustom = () => {
    const dispatch = useDispatch()
    const cancelRef = React.useRef(null)
    const myalert = useSelector(state => state.myalert)

    const onClose = () => {
        dispatch(closeAlert())
    }

    return (
        <Center>
            <AlertDialog leastDestructiveRef={cancelRef} isOpen={myalert.show} onClose={onClose}>
                <AlertDialog.Content>
                    <AlertDialog.CloseButton />
                    <AlertDialog.Header p={2}>
                        <HStack space={1} alignItems={"center"}>
                            { myalert.status === "error" && <Danger size="32" color="#f47373" variant="Bulk"/> }
                            { myalert.status === "warning" && <Warning2 size="32" color="#ff8a65" variant="Bulk"/> }
                            { myalert.status === "success" && <CopySuccess size="32" color="#09cd02" variant="Bulk"/> }
                            <Text fontWeight={"semibold"} fontFamily={"Poppins-Regular"}>
                                { myalert.title || "Error" }
                            </Text>
                        </HStack>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                        <Text>{ myalert.subtitle || "???" }</Text>
                    </AlertDialog.Body>
                    <AlertDialog.Footer p={2}>
                        <Button colorScheme={myalert.status} onPress={onClose} size={"sm"}>
                            Kembali
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog>
        </Center>
    )
}

export default AlertCustom