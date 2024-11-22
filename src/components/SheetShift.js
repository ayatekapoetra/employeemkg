import React from 'react'
import { Actionsheet, Center, Divider, Text, VStack } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'

const dataShift = [
    {id: 1, kode: 'I', nama: 'Shift 1', narasi: 'Shift Kerja Pagi'},
    {id: 2, kode: 'II', nama: 'Shift 2', narasi: 'Shift Kerja Malam'},
]

const SheetShift = ( { isOpen, onClose, onSelected } ) => {
    const mode = useSelector(state => state.themes.value)
    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content>
                <Center py={2}>
                    <Text fontFamily={'Abel-Regular'} fontSize={18}>Pilih Shift Kerja</Text>
                </Center>
                <Divider/>
                { 
                    dataShift?.map( m => {
                        return(
                            <Actionsheet.Item key={m.id} onPress={() => onSelected(m)}>
                                <VStack>
                                    <Text fontSize={18} fontWeight={'semibold'} fontFamily={'Poppins-Regular'}>{m.nama}</Text>
                                    <Text mt={-1} fontFamily={'Farsan-Regular'}>{m.narasi}</Text>
                                </VStack>
                            </Actionsheet.Item>
                        )
                    }) 
                }
                <Actionsheet.Item onPress={onClose}>
                    <Text color={appcolor.teks[mode][5]} fontSize={'lg'} fontWeight={'bold'}>Batal</Text>
                </Actionsheet.Item>
            </Actionsheet.Content>
        </Actionsheet>
    )
}

export default SheetShift