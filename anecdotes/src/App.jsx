import { useAnecdotes, useAnecdoteActions } from "./store"

const App = () => {
  const anecdotes = useAnecdotes()
  const { vote, create } = useAnecdoteActions()

  const onCreate = (e) => {
    e.preventDefault()
    const content = e.target.anecdote.value.trim()
    if (content) create(content)        // ignore empty submissions
    e.target.reset()
  }

  return (
    <div>
      <h2>Anecdotes</h2>
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
      <h2>create new</h2>
      <form onSubmit={onCreate}>
        <div>
          <input name="anecdote" data-testid="new" />
        </div>
        <button>create</button>
      </form>
    </div>
  )
}

export default App
