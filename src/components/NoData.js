import { Dimensions, RefreshControl, ScrollView } from 'react-native'
import { VStack, Text, HStack, Image, Center, Button } from 'native-base'
import { useSelector } from 'react-redux'
import React from 'react'
import appcolor from '../common/colorMode'
import { Filter } from 'iconsax-react-native'

const { width, height } = Dimensions.get("screen")

const NoData = ( { title, subtitle, xheight, onRefresh, loading } ) => {
    const mode = useSelector(state => state.themes.value)
    return (
        <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            style={{height: `${xheight||height}px`}}>
            <VStack bg={appcolor.container[mode]}>
                <Center>
                    <Image source={require('../../assets/images/empty-box.png')} resizeMode='cover' alt='No-data' style={{height: 300, width: width}}/>
                    {
                        title &&
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-SemiBold"}
                            color={appcolor.teks[mode][1]}>
                            { title }
                        </Text>
                    }
                    {
                        subtitle &&
                        <Text 
                            textAlign={"center"}
                            fontSize={15}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            { subtitle }
                        </Text>
                    }
                    <HStack space={1} my={1} alignItems={'center'}>
                        <Filter size="30" color={mode == "dark"?"#efb539":"#4f4c46"}/>
                        <Text 
                            textAlign={"center"}
                            fontSize={15}
                            fontFamily={"Poppins-Regular"}
                            color={mode == "dark"?"#efb539":"#4f4c46"}>
                            Filter Data
                        </Text>
                    </HStack>
                    {
                        onRefresh &&
                        <Button onPress={onRefresh} size={'sm'} colorScheme="success">Refresh</Button>
                    }
                </Center>
            </VStack>
        </ScrollView>
    )
}

export default NoData