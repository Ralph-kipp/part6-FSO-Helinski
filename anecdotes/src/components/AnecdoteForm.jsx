import { useAnecdoteActions } from "../store"

const AnecdoteForm = () => {
  const { create } = useAnecdoteActions()

  const onCreate = (e) => {
    e.preventDefault()
    const content = e.target.anecdote.value.trim()
    if (content) create(content)        // ignore empty submissions
    e.target.reset()
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={onCreate}>
        <div>
          <input name="anecdote" data-testid="new" />
        </div>
        <button>create</button>
      </form>
    </>
  )
}

export default AnecdoteForm
