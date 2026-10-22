import { createContext, useRef, useState } from 'react'

const NotificationContext = createContext()

export const NotificationContextProvider = (props) => {
  const [notification, setNotification] = useState('')
  const timerId = useRef(null)

  const notify = (message) => {
    clearTimeout(timerId.current)
    setNotification(message)
    timerId.current = setTimeout(() => {
      setNotification('')
    }, 5000)
  }

  return (
    <NotificationContext.Provider value={{ notification, notify }}>
      {props.children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
