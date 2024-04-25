import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AlertDialog, Button, Center, Text } from 'native-base'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const AppAlertDevice = () => {
    const route = useNavigation()
    const cancelRef = React.useRef(null)
    const { user } = useSelector(state => state.auth)
    const [device, setDevice] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        checkDeviceHandle()
    }, [])

    const onClose = () => {
        setIsOpen(false)
        route.goBack()
    }

    const checkDeviceHandle = async () => {
        const uuid = await AsyncStorage.getItem("@DEVICESID")
        setDevice(uuid)
        console.log("UUID ", uuid);
        if(uuid){
            if(uuid === user.device_id){
                setIsOpen(false)
            }else{
                setIsOpen(true)
            }
        }
    }

    return (
        <Center>
            <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                <AlertDialog.Content>
                    <AlertDialog.CloseButton />
                    <AlertDialog.Header>
                        Peringatan
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                        <Text fontSize={11}>
                            {device}
                        </Text>
                        ID Perangkat anda tidak terdaftar dalam database system.
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                        <Button colorScheme="danger" onPress={onClose} size={"sm"}>
                            Kembali
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog>
        </Center>
    )
}

export default AppAlertDevice