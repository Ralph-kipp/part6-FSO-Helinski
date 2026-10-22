
import { create } from 'zustand'
import anecdoteService from './services/anecdotes'

const useAnecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',
  actions: {
    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set(() => ({ anecdotes }))
    },
    setFilter: value => set(() => ({ filter: value })),
    vote: async (id) => {
      const anecdote = get().anecdotes.find(a => a.id === id)
      const updated = { ...anecdote, votes: anecdote.votes + 1 }

      // update the page first, so a quick second click builds on this vote instead of overwriting it
      set(state => ({ anecdotes: state.anecdotes.map(a => a.id === id ? updated : a) }))

      try {
        await anecdoteService.update(id, updated)
      } catch (error) {
        // saving failed: take back only this one vote
        set(state => ({
          anecdotes: state.anecdotes.map(a => a.id === id ? { ...a, votes: a.votes - 1 } : a)
        }))
        throw error
      }
    },
    create: async (content) => {
      const newAnecdote = await anecdoteService.createNew(content)
      set(state => ({ anecdotes: state.anecdotes.concat(newAnecdote) }))
    },
    remove: async (id) => {
      await anecdoteService.remove(id)
      set(state => ({ anecdotes: state.anecdotes.filter(a => a.id !== id) }))
    },
  },
}))

export const useAnecdotes = () => {
  const anecdotes = useAnecdoteStore((state) => state.anecdotes)
  const filter = useAnecdoteStore((state) => state.filter)

  // filtering happens here, outside the selectors, so the selectors keep returning stable values
  return anecdotes.filter(a => a.content.toLowerCase().includes(filter.toLowerCase()))
}
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)

export default useAnecdoteStore
