import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('./services/anecdotes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import useAnecdoteStore, { useAnecdotes } from './store'

// deliberately NOT sorted by votes
const unsorted = [
  { id: 'a', content: 'Low', votes: 1 },
  { id: 'b', content: 'Top', votes: 9 },
  { id: 'c', content: 'Zero', votes: 0 },
  { id: 'd', content: 'Middle', votes: 4 },
]

describe('anecdote sorting', () => {
  beforeEach(() => {
    useAnecdoteStore.setState({ anecdotes: [], filter: '' })
    vi.clearAllMocks()
  })

  it('useAnecdotes returns the anecdotes sorted by votes, highest first', () => {
    useAnecdoteStore.setState({ anecdotes: unsorted })

    const { result } = renderHook(() => useAnecdotes())

    expect(result.current.map(a => a.id)).toEqual(['b', 'd', 'a', 'c'])
    expect(result.current.map(a => a.votes)).toEqual([9, 4, 1, 0])
  })

  it('sorting does not mutate the anecdotes in the store', () => {
    useAnecdoteStore.setState({ anecdotes: unsorted })

    renderHook(() => useAnecdotes())

    expect(useAnecdoteStore.getState().anecdotes.map(a => a.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('the hook result is sorted again after the votes change in the store', () => {
    useAnecdoteStore.setState({ anecdotes: unsorted })
    const { result } = renderHook(() => useAnecdotes())

    act(() => {
      useAnecdoteStore.setState({
        anecdotes: unsorted.map(a => (a.id === 'c' ? { ...a, votes: 20 } : a)),
      })
    })

    expect(result.current.map(a => a.id)).toEqual(['c', 'b', 'd', 'a'])
  })
})
