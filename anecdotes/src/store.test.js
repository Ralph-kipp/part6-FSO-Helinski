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

describe('store initialization', () => {
  beforeEach(() => {
    useAnecdoteStore.setState({ anecdotes: [], filter: '' })
    vi.clearAllMocks()
  })

  it('initialize loads the anecdotes returned by the backend', async () => {
    const backendAnecdotes = [
      { id: '2', content: 'Adding manpower to a late software project makes it later!', votes: 5 },
      { id: '1', content: 'If it hurts, do it more often', votes: 0 },
      { id: '3', content: 'Premature optimization is the root of all evil.', votes: 2 },
    ]
    anecdoteService.getAll.mockResolvedValue(backendAnecdotes)

    const { result: actions } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await actions.current.initialize()
    })

    const { result: anecdotes } = renderHook(() => useAnecdotes())

    expect(anecdotes.current).toHaveLength(3)
    expect(anecdotes.current).toEqual(expect.arrayContaining(backendAnecdotes))
    expect(anecdoteService.getAll).toHaveBeenCalledTimes(1)
  })
})
