import { FlatList, PermissionsAndroid, Platform } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Text, VStack } from 'native-base'
import { GalleryTick, Camera } from 'iconsax-react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'

const SheetMediaCamera = ( { isOpen, onClose, onSelected } ) => {
    const mode = useSelector(state => state.themes.value)
    const [imageUri, setImageUri] = useState(null);
    const [ data, setData ] = useState([
        {
            id: 1, 
            uri: '',
            reff: 'camera',
            nama: "Gunakan Kamera", 
            narasi: "Klik disini untuk mengambil photo langsung dari kamera \nhandphone anda",
            icon: <Camera size="46" color={'#555555'} variant="Bulk"/>
        },
        {
            id: 2, 
            uri: '',
            reff: 'gallery',
            nama: "Pilih Photo Gallery", 
            narasi: "Klik disini untuk mengambil photo dari gallery \nhandphone anda",
            icon: <GalleryTick size="46" color={'#555555'} variant="Bulk"/>
        },
    ])

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Izin Kamera",
              message: "Aplikasi memerlukan akses ke kamera",
              buttonNeutral: "Tanya Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };
    

    const actionMedia = async (type) => {
        console.log(type);
        if(type.reff == 'camera'){
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;
        
            launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
                if (!response.didCancel && !response.error) {
                    const photoImg = response.assets[0]
                    const uriPhoto = Platform.OS === "android" ? photoImg.uri : photoImg.uri.replace("file://", "")
                    setImageUri(response.assets[0].uri);
                    onSelected({
                        ...photoImg,
                        uri: uriPhoto
                    })
                }
            });
        }else{
            launchImageLibrary({ mediaType: 'photo' }, (response) => {
                if (!response.didCancel && !response.error) {
                    const photoImg = response.assets[0]
                    const uriPhoto = Platform.OS === "android" ? photoImg.uri : photoImg.uri.replace("file://", "")
                    setImageUri(response.assets[0].uri);
                    onSelected({
                        ...photoImg,
                        uri: uriPhoto
                    })
                }
            });
        }
    }

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content>
                {/* <FlatList 
                    data={data} 
                    keyExtractor={i => i.id}
                    renderItem={( { item } ) => <RenderItemComponent item={item} onSelected={onSelected}/>}/> */}

                {
                    data?.map( item => {
                        return (
                            <Actionsheet.Item 
                                p={2} 
                                mx={0} 
                                my={1} 
                                h={'80px'}
                                key={item.id}
                                onPress={() => actionMedia(item)} 
                                rounded={'md'}
                                justifyContent={'center'} 
                                borderWidth={1}
                                borderColor={'#DDD'}>
                                <HStack space={2} alignItems={'center'}>
                                    {item.icon}
                                    <VStack w={'container'}>
                                        <Text color={'black'} fontWeight={'bold'}>{item.nama}</Text>
                                        <Text fontSize={'xs'} fontFamily={'Abel-Regular'}>{item.narasi}</Text>
                                    </VStack>
                                </HStack>
                            </Actionsheet.Item>
                        )
                    })
                }

                <Actionsheet.Item 
                    p={0} 
                    m={0} 
                    h={'40px'} 
                    onPress={onClose} 
                    bg={'#DDD'} 
                    rounded={'md'} 
                    alignItems={'center'} 
                    justifyContent={'center'}>
                    <Text color={appcolor.teks[mode][5]} fontSize={'lg'} fontWeight={'bold'}>Batal</Text>
                </Actionsheet.Item>
            </Actionsheet.Content>
        </Actionsheet>
    )
}

export default SheetMediaCamera

const RenderItemComponent = ( { item, onSelected } ) => {
    return(
        <HStack>
            <Actionsheet.Item 
                p={2} 
                mx={0} 
                my={1} 
                onPress={() => onSelected(item)} 
                rounded={'md'}
                justifyContent={'center'} 
                borderWidth={1}
                borderColor={'#DDD'}>
                <HStack flex={1} space={2}>
                    {item.icon}
                    <VStack w={'4/5'}>
                        <Text fontWeight={'bold'}>{item.nama}</Text>
                        <Text fontSize={'xs'} fontFamily={'Abel-Regular'}>{item.narasi}</Text>
                    </VStack>
                </HStack>
            </Actionsheet.Item>
        </HStack>
    )
}