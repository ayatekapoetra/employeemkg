/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import "react-native-devsettings";
import "react-native-devsettings/withAsyncStorage";

import 'react-native-gesture-handler';
import React, { useEffect, useMemo } from 'react';
import { NativeBaseProvider } from "native-base";
import RootNavigation from './src/routes';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { getUniqueId } from 'react-native-device-info'
import AsyncStorage from "@react-native-async-storage/async-storage";

function App(){

  useEffect(() => {
    getUniqueId().then( async (uniqueId) => {
      await AsyncStorage.setItem("@DEVICESID", uniqueId)
    });

  }, [])

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <RootNavigation/>
      </NativeBaseProvider>
    </Provider>
  );
}

export default App;
