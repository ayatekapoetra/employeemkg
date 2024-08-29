const ImgEquipment = (type) => {
    switch (type) {
        case 'excavator':
            return require('../../assets/images/excavator.png')
        case 'dumptruck':
            return require('../../assets/images/dumptruck.png')
        case 'compactor':
            return require('../../assets/images/compactor.png')
        case 'grader':
            return require('../../assets/images/grader.png')
        case 'lightvehicle':
            return require('../../assets/images/lightvehicle.png')
        case 'Drill':
            return require('../../assets/images/Drill.png')
        default:
            return require('../../assets/images/other-type.png')
    }
}

export default ImgEquipment