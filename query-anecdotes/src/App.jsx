import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import { getAnecdotes, updateAnecdote } from './requests'

const App = () => {
  const queryClient = useQueryClient()

  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    // Optimistic update: show the new vote count right away, so a second
    // click computes its count from the already increased value.
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ['anecdotes'] })
      queryClient.setQueryData(['anecdotes'], (anecdotes) =>
        anecdotes.map((a) => (a.id === updated.id ? updated : a))
      )
    },
    // Undo only this one vote, then resync with the server. The server
    // response is deliberately not written to the cache on success: a late
    // response must not overwrite a newer local count.
    onError: (error, updated) => {
      queryClient.setQueryData(['anecdotes'], (anecdotes) =>
        anecdotes.map((a) =>
          a.id === updated.id ? { ...a, votes: a.votes - 1 } : a
        )
      )
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
    },
  })

  const handleVote = (anecdote) => {
    updateAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 })
  }

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1,
  })

  if (result.isPending) {
    return <div>loading data...</div>
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>
  }

  const anecdotes = result.data

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
