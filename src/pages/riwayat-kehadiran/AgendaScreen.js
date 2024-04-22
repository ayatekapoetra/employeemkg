import { Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, Divider } from 'native-base'
import { Agenda, Calendar, CalendarList } from 'react-native-calendars'
import { CalendarTick } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'

const { height } = Dimensions.get("screen")

const AgendaScreen = ( { isDark, mode } ) => {
    console.log(isDark);
    return (
        <VStack flex={1}>
            <CalendarList
                // Customize the appearance of the calendar
                style={{
                    height: height * .33,
                    backgroundColor: 'transparent'
                    
                }}
                theme={{
                    backgroundColor: 'transparent',
                    monthTextColor: isDark?"#FFF":"#2f313e",
                    calendarBackground: isDark?"#2f313e":"#F5F5F5",
                    dayTextColor: isDark?"#FFF":"#2f313e"
                }}
                // Specify the current date
                current={'2024-04-01'}
                // Callback that gets called when the user selects a day
                onDayPress={day => {
                    console.log('selected day', day);
                }}
                // Mark specific dates as marked
                markedDates={{
                    '2024-04-01': {selected: true, marked: true},
                    '2024-04-02': {selected: true, marked: true},
                    '2024-04-03': {selected: true, marked: true}
                }}
                onVisibleMonthsChange={(months) => {
                    console.log('now these months are visible', months);
                }}
                // Max amount of months allowed to scroll to the past. Default = 50
                pastScrollRange={50}
                // Max amount of months allowed to scroll to the future. Default = 50
                futureScrollRange={50}
                // Enable or disable scrolling of calendar list
                scrollEnabled={true}
                // Enable or disable vertical scroll indicator. Default = false
                showScrollIndicator={true}
            />
            <VStack flex={1} px={3} my={3}>
                <HStack px={3} my={3} borderLeftWidth={5} borderLeftColor={"muted.500"}>
                    <Text 
                        fontSize={16}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Keterangan Absensi
                    </Text>
                </HStack>
                <Divider thickness={"0.5"}/>
                <VStack flex={1}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {
                            [1,2,3,4,5,6,7,8,9,10].map( m => {
                                return(
                                    <HStack 
                                        px={3} 
                                        py={2} 
                                        key={m}
                                        alignItems={"center"} 
                                        justifyContent={"space-between"} 
                                        borderBottomWidth={.5} 
                                        borderBottomStyle={"dashed"}
                                        borderBottomColor={appcolor.line[mode][2]}>
                                        <HStack space={2} alignItems={"center"}>
                                            <CalendarTick size="62" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                            <VStack>
                                                <Text 
                                                    color={appcolor.teks[mode][1]}
                                                    fontFamily={"Quicksand-Regular"}>
                                                    Selasa, 16 April 2024
                                                </Text>
                                                <Text 
                                                    color={appcolor.teks[mode][2]}
                                                    fontFamily={"Quicksand-Regular"}>
                                                    Ayat Ekapoetra
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Text color={appcolor.teks[mode][2]} fontWeight={700} fontFamily={"Poppins-Bold"} fontSize={45}>
                                            H
                                        </Text>
                                    </HStack>
                                )
                            })
                        }
                    </ScrollView>
                </VStack>
            </VStack>
        </VStack>
    )
}

export default AgendaScreen