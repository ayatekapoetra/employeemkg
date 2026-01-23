import { Box, Text, HStack, VStack, Center, ScrollView } from 'native-base';
import { Calendar } from 'react-native-calendars';

// Status config matching backend STATUS_MAP
const STATUS_CONFIG = {
  hadir: { bg: '#4CAF50', color: '#4CAF50', label: 'Hadir' },
  terlambat: { bg: '#FF9800', color: '#FF9800', label: 'Telat' },
  cuti: { bg: '#2196F3', color: '#2196F3', label: 'Cuti' },
  izin: { bg: '#9C27B0', color: '#9C27B0', label: 'Izin' },
  sakit: { bg: '#E91E63', color: '#E91E63', label: 'Sakit' },
  absen: { bg: '#F44336', color: '#F44336', label: 'Alpha' },
  null: { bg: 'transparent', color: 'transparent', label: '' }
};

function AttendanceCalendar({ monthData, onDayPress, isDark }) {
  if (!monthData || !monthData.calendar) {
    return (
      <Center py={10}>
        <Text color={isDark ? '#9ca3af' : '#6b7280'}>Tidak ada data</Text>
      </Center>
    );
  }

  const { calendar, monthName } = monthData;

  // Build marked dates from calendar data
  const markedDates = {};
  calendar.forEach((day) => {
    if (day.status && STATUS_CONFIG[day.status]) {
      markedDates[day.date] = {
        customStyles: {
          container: {
            backgroundColor: STATUS_CONFIG[day.status].color + '20', // 20 hex = ~12% opacity
            borderRadius: 8,
            borderWidth: 1,
            borderColor: STATUS_CONFIG[day.status].color + '40', // 40 hex = ~25% opacity
          },
          text: {
            color: isDark ? '#F5F5F5' : '#2f313e',
            fontWeight: '600',
          },
        },
        dots: [
          {
            color: STATUS_CONFIG[day.status].color,
            selectedDotColor: STATUS_CONFIG[day.status].color,
          }
        ],
      };
    } else {
      markedDates[day.date] = {
        customStyles: {
          text: {
            color: isDark ? '#F5F5F5' : '#2f313e',
          },
        },
      };
    }
  });

  // Get current month from calendar data
  const currentMonth = calendar.length > 0 ? calendar[0].date.substring(0, 7) : new Date().toISOString().substring(0, 7);

  const handleDayPress = (day) => {
    const dayData = calendar.find(d => d.date === day.dateString);
    if (dayData && onDayPress) {
      onDayPress(dayData);
    }
  };

  const textColor = isDark ? '#F5F5F5' : '#2f313e';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#2a2c3e' : '#ffffff';

  return (
    <Box bg={cardBg} borderRadius={12} p={4}>
      {/* Month Header */}
      <Text
        fontSize="lg"
        fontFamily="Quicksand-Bold"
        color={textColor}
        textAlign="center"
        mb={4}
      >
        {monthName}
      </Text>

      {/* Calendar */}
      <Calendar
        current={currentMonth}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: subtitleColor,
          selectedDayBackgroundColor: isDark ? '#60a5fa' : '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: isDark ? '#60a5fa' : '#3b82f6',
          dayTextColor: textColor,
          textDisabledColor: isDark ? '#4b5563' : '#d1d5db',
          selectedDotColor: textColor,
          arrowColor: textColor,
          monthTextColor: textColor,
          textDayFontFamily: 'Poppins-Regular',
          textMonthFontFamily: 'Quicksand-Bold',
          textDayHeaderFontFamily: 'Poppins-SemiBold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
          'stylesheet.calendar.header': {
            header: {
              display: 'none',
            },
          },
        }}
        hideArrows={true}
        hideExtraDays={false}
        firstDay={0}
        enableSwipeMonths={false}
        disableMonthArrow={true}
        renderHeader={() => null}
      />
    </Box>
  );
}

function SummaryCard({ summary, isDark }) {
  const textColor = isDark ? '#F5F5F5' : '#2f313e';
  const cardBg = isDark ? '#2a2c3e' : '#ffffff';

  // Use STATUS_CONFIG keys for consistency
  const statusKeys = Object.keys(STATUS_CONFIG).filter(key => key !== 'null');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack
        bg={cardBg}
        borderRadius={12}
        p={4}
        space={4}
      >
        {statusKeys.map((key) => {
          const config = STATUS_CONFIG[key];
          return (
            <VStack key={key} alignItems="center" space={1} minWidth={60}>
              <Box
                width={6}
                height={6}
                borderRadius={3}
                bg={config.color}
              />
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={textColor} textAlign="center">
                {config.label}
              </Text>
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                {summary?.[key] || 0}
              </Text>
            </VStack>
          );
        })}
      </HStack>
    </ScrollView>
  );
}

export { AttendanceCalendar, SummaryCard, STATUS_CONFIG };
