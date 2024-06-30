import { TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Button, Switch } from 'native-base'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { CalendarSearch, CalendarTick, Dislike, Like1, UserSearch, Verify } from 'iconsax-react-native'
import moment from 'moment'
import KaryawanList from '../../components/KaryawanList'

const { height } = Dimensions.get("screen")

const FilterKehadiran = ({ onApplyFilter, setFilter, dataFilter, setDataFilter }) => {
    const mode = useSelector(state => state.themes).value
    const {user} = useSelector(state => state.auth)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)

    const onResetHandle = () => {
        setDataFilter({
            karywana_id: user.karyawan.id,
            karyawan: user.karyawan,
            dateStart: moment().add(-1, 'day').format("YYYY-MM-DD"),
            dateEnd: moment().format("YYYY-MM-DD")
        })
        setFilter(false)
    }

    console.log(dataFilter);

    return (
        <VStack mx={3} px={3} py={2} flex={1} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
            <VStack h={"75px"}>
                <Text 
                    fontFamily={"Poppins-Regular"}
                    color={appcolor.teks[mode][1]}>
                    Karyawan :
                </Text>
                <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)}>
                    <HStack py={2} space={2} alignItems={"center"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                        <UserSearch size="32" color="#555555" variant="Bulk"/>
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-Bold"}
                            color={appcolor.teks[mode][2]}>
                            { dataFilter?.karyawan?.nama }
                        </Text>
                    </HStack>
                </TouchableOpacity>
            </VStack>
            {
                openKaryawan &&
                <PresenceTransition 
                    style={{height: 500}}
                    visible={openKaryawan} 
                    initial={{opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                    <KaryawanList state={dataFilter} setState={setDataFilter} setOpenKaryawan={setOpenKaryawan}/>
                </PresenceTransition>
            }
            <HStack mt={2}>
                <Button onPress={onResetHandle} w={"1/4"} mr={2} bg={appcolor.teks[mode][2]}>
                    <HStack space={1} alignItems={"center"}>
                        <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                    </HStack>
                </Button>
                <Button onPress={onApplyFilter} flex={1} bg={appcolor.teks[mode][6]}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                    </HStack>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterKehadiran