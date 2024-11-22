import { ArrowCircleDown, ArrowCircleRight } from 'iconsax-react-native';
import moment from 'moment';
import { Center, HStack, VStack, Text as BaseTeks, Badge, Stack } from 'native-base';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, Text, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const AnimateItems = ( { state } ) => {
    const [data, setData] = useState(state.map( m => ({...m, visible: true})));
    const [sectionHeights, setSectionHeights] = useState({});
    const mode = useSelector(state => state.themes.value)
    const isDark = mode === 'dark'
    
    const scrollY = useRef(new Animated.Value(0)).current;
    
    const onSectionLayout = (index, event) => {
        const { height } = event.nativeEvent.layout;
        setSectionHeights((prev) => ({
          ...prev,
          [index]: height,
        }));
    };

    const onVisibilityHandle = (obj) => {
        setData(data.map( m => `${m.no}` === `${obj.no}` ? {...m, visible: !m.visible }:m))
    }
    

    const RenderDetails = ({ item, bgcolor, dotcolor, visible }) => {
        switch (item.status) {
            case 'pickup':
                var status = 'Pickup'
                var tanggal = moment(item.date_pick).format('dddd, DD MMMM YYYY')
                break;
            case 'send':
                var status = 'Delivery'
                var tanggal = moment(item.date_send).format('dddd, DD MMMM YYYY')
                break;
            case 'transit':
                var status = 'Transit'
                var tanggal = moment(item.date_transit).format('dddd, DD MMMM YYYY')
                break;
            default:
                var status = 'Received'
                var tanggal = moment(item.date_received).format('dddd, DD MMMM YYYY')
                break;
        }
        return(
            <HStack p={2} bg={bgcolor} borderTopWidth={1}>
                <Center flex={1}>
                    <BaseTeks fontFamily={'Dosis'} fontWeight={'bold'} fontSize={18}>{item?.qty}</BaseTeks>
                    <BaseTeks mt={-1} fontFamily={'Quicksand'}>{item?.uom}</BaseTeks>
                </Center>
                <VStack flex={3}>
                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                        <BaseTeks fontFamily={'Abel-Regular'} fontSize={14}>{item?.kdpr||''}</BaseTeks>
                        <VStack position={'relative'}>
                            <Badge p={0} h={'20px'} w={'70px'} colorScheme={"blueGray"} rounded={'full'}>{status}</Badge>
                            <Stack 
                                w={3} 
                                h={3} 
                                top={-3} 
                                right={-1} 
                                rounded={'full'} 
                                position={'absolute'} 
                                borderWidth={2}
                                borderColor={bgcolor}
                                bg={dotcolor}/>
                        </VStack>
                    </HStack>
                    <BaseTeks fontFamily={'Poppins'} fontSize={12} lineHeight={'xs'}>{tanggal}</BaseTeks>
                    <BaseTeks fontFamily={'Dosis'} fontSize={16} fontWeight={'bold'} lineHeight={'xs'}>{item?.keterangan||''}</BaseTeks>
                </VStack>
            </HStack>
        )
    }
    const renderSection = ({ item, index }) => {
        
        const animatedTitleStyle = {
        transform: [
            {
            scale: scrollY.interpolate({
                inputRange: [
                    Object.values(sectionHeights)
                    .slice(0, index)
                    .reduce((acc, h) => acc + h, 0), // Total tinggi section sebelumnya
                Object.values(sectionHeights)
                    .slice(0, index + 1)
                    .reduce((acc, h) => acc + h, 0), // Total tinggi section ini + sebelumnya
                ],
                outputRange: [1, 0.5],
                extrapolate: 'clamp',
            }),
            },
        ],
        opacity: scrollY.interpolate({
            inputRange: [
                Object.values(sectionHeights)
                    .slice(0, index)
                    .reduce((acc, h) => acc + h, 0), // Total tinggi section sebelumnya
                Object.values(sectionHeights)
                    .slice(0, index + 1)
                    .reduce((acc, h) => acc + h, 0), // Total tinggi section ini + sebelumnya
            ],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        }),
        };

        const footcolor = item.footerColor
        const dotcolor = item.bodyColor
        const visible = item.visible
        return (
            <VStack 
                mt={2} 
                bg={item.bodyColor} 
                roundedTop={'md'}
                onLayout={(event) => onSectionLayout(index, event)}>
                <HStack pr={2} alignItems={'center'} justifyContent={'space-between'}>
                    <Animated.Text style={[styles.sectionTitle(isDark), animatedTitleStyle]}>
                        {item.nmcabang}
                    </Animated.Text>
                    <TouchableOpacity onPress={() => onVisibilityHandle(item)}>
                        {
                            visible ?
                            <ArrowCircleDown size="28" color="#FFF" variant="Bulk"/>
                            :
                            <ArrowCircleRight size="28" color="#FFF" variant="Bulk"/>
                        }
                    </TouchableOpacity>
                </HStack>
                {
                    item.visible &&
                    <FlatList
                        data={item.items}
                        renderItem={({item}) => <RenderDetails item={item} bgcolor={footcolor} dotcolor={dotcolor}/>}
                        keyExtractor={(items, index) => `${items.id}-${index}`}
                    />
                }
            </VStack>
        );
    };

    return (
        <VStack flex={1}>
            <Animated.FlatList
                data={data}
                keyExtractor={(item) => `${item.no}`}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                renderItem={renderSection}
            />
        </VStack>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
    section: {
        padding: 10,
        marginBottom: 20,
    },
    sectionTitle: (isdark) => ({
        fontFamily: "Dosis",
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        color: isdark?"#fff":"#000"
    }),
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    }
});

export default AnimateItems;