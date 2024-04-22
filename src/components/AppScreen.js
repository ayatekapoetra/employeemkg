import { SafeAreaView, StatusBar, useColorScheme } from "react-native";
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import themeManager from "../common/themeScheme";
import { applyTheme } from "../redux/themeSlice";

const AppScreen = ( { children } ) => {
    const themes = useSelector(state => state.themes)
    const isDarkMode = themes?.value === 'dark';
    const backgroundStyle = {
        backgroundColor: themes?.value === 'dark' ? "#2f313e" : "#F5F5F5",
    };

    return (
        <SafeAreaView style={{backgroundColor: themes.value === 'dark'?"#2f313e":"#F5F5F5"}}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}/>
                { children }
        </SafeAreaView>
    );
};

export default AppScreen;