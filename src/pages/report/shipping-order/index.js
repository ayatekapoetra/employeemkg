import { TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import FilterShipping from './filter'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import TabBarShipping from '../../../components/TabBarShipping'
import RenderItemBox from './item-box'
import RenderItemList from './item-list'
import RenderItemChart from './item-chart'


const data = [
    {id: 1, nmgudang: 'Patene', bgColor: 'warning.500', fooColor: 'warning.100'}, 
    {id: 2, nmgudang: 'Kolonodale', bgColor: 'darkBlue.500', fooColor: 'darkBlue.100'},
    {id: 3, nmgudang: 'Torete', bgColor: 'emerald.500', fooColor: 'emerald.100'},
    {id: 4, nmgudang: 'Motui', bgColor: 'purple.500', fooColor: 'purple.100'},
]

const ShippingMonitoring = () => {
    const mode = useSelector(state => state.themes.value)
    const isDark = mode === 'dark'
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ tabulator, setTabulator ] = useState({card: true, list: false, chart: false})

    const onChangeTabScreen = (value) => {
        switch (value) {
            case 'card':
                setTabulator({card: true, list: false, chart: false})
                break;
            case 'list':
                setTabulator({card: false, list: true, chart: false})
                break;
            default:
                setTabulator({card: false, list: false, chart: true})
                break;
        }
    }
    
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Shipping Monitoring"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                {
                    openFilter ?
                    <FilterShipping/>
                    :
                    <VStack flex={1} space={2} px={3}>
                        <TabBarShipping onPressTab={onChangeTabScreen}/>
                        {
                            tabulator.card &&
                            <FlatList 
                                data={data}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <RenderItemBox item={item} mode={mode}/>}
                                keyExtractor={item => item.id}/>
                        }
                        {
                            tabulator.list &&
                            <FlatList 
                                data={data}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <RenderItemList item={item} mode={mode}/>}
                                keyExtractor={item => item.id}/>
                        }
                        {
                            tabulator.chart &&
                            <FlatList 
                                data={data}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <RenderItemChart item={item} mode={mode}/>}
                                keyExtractor={item => item.id}/>
                        }
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ShippingMonitoring