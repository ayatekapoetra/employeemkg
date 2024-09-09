import { Image } from 'native-base';

const ICONEQUIPMENT = (type, styles) => {
    switch (type) {
        case "excavator":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/excavator.png')} style={styles || {width: 60, height: 50}}/>
            break;
        case "dumptruck":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/dumptruck.png')} style={styles || {width: 75, height: 70}}/>
            break;
        case "dozer":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/dozer.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "compactor":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/compactor.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "grader":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/grader.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "lighttruck":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/dumptruck.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "lightvehicle":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/lightvehicle.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "Drill":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/Drill.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "Vibro":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/loader.png')} style={styles || {width: 75, height: 50}}/>
            break;
        case "WHEEL LOADER":
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/loader.png')} style={styles || {width: 75, height: 50}}/>
            break;
        default:
            var avatarEquipment = <Image alt='...' resizeMode="contain" source={require('../../assets/images/other-type.png')} style={styles || {width: 75, height: 50}}/>
            break;
    }

    return avatarEquipment
}

export default ICONEQUIPMENT