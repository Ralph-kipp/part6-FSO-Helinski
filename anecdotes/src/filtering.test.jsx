import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, render, screen, fireEvent, cleanup } from '@testing-library/react'

vi.mock('./services/anecdotes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import useAnecdoteStore, { useAnecdotes } from './store'

// deliberately NOT sorted by votes, with "code" in different letter cases
const anecdotes = [
  { id: '1', content: 'Make it work, then make it fast', votes: 2 },
  { id: '2', content: 'Untested CODE is broken code', votes: 3 },
  { id: '3', content: 'Simplicity is the ultimate sophistication', votes: 8 },
  { id: '4', content: 'Real artists ship Code', votes: 7 },
  { id: '5', content: 'There are two hard things in computer science', votes: 1 },
]

describe('anecdote filtering', () => {
  beforeEach(() => {
    useAnecdoteStore.setState({ anecdotes, filter: '' })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('useAnecdotes with the filter code returns only the matching anecdotes sorted by votes', () => {
    useAnecdoteStore.setState({ filter: 'code' })

    const { result } = renderHook(() => useAnecdotes())

    expect(result.current.map(a => a.id)).toEqual(['4', '2'])
  })

  it('the filter ignores letter case', () => {
    useAnecdoteStore.setState({ filter: 'code' })
    const { result: lower } = renderHook(() => useAnecdotes())
    const lowerIds = lower.current.map(a => a.id)

    useAnecdoteStore.setState({ filter: 'CODE' })
    const { result: upper } = renderHook(() => useAnecdotes())

    expect(upper.current.map(a => a.id)).toEqual(lowerIds)
    expect(upper.current).toHaveLength(2)
  })

  it('an empty filter returns all anecdotes and a filter without matches returns none', () => {
    const { result: all } = renderHook(() => useAnecdotes())
    expect(all.current.map(a => a.id)).toEqual(['3', '4', '2', '1', '5'])

    useAnecdoteStore.setState({ filter: 'zzz-no-match' })
    const { result: none } = renderHook(() => useAnecdotes())
    expect(none.current).toEqual([])
  })

  it('AnecdoteList shows only the anecdotes that match the filter in the store', () => {
    useAnecdoteStore.setState({ filter: 'code' })

    render(<AnecdoteList />)

    expect(screen.getByText('Untested CODE is broken code')).toBeTruthy()
    expect(screen.getByText('Real artists ship Code')).toBeTruthy()
    expect(screen.queryByText('Make it work, then make it fast')).toBeNull()
    expect(screen.queryByText('Simplicity is the ultimate sophistication')).toBeNull()
    expect(screen.queryByText('There are two hard things in computer science')).toBeNull()
  })

  it('Filter updates the filter in the store when the user types', () => {
    render(<Filter />)

    fireEvent.change(screen.getByTestId('filter'), { target: { value: 'code' } })

    expect(useAnecdoteStore.getState().filter).toBe('code')
  })

  it('typing in Filter shrinks the list shown by AnecdoteList', async () => {
    render(
      <>
        <Filter />
        <AnecdoteList />
      </>
    )
    expect(screen.getByText('Make it work, then make it fast')).toBeTruthy()

    fireEvent.change(screen.getByTestId('filter'), { target: { value: 'code' } })

    expect(await screen.findByText('Real artists ship Code')).toBeTruthy()
    expect(screen.getByText('Untested CODE is broken code')).toBeTruthy()
    expect(screen.queryByText('Make it work, then make it fast')).toBeNull()
    expect(screen.queryByText('Simplicity is the ultimate sophistication')).toBeNull()
    expect(screen.queryByText('There are two hard things in computer science')).toBeNull()
  })
})
