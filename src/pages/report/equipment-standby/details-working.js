import { TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Center, HStack, VStack, View, Text, Actionsheet, Image } from 'native-base'
import { Buildings, Danger, InfoCircle, Map, TagUser, TruckTick, UserSquare } from 'iconsax-react-native'

const DetailsActiveWorking = ( { data } ) => {
    const [ isOpen, setisOpen ] = useState(false)
    const [ dataSheet, setDataSheet ] = useState(null)

    const openSheetHandle = useCallback((value) => {
        console.log(value);
        setDataSheet(value)
        setisOpen(true)
    })

    const onClose = () => setisOpen(false)

    return (
        <VStack>
            <VStack p={5}>
                {
                    data?.map( m => {
                        switch (m.equipment.tipe) {
                            case 'excavator':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/excavator.png')} size={'xs'}/>
                                break;
                            case 'dumptruck':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/dumptruck.png')} size={'xs'}/>
                                break;
                            case 'compactor':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/compactor.png')} size={'xs'}/>
                                break;
                            case 'grader':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/grader.png')} size={'xs'}/>
                                break;
                            case 'lightvehicle':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/lightvehicle.png')} size={'xs'}/>
                                break;
                            case 'Drill':
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/Drill.png')} size={'xs'}/>
                                break;
                            default:
                                var imgUnit = <Image mt={-1} resizeMode='cover' alt={'...'} source={require('../../../../assets/images/other-type.png')} size={'xs'}/>
                                break;
                        }
                        return (
                            <Center key={m.id} position={'absolute'} top={m.imgTop} left={m.imgLeft}>
                                <TouchableOpacity onPress={() => openSheetHandle(m)}>
                                    <HStack space={1} bg={m.bgTitle} px={1} rounded={'full'} alignItems={'center'} borderWidth={1}>
                                        <View h={3} w={3} bg={m.bgDot} rounded={'full'} borderWidth={1} borderColor={'#FFF'}/>
                                        <Text fontWeight={'bold'} fontFamily={'Dosis'} color={'#fff'}>{m.kode}</Text>
                                    </HStack>
                                    { imgUnit }
                                </TouchableOpacity>
                            </Center>
                        )
                    })
                }
            </VStack>
            <Actionsheet isOpen={isOpen} onClose={onClose}>
                <Actionsheet.Content>
                <VStack w={'full'}>
                    <Center my={3}>
                        <Text fontFamily={'Poppins'} fontSize={18} fontWeight={'bold'}>Keterangan Details</Text>
                    </Center>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <TagUser size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Operator/Driver :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.nm_assign}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <TruckTick size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Equipment :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.kode}</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'medium'} fontSize={12} lineHeight={'xs'}>{dataSheet?.model}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <Buildings size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Penyewa :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.penyewa?.nama}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <Map size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Lokasi :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.lokasi?.nama}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <Danger size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Kegiatan :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.kegiatan?.nama}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <InfoCircle size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Status :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.status}</Text>
                        </VStack>
                    </HStack>
                    <HStack py={1} space={1} borderTopWidth={.5} borderTopColor={'#ddd'} alignItems={'center'}>
                        <UserSquare size="32" color="#44403c" variant="Bulk" />
                        <VStack>
                            <Text fontFamily={'Abel-Regular'}>Tugas diberikan oleh :</Text>
                            <Text fontFamily={'Quicksand-Regular'} fontWeight={'bold'} lineHeight={'xs'}>{dataSheet?.creator?.nama_lengkap}</Text>
                        </VStack>
                    </HStack>
                    
                </VStack>
                </Actionsheet.Content>
            </Actionsheet>
        </VStack>
    )
}

export default DetailsActiveWorking