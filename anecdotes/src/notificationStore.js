import { create } from 'zustand'

let timeoutId   // the running "hide" timer, so a new notification can cancel it

const useNotificationStore = create((set) => ({
  message: '',
  actions: {
    notify: (message) => {
      clearTimeout(timeoutId)   // a second notification gets its own full five seconds
      set(() => ({ message }))
      timeoutId = setTimeout(() => set(() => ({ message: '' })), 5000)
    },
  },
}))

export const useNotification = () => useNotificationStore((state) => state.message)
export const useNotificationActions = () => useNotificationStore((state) => state.actions)
