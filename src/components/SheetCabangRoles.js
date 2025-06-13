import { FlatList, TextInput, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, Center, Divider, HStack, Input, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'

const { height } = Dimensions.get('screen')

const SheetCabangRoles = ( { isOpen, onClose, onSelected } ) => {
    const roles = useSelector(state => state.roles.data)
    const [ state, setState ] = useState(roles?.map( m => ({...m, visible: true})))
    const mode = useSelector(state => state.themes.value)

    // const searchDataHandle = (teks) => {
    //     if(teks){
    //         setState(state.map(m => (`/${m.cabang}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
    //     }else{
    //         setState(state?.map( m => ({...m, visible: true})))
    //     }
    // }


    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Actionsheet isOpen={isOpen} onClose={onClose}>
                <Actionsheet.Content style={{height: height * .5}}>
                    <FlatList 
                        data={state} 
                        keyExtractor={i => i.id}
                        renderItem={( { item } ) => <RenderItemComponent item={item} onSelected={onSelected}/>}/>
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
        </TouchableWithoutFeedback>
    )
}

export default SheetCabangRoles

const RenderItemComponent = ( { item, onSelected } ) => {
    if(item.visible){
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
                    <VStack>
                        <Text 
                            fontSize={20} 
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}>
                            {item.cabang}
                        </Text>
                    </VStack>
                </Actionsheet.Item>
            </HStack>
        )
    }
}