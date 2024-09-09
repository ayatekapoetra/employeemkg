import React from 'react'
import DatePicker from 'react-native-date-picker'
import { useSelector } from 'react-redux'

const SheetDatePicker = ( { title, mode, open, date, onConfirm, onCancel } ) => {
    const themes = useSelector(state => state.themes.value)
    return (
        <DatePicker
            modal
            mode={mode}
            locale={"ID"}
            open={open}
            date={new Date(date)}
            title={title||'Pilih Tanggal'}
            theme={themes != "dark"?"light":"dark"}
            onConfirm={(date) => onConfirm(date)}
            onCancel={onCancel}
        />
    )
}

export default SheetDatePicker