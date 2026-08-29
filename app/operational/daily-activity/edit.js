import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import DailyActivityForm from './components/DailyActivityForm'

export default function EditDailyActivityScreen() {
  const { id } = useLocalSearchParams()
  return <DailyActivityForm editId={String(id || '')} />
}
