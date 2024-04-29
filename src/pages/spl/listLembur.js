import { TouchableOpacity, FlatList } from 'react-native'
import { useSelector } from 'react-redux';
import { VStack, Text, HStack, Image, Center } from 'native-base';
import { NoteAdd } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react'
import appcolor from '../../common/colorMode'

const ListPerintahLembur = () => {
    const mode = useSelector(state => state.themes).value
    const [ data, setData ] = useState([])

    // useEffect(() => {
    //     getDataApi()
    // }, [])

    // const getDataApi = async () => {
    //     const resp = await fetch("https://jsonplaceholder.typicode.com/comments")
    //     const result = await resp.json();
    //     setData(result)
    // }
    
    console.log(data);
    return (
        <VStack flex={1}>
            <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                <TouchableOpacity>
                    <HStack px={3} py={2} space={2} alignItems={"center"}>
                        <NoteAdd size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
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
            <VStack flex={1} mt={3}>
                {
                    data.length > 0 ?
                    <FlatList
                        data={data}
                        renderItem={({item}) => <Text>{item.body}</Text>}
                        keyExtractor={item => item.id}/>
                        :
                    <Center flex={1} justifyContent={"center"}>
                        <Image 
                            alt='...' 
                            source={require('../../../assets/images/under-development.png')} 
                            resizeMode="contain" 
                            style={{width: "100%", height: 300}}/>
                        <Text 
                            fontSize={16}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][3]}>
                            Fitur Under Development
                        </Text>
                    </Center>
                }
            </VStack>

        </VStack>
    )
}

export default ListPerintahLembur