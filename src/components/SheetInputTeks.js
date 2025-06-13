import { Dimensions, Keyboard, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'
import { FtxToken } from 'iconsax-react-native'

const { height } = Dimensions.get('screen')

const SheetInputTeks = ( { isOpen, onClose, onSelected, title, placeholder } ) => {
    const [ teks, setTeks ] = useState('')
    
    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .5}}>
                <VStack flex={1} w={'full'}>
                    <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                        <HStack mb={3} alignItems={'center'} justifyContent={'space-between'}>
                            <Text fontFamily={'Roboto'} fontWeight={'semibold'}>
                                {title || 'Penjelasan tugas :'}
                            </Text>
                            <Image 
                                alt='dismis-keyboard' 
                                style={{width: 30, height: '100%'}}
                                source={require('../../assets/images/keyboad-dismiss.png')}/>
                        </HStack>
                    </TouchableOpacity>
                    <VStack flex={1} bg={'amber.100'} alignItems={'flex-start'} justifyContent={'flex-start'}>
                        <TextInput 
                            multiline
                            placeholder={placeholder || 'Jelaskan secara terperinci dan detail tugas yang anda berikan sehingga mudah untuk di mengerti dan dilaksanakan'}
                            onChangeText={(teks) => setTeks(teks) } 
                            autoCapitalize="sentences" 
                            maxLength={450}
                            onBlur={() => Keyboard.dismiss()}
                            style={{height: 'auto', width: '100%', padding: 10 , color: "#000"}}/>
                    </VStack>
                </VStack>
                <Actionsheet.Item 
                    p={0} 
                    m={0} 
                    h={'40px'} 
                    onPress={() => onSelected(teks)} 
                    bg={'darkBlue.700'} 
                    rounded={'md'} 
                    alignItems={'center'} 
                    justifyContent={'center'}>
                    <Text color={"#FFF"} fontSize={'lg'} fontWeight={'bold'}>Simpan</Text>
                </Actionsheet.Item>
                </Actionsheet.Content>
        </Actionsheet>
    )
}

export default SheetInputTeks