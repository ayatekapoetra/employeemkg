import React, { useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, StatusBar } from 'react-native';

const AnimatedFlatList = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [sectionHeights, setSectionHeights] = useState({});

  console.log(sectionHeights);
  

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100], // Jarak scroll untuk animasi
    outputRange: [150, 0], // Header mengecil dari 150 ke 0
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 100], 
    outputRange: [1, 0], // Opasitas menghilang saat scroll mencapai 100px
    extrapolate: 'clamp',
  });

  // Simpan tinggi dari setiap section
  const onSectionLayout = (index, event) => {
    const { height } = event.nativeEvent.layout;
    setSectionHeights((prev) => ({
      ...prev,
      [index]: height,
    }));
  };

  const data = Array.from({ length: 20 }).map((_, i) => `Item ${i + 1}`);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header animasi yang mengecil dan menghilang */}
      <Animated.View style={[styles.header, { height: headerHeight, opacity }]}>
        <Text style={styles.headerText}>Header</Text>
      </Animated.View>

      {/* FlatList yang mendeteksi pergerakan scroll */}
      <Animated.FlatList
        data={data}
        onLayout={(event) => onSectionLayout(index, event)}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingTop: 150 }} // Padding untuk memberi ruang pada header
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 18,
  },
});

export default AnimatedFlatList;