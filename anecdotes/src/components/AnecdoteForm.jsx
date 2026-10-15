import { useAnecdoteActions } from "../store"

const AnecdoteForm = () => {
  const { create } = useAnecdoteActions()

  const onCreate = async (e) => {
    e.preventDefault()
    const form = e.target
    const content = form.anecdote.value.trim()
    if (content) await create(content)  // ignore empty submissions
    form.reset()
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
