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
import BackgroundJob from 'react-native-background-actions'
import { Linking, PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time))

BackgroundJob.on('expiration', () => {
  console.log('iOS: I am being closed!');
});

const taskRandom = async taskData => {
  console.log("taskData", taskData);
  if (Platform.OS === "ios") {
    console.log(
      "This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,",
      "geolocalization, etc. to keep your app alive in the background while you excute the JS from this library."
    )
  }
  await new Promise(async resolve => {
    // For loop with a delay
    const { delay } = taskData
    console.log(BackgroundJob.isRunning(), delay)
    for (let i = 0; BackgroundJob.isRunning(); i++) {
      // console.log("Runned -> ", i)
      await BackgroundJob.updateNotification({ taskDesc: "Runned -> " + i })
      await sleep(delay)
    }
  })
}

const options = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask desc',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'exampleScheme://chat/jane',
  parameters: {
    delay: 1000,
  },
};

function handleOpenURL(evt) {
  console.log(evt.url);
  // do something with the url
}

Linking.addEventListener('url', handleOpenURL);


function App(){
  let playing = BackgroundJob.isRunning();
  console.log("playing---", playing);

  /**
   * Toggles the background task
   */
  // const toggleBackground = async () => {
  //   playing = !playing;
  //   if (playing) {
  //     try {
  //       console.log('Trying to start background service');
  //       await BackgroundJob.start(taskRandom, options);
  //       console.log('Successful start!');
  //     } catch (e) {
  //       console.log('Error', e);
  //     }
  //   } else {
  //     console.log('Stop background service');
  //     await BackgroundJob.stop();
  //   }
  // };

  useMemo(() => {
    BackgroundJob.start(taskRandom, options);
  }, [])

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
