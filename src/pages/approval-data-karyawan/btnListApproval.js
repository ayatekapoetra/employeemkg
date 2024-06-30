import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { HStack, Text, VStack } from 'native-base'
import appcolor from '../../common/colorMode'
import { useNavigation } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'

const BtnListApproval = ({mode, item}) => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [ state, setState ] = useState(item)

    useEffect(() => {
        getDataApi()
    }, [])
    
    const getDataApi = async () => {
        try {
            const resp = await apiFetch(`mobile-employee-approval-permission/${item.id}/show`)
            const { data } = resp.data
            setState({...state, usertype: data.usertype, title: data.title, subtitle: data.subtitle})
        } catch (error) {
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: error?.code,
                subtitle: error.response?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const navigateScreen = () => {
        const permission = state.authorized === 'all'
        if(permission){
            if(state.uri){
                if((state?.usertype).includes(user.usertype)){
                    route.navigate(state.uri)
                }else{
                    route.navigate('unauthorized-screen', state.usertype)
                }
            }else{
                route.navigate('under-development-screen')
            }
        }else{
            if(state.uri){
                if((state?.usertype).includes(user.usertype)){
                    route.navigate(state.uri)
                }else{
                    route.navigate('unauthorized-screen', state.usertype)
                }
            }else{
                route.navigate('under-development-screen')
            }
        }
    }

    // console.log(state);

    return (
        <TouchableOpacity onPress={navigateScreen}>
            <HStack 
                mb={2} 
                py={3} 
                px={2} 
                space={2} 
                bg={appcolor.box[mode]}
                borderWidth={1} 
                borderColor={appcolor.line[mode][2]} 
                borderStyle={'dashed'} 
                alignItems={'center'}
                rounded={'md'}>
                {state.icon}
                <VStack flex={1}>
                    <Text 
                        fontFamily={'Poppins-SemiBold'}
                        color={appcolor.teks[mode][1]}>
                        {state.title}
                    </Text>
                    <Text 
                        fontSize={12}
                        lineHeight={'xs'}
                        fontFamily={'Quicksand-Light'}
                        color={appcolor.teks[mode][1]}>
                        {state.subtitle}
                    </Text>
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}

export default BtnListApproval