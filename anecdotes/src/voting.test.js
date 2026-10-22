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

import anecdoteService from './services/anecdotes'
import useAnecdoteStore, { useAnecdotes, useAnecdoteActions } from './store'

const originals = [
  { id: '1', content: 'Zero votes so far', votes: 0 },
  { id: '2', content: 'Two votes so far', votes: 2 },
  { id: '3', content: 'Five votes so far', votes: 5 },
]

const findInStore = (id) => useAnecdoteStore.getState().anecdotes.find(a => a.id === id)

describe('voting', () => {
  beforeEach(() => {
    useAnecdoteStore.setState({ anecdotes: originals, filter: '' })
    vi.clearAllMocks()
  })

  it('vote increases the vote count of that anecdote by one', async () => {
    anecdoteService.update.mockResolvedValue({ ...originals[1], votes: 3 })
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.vote('2')
    })

    expect(findInStore('2').votes).toBe(3)

    const { result: list } = renderHook(() => useAnecdotes())
    expect(list.current.find(a => a.id === '2').votes).toBe(3)
  })

  it('vote saves the new vote count to the backend', async () => {
    anecdoteService.update.mockResolvedValue({ ...originals[1], votes: 3 })
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.vote('2')
    })

    expect(anecdoteService.update).toHaveBeenCalledTimes(1)
    expect(anecdoteService.update).toHaveBeenCalledWith('2', { ...originals[1], votes: 3 })
  })

  it('voting changes only the voted anecdote', async () => {
    anecdoteService.update.mockResolvedValue({ ...originals[1], votes: 3 })
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.vote('2')
    })

    expect(findInStore('1')).toEqual(originals[0])
    expect(findInStore('3')).toEqual(originals[2])
    expect(useAnecdoteStore.getState().anecdotes).toHaveLength(3)
  })

  it('two votes fired back to back both count', async () => {
    anecdoteService.update.mockResolvedValue({})
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await Promise.all([result.current.vote('2'), result.current.vote('2')])
    })

    expect(findInStore('2').votes).toBe(4)
    expect(anecdoteService.update).toHaveBeenCalledTimes(2)
  })

  it('a failed save takes the vote back', async () => {
    anecdoteService.update.mockRejectedValue(new Error('save failed'))
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await expect(result.current.vote('2')).rejects.toThrow('save failed')
    })

    expect(findInStore('2').votes).toBe(2)
    expect(findInStore('2')).toEqual(originals[1])
  })
})
