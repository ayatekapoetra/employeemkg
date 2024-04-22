import AsyncStorage from '@react-native-async-storage/async-storage';

const themeManager = {
    get: async () => {
      try {
            let val = await AsyncStorage.getItem("@color-mode")
            if (val) {
                return val
            }else{
                return "dark"
            }
      } catch (e) {
            return
      }
    },
    set: async value => {
        try {
            await AsyncStorage.setItem("@color-mode", value)
        } catch (e) {
            console.log(e)
        }
    }
}

export default themeManager