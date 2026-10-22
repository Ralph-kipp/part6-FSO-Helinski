export const getAnecdotes = async () => {
  const response = await fetch('http://localhost:3001/anecdotes')

  if (!response.ok) {
    throw new Error('Failed to fetch anecdotes')
  }

  return await response.json()
}

export const createAnecdote = async (newAnecdote) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAnecdote),
  }

  const response = await fetch('http://localhost:3001/anecdotes', options)

  if (!response.ok) {
    // The server explains a rejection in its JSON body; the body may be
    // missing or not JSON, so fall back to a generic message.
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Failed to create anecdote')
  }

  return await response.json()
}

export const updateAnecdote = async (updatedAnecdote) => {
  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAnecdote),
  }

  const response = await fetch(
    `http://localhost:3001/anecdotes/${updatedAnecdote.id}`,
    options
  )

  if (!response.ok) {
    throw new Error('Failed to update anecdote')
  }

  return await response.json()
}
