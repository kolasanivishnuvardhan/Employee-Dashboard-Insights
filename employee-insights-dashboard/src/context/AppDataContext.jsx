import { createContext, useContext, useMemo, useState } from 'react'

const MERGED_IMAGE_KEY = 'employee_dashboard_merged_image'

const AppDataContext = createContext(null)

function readMergedImage() {
  return window.localStorage.getItem(MERGED_IMAGE_KEY) ?? ''
}

export function AppDataProvider({ children }) {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [mergedImage, setMergedImageState] = useState(readMergedImage)

  const setMergedImage = (imageDataUrl) => {
    setMergedImageState(imageDataUrl)
    window.localStorage.setItem(MERGED_IMAGE_KEY, imageDataUrl)
  }

  const value = useMemo(
    () => ({
      employees,
      setEmployees,
      selectedEmployee,
      setSelectedEmployee,
      mergedImage,
      setMergedImage,
    }),
    [employees, selectedEmployee, mergedImage],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider')
  }
  return context
}
