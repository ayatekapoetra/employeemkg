/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {DevSettings, NativeModules} from 'react-native';

const addDebugMenuItems = async () => {
    const message = {
      stop: '(*) Stop Debugging',
      debug: '(*) Debug JS Remotely',
    };
  
    DevSettings.addMenuItem(message.debug, () => {
      NativeModules.DevSettings.setIsDebuggingRemotely(true);
    });
    DevSettings.addMenuItem(message.stop, () => {
      NativeModules.DevSettings.setIsDebuggingRemotely(false);
    });
  };
  
  export const enableDebugging = async () => {
    setTimeout(addDebugMenuItems, 100);
  };

AppRegistry.registerComponent(appName, () => App);

// DISABLED FONT SCALING SYSTEM
if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.allowFontScaling = false;
}
