
import { create } from 'zustand'
import anecdoteService from './services/anecdotes'

const getId = () => (100000 * Math.random()).toFixed(0)

const useAnecdoteStore = create((set) => ({
  anecdotes: [],
  filter: '',
  actions: {
    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set(() => ({ anecdotes }))
    },
    setFilter: value => set(() => ({ filter: value })),
    vote: id => set(state => ({
      anecdotes: state.anecdotes.map(a => a.id === id ? { ...a, votes: a.votes + 1 } : a)
    })),
    create: content => set(state => {
      let id = getId()
      while (state.anecdotes.some(a => a.id === id)) id = getId()   // keep ids unique
      return { anecdotes: state.anecdotes.concat({ id, content, votes: 0 }) }
    }),
  },
}))

export const useAnecdotes = () => {
  const anecdotes = useAnecdoteStore((state) => state.anecdotes)
  const filter = useAnecdoteStore((state) => state.filter)

  // filtering happens here, outside the selectors, so the selectors keep returning stable values
  return anecdotes.filter(a => a.content.toLowerCase().includes(filter.toLowerCase()))
}
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)
