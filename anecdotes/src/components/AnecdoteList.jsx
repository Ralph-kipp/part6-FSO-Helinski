import { useAnecdotes, useAnecdoteActions } from "../store"
import { useNotificationActions } from "../notificationStore"

const AnecdoteList = () => {
  const anecdotes = useAnecdotes()
  const { vote, remove } = useAnecdoteActions()
  const { notify } = useNotificationActions()

  const handleVote = async (anecdote) => {
    await vote(anecdote.id)
    notify(`you voted '${anecdote.content}'`)   // only reached if the vote succeeded
  }

  const sorted = anecdotes.toSorted((a, b) => b.votes - a.votes)   // sorted copy, store is not mutated

  return (
    <>
      {sorted.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
            {anecdote.votes === 0 && <button onClick={() => remove(anecdote.id)}>delete</button>}
          </div>
        </div>
      ))}
    </>
  )
}

export default AnecdoteList
